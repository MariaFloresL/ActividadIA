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

onSnapshot(collection(db,"resultados"),(snapshot)=>{
 let html = "<ul>";

 snapshot.forEach(doc=>{
   const data = doc.data();

   html += `
   <li>
     ${data.pregunta} → <strong>${data.respuesta}</strong>
   </li>
   `;
 });

 html += "</ul>";

 resultadosDiv.innerHTML = html;
});