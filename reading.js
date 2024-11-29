// Importações necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
const auth = getAuth();

// Configuração do EmailJS via carregamento dinâmico
let emailjsLoaded = false;
const loadEmailJS = () => {
    return new Promise((resolve, reject) => {
        if (emailjsLoaded) return resolve();

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
        script.type = "text/javascript";
        script.async = true;

        script.onload = () => {
            emailjs.init("2_Dd7yn3eL5hudmXq"); // Substitua pela sua chave pública
            console.log("EmailJS carregado com sucesso!");
            emailjsLoaded = true;
            resolve();
        };

        script.onerror = () => {
            console.error("Erro ao carregar o EmailJS.");
            reject(new Error("Erro ao carregar o EmailJS"));
        };

        document.body.appendChild(script);
    });
};

// Recuperação dos botões do DOM
const openPdfReader = document.getElementById("openPdfReader");
const shareReading = document.getElementById("shareReading");
const pdfViewerModal = document.getElementById("pdfViewerModal");
const pdfViewer = document.getElementById("pdfViewer");
const closePdfModal = document.getElementById("closePdfModal");
const shareModal = document.getElementById("shareModal");
const closeShareModal = document.getElementById("closeShareModal");
const sendShare = document.getElementById("sendShare");

// Abrir modal para leitura do PDF
if (openPdfReader) {
    openPdfReader.addEventListener("click", () => {
        const file = document.getElementById("pdfUpload").files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            pdfViewer.src = fileUrl;
            pdfViewerModal.style.display = "flex";
        } else {
            alert("Por favor, selecione um arquivo PDF para visualizar.");
        }
    });
}

// Fechar modal de visualização de PDF
if (closePdfModal) {
    closePdfModal.addEventListener("click", () => {
        pdfViewerModal.style.display = "none";
        pdfViewer.src = ""; // Remove o PDF carregado
    });
}

// Abrir modal para compartilhamento de leitura
if (shareReading) {
    shareReading.addEventListener("click", () => {
        shareModal.style.display = "flex";
    });
}

// Fechar modal de compartilhamento de leitura
if (closeShareModal) {
    closeShareModal.addEventListener("click", () => {
        shareModal.style.display = "none";
    });
}

// Enviar compartilhamento de leitura
if (sendShare) {
    sendShare.addEventListener("click", async () => {
        const email1 = document.getElementById("email1").value.trim();
        const email2 = document.getElementById("email2").value.trim();

        if (!email1 && !email2) {
            alert("Por favor, insira pelo menos um e-mail válido.");
            return;
        }

        try {
            await loadEmailJS(); // Carregar EmailJS antes de enviar os e-mails

            const sharedEmails = [email1, email2].filter(Boolean); // Filtra e-mails válidos
            console.log("Compartilhando leitura com:", sharedEmails);

            // Enviar e-mails usando EmailJS
            for (const email of sharedEmails) {
                await emailjs.send("leitura_Web_App", "Leitura_Web_App", {
                    to_email: email,
                    book_title: "Seu Livro",
                    access_link: "https://testando.com/reading.html",
                });
                console.log(`E-mail enviado com sucesso para: ${email}`);
            }

            alert(`E-mails enviados para: ${sharedEmails.join(", ")}`);
            shareModal.style.display = "none"; // Fechar modal após envio
        } catch (error) {
            console.error("Erro ao compartilhar leitura:", error);
            alert("Erro ao enviar o compartilhamento. Tente novamente.");
        }
    });
}

// Função para autenticação usando Redirect
async function login() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithRedirect(auth, provider); // Utiliza redirect em vez de popup
    } catch (error) {
        console.error("Erro ao iniciar login:", error);
    }
}

// Captura do resultado do redirecionamento após o login
getRedirectResult(auth)
    .then((result) => {
        if (result && result.user) {
            console.log("Usuário logado com sucesso via redirecionamento:", result.user.email);
        }
    })
    .catch((error) => {
        console.error("Erro ao processar redirecionamento:", error);
    });

// Verificação automática do estado de autenticação
onAuthStateChanged(auth, (user) => {
    const loginButton = document.getElementById("loginButton");
    const logoutButton = document.getElementById("logoutButton");

    if (user) {
        console.log("Usuário autenticado automaticamente:", user.email);

        // Ocultar botão de login e exibir botão de logout
        if (loginButton) loginButton.style.display = "none";
        if (logoutButton) logoutButton.style.display = "block";

        // Adicionar evento de logout ao botão
        if (logoutButton) {
            logoutButton.addEventListener("click", async () => {
                try {
                    await auth.signOut();
                    console.log("Usuário deslogado com sucesso.");
                    if (logoutButton) logoutButton.style.display = "none"; // Ocultar botão de logout após deslogar
                    if (loginButton) loginButton.style.display = "block"; // Exibir botão de login novamente
                } catch (error) {
                    console.error("Erro ao deslogar:", error);
                }
            });
        }
    } else {
        console.log("Nenhum usuário autenticado no momento.");

        // Exibir botão de login e ocultar botão de logout
        if (loginButton) loginButton.style.display = "block";
        if (logoutButton) logoutButton.style.display = "none";
    }
});

// Recupera os dados do livro do localStorage
const selectedBook = JSON.parse(localStorage.getItem("selectedBook"));

if (selectedBook) {
    const bookTitle = document.getElementById("bookTitle");
    const bookDescription = document.getElementById("bookDescription");
    const readerLink = document.getElementById("readerLink");
    const uploadSection = document.getElementById("uploadSection");

    if (bookTitle) bookTitle.textContent = selectedBook.title;
    if (bookDescription) bookDescription.textContent = selectedBook.description;

    if (readerLink && uploadSection) {
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
    }
} else {
    const bookTitle = document.getElementById("bookTitle");
    const bookDescription = document.getElementById("bookDescription");
    if (bookTitle) bookTitle.textContent = "Erro ao carregar livro";
    if (bookDescription) bookDescription.textContent = "Nenhum livro foi selecionado.";
}

// Adicionar evento ao botão de login
const loginButton = document.getElementById("loginButton");
if (loginButton) {
    loginButton.addEventListener("click", () => {
        login();
    });
}
