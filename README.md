# 📖 Web App de Leitura Compartilhada

Um **web app inovador** para leitura compartilhada, projetado para proporcionar uma experiência interativa com funcionalidades como anotações em tempo real e um layout responsivo. Ideal para leitores que desejam explorar livros de forma colaborativa.

---

## 🌟 Funcionalidades Principais

- 🔐 **Autenticação de Usuários**: Registre-se ou faça login de forma segura com Firebase Authentication.
- 📚 **Gestão de Livros**: Upload e organização de livros na biblioteca pessoal.
- ✏️ **Anotações**: Criação, edição e exclusão de anotações diretamente durante a leitura.
- 📱 **Interface Responsiva**: Design adaptado para desktop, tablets e smartphones.

---

## 🛠️ Tecnologias Utilizadas

### Front-end
- **HTML5**, **CSS3**
- **JavaScript** (ou Alpine.js para reatividade leve)
- **Bootstrap** para design responsivo

### Back-end
- **Firebase** (Firestore e Authentication)

### Hospedagem
- [**Netlify**](https://netlify.com) ou [**Vercel**](https://vercel.com)

---

## 📂 Estrutura do Projeto

A estrutura do projeto está organizada para facilitar a navegação e manutenção:

📁 src/
├── 📁 pages/
│   ├── login.html
│   ├── dashboard.html
│   ├── leitura.html
├── 📁 css/
│   ├── styles.css
├── 📁 js/
│   ├── app.js
├── .gitignore
├── README.md


## 🚀 Configuração do Ambiente

Siga estas etapas para configurar e rodar o projeto localmente:
**Clone este repositório**:

git clone https://github.com/mauricio2025/web-app-leitura-compartilhada.git

**Instale as dependências (caso utilize Node.js)**:

npm install

**Configure o Firebase**:

- Crie um projeto no Firebase Console.
- Habilite os serviços Authentication e Firestore.
- Baixe o arquivo de configuração firebaseConfig e substitua no arquivo app.js.

**Inicie o servidor local**:

npm start


## 🎨 Melhorias Futuras

- 🌐 Modo Offline: Permitir acesso à leitura e anotações sem conexão à internet.
- 📊 Estatísticas do Usuário: Adicionar gráficos sobre tempo de leitura e livros favoritos.
- 🤝 Integração Social: Compartilhamento de anotações com outros usuários.
- 📱 Transição para Aplicativo Móvel: Planejamento para versão iOS e Android.

## 📝 Licença

Este projeto está licenciado sob a MIT License.

## 👥 Contato
**Caso tenha dúvidas ou sugestões, entre em contato**:

- Email: msouza.dev@outlook.com
- LinkedIn: Mauricio Souza
- GitHub: Mauricio2025
