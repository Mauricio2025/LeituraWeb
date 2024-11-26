// Importação dos módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "leitura-app-b5e79.firebaseapp.com",
  projectId: "leitura-app-b5e79",
  storageBucket: "leitura-app-b5e79.appspot.com",
  messagingSenderId: "565506768986",
  appId: "1:565506768986:web:2aa0734b0eb54eac9f9863",
  measurementId: "G-YLFJ39KQ9L",
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referências aos elementos HTML
const spinner = document.getElementById("spinner");
const welcomePage = document.getElementById("welcomePage");
const usersPage = document.getElementById("usersPage");
const viewUsersBtn = document.getElementById("viewUsersBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userList = document.getElementById("userList");

// Exibe o spinner inicial e, depois de 10 segundos, exibe a tela de boas-vindas
window.addEventListener("load", () => {
  console.log("Carregando página...");
  
  // Garante que todas as telas estão escondidas no início
  welcomePage.classList.add("hidden");
  usersPage.classList.add("hidden");

  // Mostra o spinner por 10 segundos
  setTimeout(() => {
    console.log("Escondendo spinner e exibindo tela de boas-vindas");
    spinner.classList.add("hidden");
    welcomePage.classList.remove("hidden");
  
    // Verificar estilo final da página de boas-vindas
    console.log("WelcomePage estilo:", window.getComputedStyle(welcomePage).display);
  }, 2000); // Ajuste para 2 segundos ou o tempo desejado
  
});

// Navegação para usuários
viewUsersBtn.addEventListener("click", () => {
  console.log("Navegando para a tela de usuários");
  welcomePage.classList.add("hidden");
  usersPage.classList.remove("hidden");
  listUsers();
});

// Voltar à tela inicial
logoutBtn.addEventListener("click", () => {
  console.log("Voltando para a tela de boas-vindas");
  usersPage.classList.add("hidden");
  welcomePage.classList.remove("hidden");
});

// Função para listar usuários
const listUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Users"));
    userList.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const user = doc.data();
      const listItem = document.createElement("li");
      listItem.textContent = `Nome: ${user.name}, Email: ${user.email}`;
      userList.appendChild(listItem);
    });
  } catch (e) {
    console.error("Erro ao buscar usuários:", e);
  }
};
