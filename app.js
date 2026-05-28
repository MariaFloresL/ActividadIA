import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

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
const startCard = document.getElementById('startCard');
const quizCard = document.getElementById('quizCard');
const finalCard = document.getElementById('finalCard');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const nextBtn = document.getElementById('nextBtn');
const progressText = document.getElementById('progressText');
const questionType = document.getElementById('questionType');
const questionNumber = document.getElementById('questionNumber');
const questionTitle = document.getElementById('questionTitle');
const questionContent = document.getElementById('questionContent');
const feedback = document.getElementById('feedback');
const finalScore = document.getElementById('finalScore');
const choiceButtons = document.querySelectorAll('.choice-btn');

let current = 0;
let score = 0;
let answers = [];
let locked = false;

function renderQuestion() {
  const q = QUESTIONS[current];
  locked = false;
  progressText.textContent = `${current + 1}/${QUESTIONS.length}`;
  questionType.textContent = q.type;
  questionNumber.textContent = `Pregunta ${current + 1} de ${QUESTIONS.length}`;
  questionTitle.textContent = q.title;
  feedback.textContent = '';
  feedback.className = 'feedback';
  nextBtn.classList.add('hidden');

  if (q.contentType === 'image') {
    questionContent.innerHTML = `<img src="${q.content}" alt="Pregunta visual" />`;
  } else if (q.contentType === 'code') {
    questionContent.innerHTML = `<pre><code>${escapeHtml(q.content)}</code></pre>`;
  } else {
    questionContent.innerHTML = `<blockquote>${escapeHtml(q.content)}</blockquote>`;
  }

  choiceButtons.forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('selected', 'correct', 'wrong');
  });
}

function selectAnswer(selected, btn) {
  if (locked) return;
  locked = true;
  const q = QUESTIONS[current];
  const isCorrect = selected === q.answer;
  if (isCorrect) score++;

  answers.push({
    questionId: q.id,
    selected,
    correct: q.answer,
    isCorrect
  });

  choiceButtons.forEach(b => {
    b.disabled = true;
    if (b.dataset.answer === q.answer) b.classList.add('correct');
  });
  btn.classList.add(isCorrect ? 'correct' : 'wrong');

  feedback.textContent = `${isCorrect ? 'Correcto' : 'Incorrecto'}. Respuesta: ${q.answer}. ${q.explanation}`;
  feedback.classList.add(isCorrect ? 'ok' : 'bad');
  nextBtn.classList.remove('hidden');
}

function finishQuiz() {
  quizCard.classList.add('hidden');
  finalCard.classList.remove('hidden');
  const percent = Math.round((score / QUESTIONS.length) * 100);
  finalScore.textContent = `${score}/${QUESTIONS.length} aciertos (${percent}%)`;
   addDoc(collection(db, "resultados"), {
  date: new Date().toISOString(),
  score,
  total: QUESTIONS.length,
  answers
});
 
}

function resetQuiz() {
  current = 0;
  score = 0;
  answers = [];
  locked = false;
  finalCard.classList.add('hidden');
  startCard.classList.remove('hidden');
  progressText.textContent = `0/${QUESTIONS.length}`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

startBtn.addEventListener('click', () => {
  startCard.classList.add('hidden');
  quizCard.classList.remove('hidden');
  renderQuestion();
});

choiceButtons.forEach(btn => {
  btn.addEventListener('click', () => selectAnswer(btn.dataset.answer, btn));
});

nextBtn.addEventListener('click', () => {
  current++;
  if (current >= QUESTIONS.length) finishQuiz();
  else renderQuestion();
});

restartBtn.addEventListener('click', resetQuiz);
