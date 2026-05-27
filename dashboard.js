const totalParticipants = document.getElementById('totalParticipants');
const avgScore = document.getElementById('avgScore');
const bestQuestion = document.getElementById('bestQuestion');
const hardQuestion = document.getElementById('hardQuestion');
const resultsTable = document.getElementById('resultsTable');
const clearBtn = document.getElementById('clearBtn');

function loadResults() {
  const results = JSON.parse(localStorage.getItem('iaHumanoResults') || '[]');
  totalParticipants.textContent = results.length;

  if (results.length === 0) {
    avgScore.textContent = '0%';
    bestQuestion.textContent = '-';
    hardQuestion.textContent = '-';
    resultsTable.innerHTML = '<p class="muted">Todavía no hay respuestas registradas en este navegador.</p>';
    return;
  }

  const totalPercent = results.reduce((sum, r) => sum + (r.score / r.total), 0) / results.length;
  avgScore.textContent = `${Math.round(totalPercent * 100)}%`;

  const byQuestion = QUESTIONS.map(q => {
    let correct = 0;
    let iaVotes = 0;
    let humanVotes = 0;
    results.forEach(r => {
      const ans = r.answers.find(a => a.questionId === q.id);
      if (!ans) return;
      if (ans.isCorrect) correct++;
      if (ans.selected === 'IA') iaVotes++;
      if (ans.selected === 'Humano') humanVotes++;
    });
    const percent = Math.round((correct / results.length) * 100);
    return { ...q, correct, iaVotes, humanVotes, percent };
  });

  const best = [...byQuestion].sort((a, b) => b.percent - a.percent)[0];
  const hard = [...byQuestion].sort((a, b) => a.percent - b.percent)[0];
  bestQuestion.textContent = `P${best.id} (${best.percent}%)`;
  hardQuestion.textContent = `P${hard.id} (${hard.percent}%)`;

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
              <td><strong>${q.percent}%</strong></td>
              <td>${q.iaVotes}</td>
              <td>${q.humanVotes}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

clearBtn.addEventListener('click', () => {
  if (confirm('¿Deseas borrar todos los resultados guardados?')) {
    localStorage.removeItem('iaHumanoResults');
    loadResults();
  }
});

loadResults();
