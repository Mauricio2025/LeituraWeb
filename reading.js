// Importações necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Configuração do EmailJS
emailjs.init("2_Dd7yn3eL5hudmXq"); // Substitua pela sua chave pública

// Recupera os dados do livro do localStorage
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

// Configurações para upload e leitura de PDF
const pdfUpload = document.getElementById("pdfUpload");
const openPdfReader = document.getElementById("openPdfReader");
const pdfViewerModal = document.getElementById("pdfViewerModal");
const pdfViewer = document.getElementById("pdfViewer");
const closePdfModal = document.getElementById("closePdfModal");
const fullscreenPdf = document.getElementById("fullscreenPdf");
const downloadPdf = document.getElementById("downloadPdf");
const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");
const shareReading = document.getElementById("shareReading");
const shareModal = document.getElementById("shareModal");
const closeShareModal = document.getElementById("closeShareModal");
const sendShare = document.getElementById("sendShare");

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

// Configurações de Compartilhamento de Leitura
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
        const sharedEmails = [email1, email2].filter(Boolean);

        try {
            // Salvar informações no Firestore
            await setDoc(doc(db, "SharedBooks", bookId), {
                title: selectedBook.title,
                description: selectedBook.description,
                authorizedEmails: sharedEmails,
                previewLink: selectedBook.previewLink || null,
                webReaderLink: selectedBook.webReaderLink || null,
            });

            // Enviar e-mail usando EmailJS
            sharedEmails.forEach((email) => {
                emailjs.send("leitura_Web_App", "Leitura_Web_App", {
                    to_email: email,
                    book_title: selectedBook.title,
                    access_link: `https://testando.com/reading.html?bookId=${bookId}`,
                }).then(() => {
                    console.log("E-mail enviado com sucesso para:", email);
                }).catch((error) => {
                    console.error("Erro ao enviar e-mail:", error);
                });
            });

            alert(`Compartilhamento enviado para: ${sharedEmails.join(", ")}`);
            shareModal.style.display = "none";
        } catch (error) {
            console.error("Erro ao compartilhar leitura:", error);
        }
    } else {
        alert("Por favor, insira ao menos um e-mail válido.");
    }
});
