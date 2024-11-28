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
const bookModal = document.getElementById("bookModal");
const modalBookTitle = document.getElementById("modalBookTitle");
const closeModal = document.getElementById("closeModal");
const shareReading = document.getElementById("shareReading");
const readBook = document.getElementById("readBook");

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


function openModal(book) {
  modalBookTitle.textContent = book.title || "Título não disponível";
  bookModal.classList.remove("hidden");
  bookModal.style.display = "flex";

  // Configura o botão "Ler o Livro"
  readBook.onclick = () => {
    const bookData = {
      title: book.title || "Sem título",
      description: book.description || "Sem descrição disponível.",
      previewLink: book.previewLink || null,
      webReaderLink: book.webReaderLink || null,
    };

    // Salva os dados no localStorage
    localStorage.setItem("selectedBook", JSON.stringify(bookData));

    // Exibe mensagem de carregamento
    const loadingMessage = document.createElement("div");
    loadingMessage.id = "loadingMessage";
    loadingMessage.style.position = "fixed";
    loadingMessage.style.top = "50%";
    loadingMessage.style.left = "50%";
    loadingMessage.style.transform = "translate(-50%, -50%)";
    loadingMessage.style.background = "#000";
    loadingMessage.style.color = "#fff";
    loadingMessage.style.padding = "20px 40px";
    loadingMessage.style.borderRadius = "8px";
    loadingMessage.style.textAlign = "center";
    loadingMessage.style.fontSize = "18px";
    loadingMessage.textContent = "Abrindo ambiente de leitura...";

    document.body.appendChild(loadingMessage);

    // Redireciona para a página de leitura
    setTimeout(() => {
      window.location.href = "./reading.html";
    }, 2000);
  };

  // Configura o botão "Compartilhar Leitura"
  shareReading.onclick = () => {
    Swal.fire({
      icon: "info",
      title: "Compartilhar Leitura",
      text: "Funcionalidade em desenvolvimento!",
    });
  };
}


// Função para fechar o modal
closeModal.onclick = () => {
  bookModal.classList.add("hidden");
  bookModal.style.display = "none";
};

//Recuperar Dados do Livro Selecionado

const selectedBook = JSON.parse(localStorage.getItem("selectedBook"));

if (selectedBook) {
  document.getElementById("bookTitle").textContent = selectedBook.title;
  document.getElementById("bookDescription").textContent = selectedBook.description;

  const readerLink = document.getElementById("readerLink");
  const uploadSection = document.getElementById("uploadSection");

  if (selectedBook.webReaderLink) {
    readerLink.href = selectedBook.webReaderLink;
    readerLink.textContent = "Abrir Leitura no Navegador";
    uploadSection.classList.add("hidden");
  } else if (selectedBook.previewLink) {
    readerLink.href = selectedBook.previewLink;
    readerLink.textContent = "Visualizar Prévia no Google Books";
    uploadSection.classList.add("hidden");
  } else {
    readerLink.textContent = "Leitura não disponível";
    readerLink.style.pointerEvents = "none";
    uploadSection.classList.remove("hidden");
  }
} else {
  document.getElementById("bookTitle").textContent = "Erro ao carregar livro";
  document.getElementById("bookDescription").textContent = "Nenhum livro foi selecionado.";
}

//Configurações de Upload e Leitura de PDF

const pdfUpload = document.getElementById("pdfUpload");
const openPdfReader = document.getElementById("openPdfReader");
const pdfViewerModal = document.getElementById("pdfViewerModal");
const pdfViewer = document.getElementById("pdfViewer");
const closePdfModal = document.getElementById("closePdfModal");
const fullscreenPdf = document.getElementById("fullscreenPdf");
const downloadPdf = document.getElementById("downloadPdf");
const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");

let currentZoom = 1;

// Abrir modal para leitura do PDF
openPdfReader.addEventListener("click", () => {
  const file = pdfUpload.files[0];
  if (file) {
    const fileUrl = URL.createObjectURL(file);
    pdfViewer.src = fileUrl;
    pdfViewerModal.style.display = "flex";
    downloadPdf.dataset.url = fileUrl;
  } else {
    alert("Por favor, selecione um arquivo PDF.");
  }
});

closePdfModal.addEventListener("click", () => {
  pdfViewerModal.style.display = "none";
  pdfViewer.src = "";
});

fullscreenPdf.addEventListener("click", () => {
  if (pdfViewer.requestFullscreen) {
    pdfViewer.requestFullscreen();
  } else if (pdfViewer.webkitRequestFullscreen) {
    pdfViewer.webkitRequestFullscreen();
  } else if (pdfViewer.msRequestFullscreen) {
    pdfViewer.msRequestFullscreen();
  }
});

downloadPdf.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = downloadPdf.dataset.url;
  link.download = "livro.pdf";
  link.click();
});

zoomIn.addEventListener("click", () => {
  currentZoom += 0.1;
  pdfViewer.style.transform = `scale(${currentZoom})`;
});

zoomOut.addEventListener("click", () => {
  if (currentZoom > 0.2) {
    currentZoom -= 0.1;
    pdfViewer.style.transform = `scale(${currentZoom})`;
  }
});

//Configurações de Compartilhamento de Leitura
const shareModal = document.getElementById("shareModal");
const closeShareModal = document.getElementById("closeShareModal");
const sendShare = document.getElementById("sendShare");

shareReading.addEventListener("click", () => {
  shareModal.style.display = "flex";
});

closeShareModal.addEventListener("click", () => {
  shareModal.style.display = "none";
});

sendShare.addEventListener("click", async () => {
  const email1 = document.getElementById("email1").value.trim();
  const email2 = document.getElementById("email2").value.trim();

  if (email1 || email2) {
    const bookId = `book_${new Date().getTime()}`;
    const sharedEmails = [email1, email2].filter((e) => e);

    try {
      await setDoc(doc(db, "SharedBooks", bookId), {
        title: selectedBook.title,
        description: selectedBook.description,
        authorizedEmails: sharedEmails,
        previewLink: selectedBook.previewLink || null,
        webReaderLink: selectedBook.webReaderLink || null,
      });

      sharedEmails.forEach((email) => {
        emailjs.send("leitura_Web_App", "Leitura_Web_App", {
          to_email: email,
          book_title: selectedBook.title,
          access_link: `https://yourdomain.com/reading.html?bookId=${bookId}`,
        }).then(() => {
          console.log("E-mail enviado com sucesso para:", email);
        }).catch((error) => {
          console.error("Erro ao enviar e-mail:", error);
        });
      });

      alert("Compartilhamento enviado para: " + sharedEmails.join(", "));
      shareModal.style.display = "none";

    } catch (error) {
      console.error("Erro ao compartilhar livro:", error);
    }
  } else {
    alert("Por favor, insira ao menos um e-mail válido.");
  }
});

//Controle de Acesso ao Livro Compartilhado
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("bookId");

    if (bookId) {
      try {
        const docRef = doc(db, "SharedBooks", bookId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().authorizedEmails.includes(user.email)) {
          console.log("Usuário autorizado a visualizar este livro.");
        } else {
          alert("Você não tem permissão para acessar este conteúdo.");
          window.location.href = "./dashboard.html";
        }
      } catch (error) {
        console.error("Erro ao verificar acesso:", error);
        window.location.href = "./dashboard.html";
      }
    }
  } else {
    window.location.href = "./login.html";
  }
});


//                         ReadingPage JS                                 //




// Recupera os dados do livro do localStorage

if (selectedBook) {
  document.getElementById("bookTitle").textContent = selectedBook.title;
  document.getElementById("bookDescription").textContent = selectedBook.description;

  const readerLink = document.getElementById("readerLink");
  const uploadSection = document.getElementById("uploadSection");

  if (selectedBook.webReaderLink) {
    readerLink.href = selectedBook.webReaderLink;
    readerLink.textContent = "Abrir Leitura no Navegador";
    uploadSection.classList.add("hidden");
  } else if (selectedBook.previewLink) {
    readerLink.href = selectedBook.previewLink;
    readerLink.textContent = "Visualizar Prévia no Google Books";
    uploadSection.classList.add("hidden");
  } else {
    readerLink.textContent = "Leitura não disponível";
    readerLink.style.pointerEvents = "none";
    uploadSection.classList.remove("hidden");
  }
} else {
  document.getElementById("bookTitle").textContent = "Erro ao carregar livro";
  document.getElementById("bookDescription").textContent = "Nenhum livro foi selecionado.";
}

// Configurações para upload e leitura de PDF
openPdfReader.addEventListener("click", () => {
  const file = pdfUpload.files[0];
  if (file) {
    const fileUrl = URL.createObjectURL(file);
    pdfViewer.src = fileUrl;
    pdfViewerModal.style.display = "flex";
    downloadPdf.dataset.url = fileUrl;
  } else {
    alert("Por favor, selecione um arquivo PDF.");
  }
});

closePdfModal.addEventListener("click", () => {
  pdfViewerModal.style.display = "none";
  pdfViewer.src = "";
});

fullscreenPdf.addEventListener("click", () => {
  if (pdfViewer.requestFullscreen) {
    pdfViewer.requestFullscreen();
  } else if (pdfViewer.webkitRequestFullscreen) {
    pdfViewer.webkitRequestFullscreen();
  } else if (pdfViewer.msRequestFullscreen) {
    pdfViewer.msRequestFullscreen();
  }
});

downloadPdf.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = downloadPdf.dataset.url;
  link.download = "livro.pdf";
  link.click();
});

zoomIn.addEventListener("click", () => {
  currentZoom += 0.1;
  pdfViewer.style.transform = `scale(${currentZoom})`;
});

zoomOut.addEventListener("click", () => {
  if (currentZoom > 0.2) {
    currentZoom -= 0.1;
    pdfViewer.style.transform = `scale(${currentZoom})`;
  }
});

shareReading.addEventListener("click", () => {
  shareModal.style.display = "flex";
});

closeShareModal.addEventListener("click", () => {
  shareModal.style.display = "none";
});

sendShare.addEventListener("click", () => {
  const email1 = document.getElementById("email1").value.trim();
  const email2 = document.getElementById("email2").value.trim();

  if (email1 || email2) {
    alert(`Compartilhamento enviado para: ${[email1, email2].filter(e => e).join(", ")}`);
    shareModal.style.display = "none";
  } else {
    alert("Por favor, insira ao menos um e-mail válido.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Botão para voltar ao dashboard
  const backToDashboardBtn = document.getElementById("backToDashboardBtn");
  if (backToDashboardBtn) {
    backToDashboardBtn.onclick = () => {
      window.location.href = "./dashboard.html";
    };
  } else {
    console.error("Elemento 'backToDashboardBtn' não encontrado.");
  }

  // Compartilhar leitura
  const shareReading = document.getElementById("shareReading");
  const shareModal = document.getElementById("shareModal");
  const closeShareModal = document.getElementById("closeShareModal");
  const sendShare = document.getElementById("sendShare");

  if (shareReading && shareModal && closeShareModal && sendShare) {
    shareReading.onclick = () => {
      shareModal.style.display = "flex";
    };

    closeShareModal.onclick = () => {
      shareModal.style.display = "none";
    };

    sendShare.onclick = () => {
      const email1 = document.getElementById("email1").value.trim();
      const email2 = document.getElementById("email2").value.trim();

      if (email1 || email2) {
        alert(`Compartilhamento enviado para: ${[email1, email2].filter(e => e).join(", ")}`);
        shareModal.style.display = "none";
      } else {
        alert("Por favor, insira ao menos um e-mail válido.");
      }
    };
  } else {
    console.error("Elementos para compartilhamento de leitura não encontrados.");
  }
});



//                               Final ReadingPage JS                                 //



// Renderiza os livros na dashboard
function renderBooks(container, books) {
  if (!container) return;

  container.innerHTML = ""; // Limpa o contêiner antes de adicionar os livros

  if (books.length === 0) {
    container.innerHTML = "<p>Nenhum livro encontrado.</p>";
    return;
  }

  books.forEach((book) => {
    const bookElement = document.createElement("div");
    bookElement.classList.add("book-card");

    const coverUrl = book.cover || "../img/pexels-photo-1907785.jpeg";
    const coverImg = document.createElement("img");
    coverImg.src = coverUrl;
    coverImg.alt = book.title || "Sem título";
    coverImg.classList.add("book-cover");
    bookElement.appendChild(coverImg);

    const titleElement = document.createElement("div");
    titleElement.classList.add("book-title");
    titleElement.textContent = book.title || "Sem título";
    bookElement.appendChild(titleElement);

    // Adiciona evento para abrir o modal ao clicar no livro
    bookElement.addEventListener("click", () => openModal(book));

    container.appendChild(bookElement);
  });
}

// Função para carregar livros
async function loadBooks() {
  try {
    const booksSnapshot = await getDocs(collection(db, "Books"));
    const allBooks = [];

    booksSnapshot.forEach((doc) => {
      const book = doc.data();
      allBooks.push(book);
    });

    const allBooksContainer = document.getElementById("allBooks");
    renderBooks(allBooksContainer, allBooks);
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
  }
}

// Carregar livros ao iniciar
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
