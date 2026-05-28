import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

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

const resultadosDiv = document.getElementById("resultados");

onSnapshot(collection(db, "resultados"), (snapshot) => {

  let total = 0;
  let aciertos = 0;

  let html = `
    <h2>Total participantes: ${snapshot.size}</h2>
    <ul>
  `;

  snapshot.forEach(doc => {

    const data = doc.data();

    total += data.total;
    aciertos += data.score;

    html += `
      <li>
        <strong>Puntaje:</strong> ${data.score}/${data.total}
      </li>
    `;
  });

  html += "</ul>";

  if(snapshot.size > 0){
    const promedio = Math.round((aciertos / total) * 100);

    html += `
      <h3>Promedio general: ${promedio}%</h3>
    `;
  }

  resultadosDiv.innerHTML = html;
});
