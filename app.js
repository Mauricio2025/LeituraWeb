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
const homeBtn = document.getElementById("homeBtn");
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


// Função para renderizar os livros no container
const renderBooks = (container, books) => {
  if (!container) {
    console.warn("Contêiner não encontrado para renderizar os livros.");
    return;
  }

  container.innerHTML = ""; // Limpa o contêiner antes de adicionar os livros

  if (books.length === 0) {
    console.warn("Nenhum livro para exibir.");
    container.innerHTML = "<p>Nenhum livro encontrado.</p>";
    return;
  }

  books.forEach((book) => {
    console.log("Renderizando livro:", book);

    const bookElement = document.createElement("div");
    bookElement.classList.add("book-card");

    // Define a capa do livro ou uma imagem padrão
    const coverUrl = book.cover || "../img/pexels-photo-1907785.jpeg";
    const coverImg = document.createElement("img");
    coverImg.src = coverUrl;
    coverImg.alt = book.title || "Sem título";
    coverImg.classList.add("book-cover");
    bookElement.appendChild(coverImg);

    // Título do livro
    const titleElement = document.createElement("div");
    titleElement.classList.add("book-title");
    titleElement.textContent = book.title || "Sem título";
    bookElement.appendChild(titleElement);

    // Adicionar o card ao contêiner
    container.appendChild(bookElement);
  });
};

// Função para carregar os livros do Firestore
async function loadBooks() {
  try {
    const booksSnapshot = await getDocs(collection(db, "Books"));
    const allBooks = [];

    booksSnapshot.forEach((doc) => {
      const book = doc.data();
      console.log("Livro encontrado:", book);
      allBooks.push(book);
    });

    const allBooksContainer = document.getElementById("allBooks");

    if (allBooksContainer) {
      renderBooks(allBooksContainer, allBooks); // Renderiza todos os livros
    } else {
      console.error("Contêiner 'allBooks' não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
  }
}

// Chamar a função para carregar os livros ao iniciar
loadBooks();

// Configurar a capa ao selecionar um livro
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

      if (data.items && data.items.length > 0) {
        data.items.forEach((item) => {
          const book = item.volumeInfo;
          const li = document.createElement("li");
          li.textContent = `${book.title} (${book.authors?.join(", ") || "Autor desconhecido"})`;

          li.addEventListener("click", () => {
            // Preenche os campos com os dados do livro
            bookTitleInput.value = book.title || "";
            bookAuthorInput.value = book.authors?.join(", ") || "";
            bookGenreInput.value = book.categories?.join(", ") || "";
            bookDescriptionInput.value = book.description || "Sem descrição disponível.";

            // Captura a URL da capa
            const coverUrl = book.imageLinks?.thumbnail || "https://via.placeholder.com/128x192";
            bookTitleInput.dataset.cover = coverUrl; // Armazena diretamente no input do título

            console.log("Livro selecionado:", {
              title: book.title,
              authors: book.authors,
              cover: coverUrl,
            });

            searchResults.innerHTML = ""; // Limpa os resultados após a seleção
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



// Função para salvar o livro no Firestore
if (createBookForm) {
  createBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bookTitle = bookTitleInput.value;
    const bookAuthor = bookAuthorInput.value;
    const bookGenre = bookGenreInput.value;
    const bookDescription = bookDescriptionInput.value;

    // Captura o valor atualizado do dataset
    const coverUrl = bookTitleInput.dataset.cover || "https://via.placeholder.com/128x192";

    try {
      await addDoc(collection(db, "Books"), {
        title: bookTitle,
        author: bookAuthor,
        genre: bookGenre,
        description: bookDescription,
        cover: coverUrl, // Salva a URL da capa
        createdAt: new Date(),
        createdBy: auth.currentUser?.uid || "Desconhecido",
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







// Chama a função de carregar livros ao iniciar
// loadBooks();

document.addEventListener("DOMContentLoaded", () => {
  const addBookBtn = document.getElementById("addBookBtn");

  if (addBookBtn) {
    addBookBtn.addEventListener("click", () => {
      console.log("Redirecionando para a página de criação de livro...");
      window.location.href = "./createBook.html";
    });
  } else {
    console.error("Botão 'Adicionar Livro' não encontrado na Dashboard.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const homeBtn = document.getElementById("homeBtn");

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      console.log("Redirecionando para a página inicial...");
      window.location.href = "./dashboard.html";
    });
  } else {
    console.error("Botão 'Home' não encontrado na Dashboard.");
  }
});


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

      if (data.items && data.items.length > 0) {
        data.items.forEach((item) => {
          const book = item.volumeInfo;

          const li = document.createElement("li");
          li.textContent = `${book.title} (${book.authors?.join(", ") || "Autor desconhecido"})`;

          li.addEventListener("click", () => {
            // Preenche os campos com os dados do livro
            bookTitleInput.value = book.title || "";
            bookAuthorInput.value = book.authors?.join(", ") || "";
            bookGenreInput.value = book.categories?.join(", ") || "";
            bookDescriptionInput.value = book.description || "Sem descrição disponível.";

            // Atualiza o dataset do input com a URL da capa
            const coverUrl = book.imageLinks?.thumbnail || "https://via.placeholder.com/128x192";
            bookTitleInput.dataset.cover = coverUrl;

            console.log("Capa capturada da API:", coverUrl); // Debug para verificar a URL da capa

            // Limpa os resultados após a seleção
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




// Função de logout
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    // Redireciona de volta para a página do Dashboard
    window.location.href = "./dashboard.html";
  });
}
