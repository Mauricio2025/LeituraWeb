// Importação dos módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC6QmbxEx_YbI50E_mfXo19yFnJyDY0reg",
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
const auth = getAuth(app);
const storage = getStorage(app);

// Referências aos elementos HTML
const spinner = document.getElementById("spinner");
const createBookForm = document.getElementById("createBookForm");
const bookList = document.getElementById("bookList");
const searchBookInput = document.getElementById("searchBook");
const searchResults = document.getElementById("searchResults");
const bookTitleInput = document.getElementById("bookTitle");
const bookAuthorInput = document.getElementById("bookAuthor");
const bookGenreInput = document.getElementById("bookGenre");
const bookDescriptionInput = document.getElementById("bookDescription");
const uploadBookFile = document.getElementById("uploadBookFile");
const uploadBookBtn = document.getElementById("uploadBookBtn");
const uploadStatus = document.getElementById("uploadStatus");
const addBookBtn = document.getElementById("addBookBtn");
const cancelBtn = document.getElementById("cancelBtn");
const currentlyReading = document.getElementById("currentlyReading");
const nextReading = document.getElementById("nextReading");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("authForm");
// Função de spinner para exibir enquanto carrega
window.addEventListener("load", () => {
  if (spinner) {
    console.log("Carregando página...");
    setTimeout(() => spinner.classList.add("hidden"), 2000);
  }
});

// Registro de usuário
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, "Users"), { email, createdAt: new Date() });

      Swal.fire({
        icon: "success",
        title: "Registro bem-sucedido!",
        text: "Bem-vindo à nossa plataforma!",
        timer: 3000,
        timerProgressBar: true,
        background: "#1e1e1e",
        color: "#ffca28",
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "./login.html";
      });
    } catch (error) {
      let errorMessage = "Erro ao registrar.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "O e-mail informado já está registrado. Por favor, faça login.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "A senha precisa ter pelo menos 6 caracteres.";
      }
      Swal.fire({
        icon: "error",
        title: "Erro ao registrar!",
        text: errorMessage,
        timer: 3000,
        timerProgressBar: true,
        background: "#1e1e1e",
        color: "#ffca28",
        showConfirmButton: false,
      });
    }
  });
}

// Login de usuário
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    spinner.classList.remove("hidden");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      Swal.fire({
        icon: "success",
        title: "Login bem-sucedido!",
        text: `Bom ter você de volta, ${email}!`,
        timer: 3000,
        timerProgressBar: true,
        background: "#1e1e1e",
        color: "#ffca28",
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "./dashboard.html";
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao fazer login!",
        text: "Credenciais inválidas ou erro na autenticação.",
        timer: 3000,
        timerProgressBar: true,
        background: "#1e1e1e",
        color: "#ffca28",
        showConfirmButton: false,
      });
    } finally {
      spinner.classList.add("hidden");
    }
  });
}

// Estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (!user && !loginForm && !registerForm) {
    window.location.href = "./login.html";
  }
});


// Função para carregar livros do Firestore e exibir
async function loadBooks() {
  try {
    const booksSnapshot = await getDocs(collection(db, "Books"));
    const booksReading = [];
    const booksNext = [];

    booksSnapshot.forEach((doc) => {
      const book = doc.data();
      console.log("Livro encontrado:", book); // Adicione este log para depuração
      if (book.status === "reading") {
        booksReading.push(book);
      } else if (book.status === "next") {
        booksNext.push(book);
      }
    });

    // Preencher as seções de livros
    populateBooks(currentlyReading, booksReading);
    populateBooks(nextReading, booksNext);
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
  }
}


// Função para criar os livros na interface
// function populateBooks(container, books) {
//   books.forEach((book) => {
//     const bookElement = document.createElement("div");
//     if (book.cover) {
//       // Se houver capa, cria uma imagem
//       const img = document.createElement("img");
//       img.src = book.cover;
//       img.alt = book.title;
//       bookElement.appendChild(img);
//     } else {
//       // Se não houver capa, cria um placeholder com o título
//       const placeholder = document.createElement("div");
//       placeholder.classList.add("book-placeholder");
//       placeholder.textContent = book.title;
//       bookElement.appendChild(placeholder);
//     }
//     container.appendChild(bookElement);
//   });
// }

function populateBooks(container, books) {
  books.forEach((book) => {
    const bookElement = document.createElement("div");

    // Apenas exibe o título do livro
    const titleElement = document.createElement("div");
    titleElement.classList.add("book-title"); // Classe opcional para estilizar
    titleElement.textContent = book.title;
    bookElement.appendChild(titleElement);

    // Adiciona o livro no container
    container.appendChild(bookElement);
  });
}


// Chama a função de carregar livros ao iniciar
loadBooks();

// Ação do botão de adicionar livro
if (addBookBtn) {
  addBookBtn.addEventListener("click", () => {
    console.log("Redirecionando para a página de criação de livro...");
    window.location.href = "./createBook.html";
  });
} else {
  console.error("Botão 'Adicionar Livro' não encontrado na Dashboard.");
}

// Função de upload de arquivos para o Firebase Storage
if (uploadBookBtn) {
  uploadBookBtn.addEventListener("click", async () => {
    const file = uploadBookFile.files[0];
    if (!file) {
      uploadStatus.textContent = "Por favor, selecione um arquivo para upload.";
      return;
    }

    // Nome único para o arquivo no Firebase Storage
    const fileName = `${new Date().getTime()}_${file.name}`;
    const storageRef = ref(storage, `books/${fileName}`);

    try {
      uploadStatus.textContent = "Fazendo upload...";
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref());

      uploadStatus.innerHTML = `
        Upload concluído! <a href="${downloadURL}" target="_blank">Clique aqui para acessar o arquivo</a>
      `;
      console.log("URL do arquivo:", downloadURL);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      uploadStatus.textContent = "Erro ao fazer upload. Tente novamente.";
    }
  });
}

// Função para buscar livros na Google Books API
if (searchBookInput) {
  searchBookInput.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    if (!query) {
      searchResults.innerHTML = ""; // Limpa os resultados se o campo estiver vazio
      return;
    }

    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      searchResults.innerHTML = ""; // Limpa os resultados anteriores

      if (data.items) {
        // Limita os resultados a no máximo 3
        const limitedResults = data.items.slice(0, 3);

        limitedResults.forEach((item) => {
          const book = item.volumeInfo;
          const li = document.createElement("li");
          li.textContent = `${book.title} (${book.authors?.join(", ") || "Autor desconhecido"})`;

          // Adiciona evento de clique para preencher os campos
          li.addEventListener("click", () => {
            // Preenche os campos com os dados do livro
            bookTitleInput.value = book.title || "";
            bookAuthorInput.value = book.authors?.join(", ") || "";
            bookGenreInput.value = book.categories?.join(", ") || "";
            bookDescriptionInput.value = book.description || "Sem descrição disponível.";

            // Limpa a lista de resultados após a seleção
            searchResults.innerHTML = "";
          });

          searchResults.appendChild(li);
        });
      } else {
        const noResults = document.createElement("li");
        noResults.textContent = "Nenhum livro encontrado.";
        searchResults.appendChild(noResults);
      }
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    }
  });
}

// Função para criar o livro
if (createBookForm) {
  createBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bookTitle = bookTitleInput.value;
    const bookAuthor = bookAuthorInput.value;
    const bookGenre = bookGenreInput.value;
    const bookDescription = bookDescriptionInput.value;

    try {
      // Salvar os detalhes no Firestore
      await addDoc(collection(db, "Books"), {
        title: bookTitle,
        author: bookAuthor,
        genre: bookGenre,
        description: bookDescription,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid,
      });

      Swal.fire({
        icon: "success",
        title: "Livro Adicionado!",
        text: "Os detalhes do livro foram salvos com sucesso.",
        timer: 2000,
        timerProgressBar: true,
        background: "#1e1e1e",
        color: "#ffca28",
      }).then(() => {
        window.location.href = "./dashboard.html";
      });
    } catch (error) {
      console.error("Erro ao salvar o livro:", error);
      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Não foi possível salvar o livro. Tente novamente.",
        background: "#1e1e1e",
        color: "#ffca28",
      });
    }
  });
}

// Função de logout
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    // Redireciona de volta para a página do Dashboard
    window.location.href = "./dashboard.html";
  });
}
