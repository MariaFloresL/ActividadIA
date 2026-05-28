import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, onSnapshot, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCtYm2H8vcoENDFzavbBHm48xzmPxrVCMY",
  authDomain: "ia-o-humano.firebaseapp.com",
  projectId: "ia-o-humano",
  storageBucket: "ia-o-humano.firebasestorage.app",
  messagingSenderId: "957590405837",
  appId: "1:957590405837:web:2c827d9eb4536c15355f84"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const totalParticipants = document.getElementById('totalParticipants');
const avgScore = document.getElementById('avgScore');
const bestQuestion = document.getElementById('bestQuestion');
const hardQuestion = document.getElementById('hardQuestion');
const resultsTable = document.getElementById('resultsTable');
const clearBtn = document.getElementById('clearBtn');

onSnapshot(collection(db, "resultados"), (snapshot) => {
  const results = [];
  snapshot.forEach(docSnap => {
    results.push({ id: docSnap.id, ...docSnap.data() });
  });

  totalParticipants.textContent = results.length;

  if (results.length === 0) {
    avgScore.textContent = '0%';
    bestQuestion.textContent = '-';
    hardQuestion.textContent = '-';
    resultsTable.innerHTML = '<p class="muted">Todavía no hay respuestas registradas.</p>';
    return;
  }

  const totalScore = results.reduce((sum, r) => sum + Number(r.score || 0), 0);
  const totalQuestions = results.reduce((sum, r) => sum + Number(r.total || 0), 0);
  const average = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  avgScore.textContent = `${average}%`;

  const questionStats = {};

  results.forEach(r => {
    if (!Array.isArray(r.answers)) return;

    r.answers.forEach(ans => {
      const questionId = ans.questionId;

      if (!questionStats[questionId]) {
        const questionInfo = Array.isArray(window.QUESTIONS)
          ? window.QUESTIONS.find(q => q.id === questionId)
          : null;

        questionStats[questionId] = {
          id: questionId,
          title: questionInfo ? questionInfo.title : `Pregunta ${questionId}`,
          type: questionInfo ? questionInfo.type : '-',
          answer: ans.correct || '-',
          total: 0,
          correct: 0,
          iaVotes: 0,
          humanVotes: 0
        };
      }

      questionStats[questionId].total++;

      if (ans.isCorrect) questionStats[questionId].correct++;
      if (ans.selected === 'IA') questionStats[questionId].iaVotes++;
      if (ans.selected === 'Humano') questionStats[questionId].humanVotes++;
    });
  });

  const byQuestion = Object.values(questionStats).map(q => ({
    ...q,
    percent: q.total > 0 ? Math.round((q.correct / q.total) * 100) : 0
  })).sort((a, b) => a.id - b.id);

  if (byQuestion.length > 0) {
    const best = [...byQuestion].sort((a, b) => b.percent - a.percent)[0];
    const hard = [...byQuestion].sort((a, b) => a.percent - b.percent)[0];
    bestQuestion.textContent = `P${best.id} (${best.percent}%)`;
    hardQuestion.textContent = `P${hard.id} (${hard.percent}%)`;
  }

  resultsTable.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Pregunta</th>
            <th>Tipo</th>
            <th>Respuesta correcta</th>
            <th>Aciertos</th>
            <th>Votos IA</th>
            <th>Votos Humano</th>
          </tr>
        </thead>
        <tbody>
          ${byQuestion.map(q => `
            <tr>
              <td>P${q.id}: ${q.title}</td>
              <td>${q.type}</td>
              <td>${q.answer}</td>
              <td><strong>${q.percent}%</strong> (${q.correct}/${q.total})</td>
              <td>${q.iaVotes}</td>
              <td>${q.humanVotes}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
});

clearBtn.addEventListener('click', async () => {
  if (!confirm('¿Deseas borrar todos los resultados de Firebase?')) return;

  const snapshot = await getDocs(collection(db, "resultados"));
  const deletions = snapshot.docs.map(d => deleteDoc(doc(db, "resultados", d.id)));
  await Promise.all(deletions);
});
