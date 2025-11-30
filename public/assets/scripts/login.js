// Sistema de Login e Autenticação - GastroBH
// Baseado no código fornecido pelo professor

const LOGIN_URL = "login.html";
const API_USUARIOS_URL = "http://localhost:3000/usuarios";

// Objeto para o usuário corrente
var usuarioCorrente = {};

// Banco de dados de usuários
var db_usuarios = [];

// Função para gerar UUID
function generateUUID() {
  var d = new Date().getTime();
  var d2 = (performance && performance.now && performance.now() * 1000) || 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Inicializa o sistema de login
function initLoginApp() {
  // Carrega usuário corrente do sessionStorage
  const usuarioCorrenteJSON = sessionStorage.getItem("usuarioCorrente");
  if (usuarioCorrenteJSON) {
    usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
  }

  // Carrega usuários do JSONServer
  fetch(API_USUARIOS_URL)
    .then((response) => response.json())
    .then((data) => {
      db_usuarios = data;
    })
    .catch((error) => {
      console.error("Erro ao carregar usuários:", error);
    });
}

// Função de login
function loginUser(login, senha) {
  for (let i = 0; i < db_usuarios.length; i++) {
    const usuario = db_usuarios[i];

    if (login === usuario.login && senha === usuario.senha) {
      usuarioCorrente = {
        id: usuario.id,
        login: usuario.login,
        email: usuario.email,
        nome: usuario.nome,
        admin: usuario.admin || false,
      };

      sessionStorage.setItem(
        "usuarioCorrente",
        JSON.stringify(usuarioCorrente)
      );
      return true;
    }
  }
  return false;
}

// Função de logout
function logoutUser() {
  usuarioCorrente = {};
  sessionStorage.removeItem("usuarioCorrente");
  window.location.href = "index.html";
}

// Adicionar novo usuário
async function addUser(nome, login, senha, email) {
  const usuario = {
    id: generateUUID(),
    login: login,
    senha: senha,
    nome: nome,
    email: email,
    admin: false,
    favoritos: [],
  };

  try {
    const response = await fetch(API_USUARIOS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(usuario),
    });

    const data = await response.json();
    db_usuarios.push(data);
    return true;
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return false;
  }
}

// Verifica se usuário está logado
function verificarLogin() {
  return usuarioCorrente && usuarioCorrente.login;
}

// Verifica se usuário é admin
function isAdmin() {
  return usuarioCorrente && usuarioCorrente.admin === true;
}

// Adicionar favorito
async function adicionarFavorito(restauranteId) {
  if (!verificarLogin()) {
    alert("Faça login para adicionar favoritos!");
    window.location.href = LOGIN_URL;
    return false;
  }

  if (!usuarioCorrente.favoritos) {
    usuarioCorrente.favoritos = [];
  }

  if (!usuarioCorrente.favoritos.includes(restauranteId)) {
    usuarioCorrente.favoritos.push(restauranteId);

    try {
      await fetch(`${API_USUARIOS_URL}/${usuarioCorrente.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ favoritos: usuarioCorrente.favoritos }),
      });

      sessionStorage.setItem(
        "usuarioCorrente",
        JSON.stringify(usuarioCorrente)
      );
      return true;
    } catch (error) {
      console.error("Erro ao adicionar favorito:", error);
      return false;
    }
  }
  return false;
}

// Remover favorito
async function removerFavorito(restauranteId) {
  if (!verificarLogin()) return false;

  if (usuarioCorrente.favoritos) {
    const index = usuarioCorrente.favoritos.indexOf(restauranteId);
    if (index > -1) {
      usuarioCorrente.favoritos.splice(index, 1);

      try {
        await fetch(`${API_USUARIOS_URL}/${usuarioCorrente.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ favoritos: usuarioCorrente.favoritos }),
        });

        sessionStorage.setItem(
          "usuarioCorrente",
          JSON.stringify(usuarioCorrente)
        );
        return true;
      } catch (error) {
        console.error("Erro ao remover favorito:", error);
        return false;
      }
    }
  }
  return false;
}

// Verificar se restaurante é favorito
function isFavorito(restauranteId) {
  if (!verificarLogin()) return false;
  return (
    usuarioCorrente.favoritos &&
    usuarioCorrente.favoritos.includes(restauranteId)
  );
}

// Inicializa o sistema
initLoginApp();
