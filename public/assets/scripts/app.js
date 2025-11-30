const API_URL = "http://localhost:3000/restaurantes";

// GET restaurantes
async function buscarRestaurantes() {
  try {
    const response = await fetch(API_URL);
    const restaurantes = await response.json();
    return restaurantes;
  } catch (error) {
    console.error("Erro ao buscar restaurantes:", error);
    return [];
  }
}

// GET restaurante específico
async function buscarRestaurantePorId(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const restaurante = await response.json();
    return restaurante;
  } catch (error) {
    console.error("Erro ao buscar restaurante:", error);
    return null;
  }
}

// POST novo restaurante
async function criarRestaurante(restaurante) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(restaurante),
    });
    const novoRestaurante = await response.json();
    return novoRestaurante;
  } catch (error) {
    console.error("Erro ao criar restaurante:", error);
    return null;
  }
}

// PUT restaurante existente
async function atualizarRestaurante(id, restaurante) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(restaurante),
    });
    const restauranteAtualizado = await response.json();
    return restauranteAtualizado;
  } catch (error) {
    console.error("Erro ao atualizar restaurante:", error);
    return null;
  }
}

// DELETE restaurante
async function deletarRestaurante(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Erro ao deletar restaurante:", error);
    return false;
  }
}

// Função para carrossel
async function montarCarrossel() {
  const restaurantes = await buscarRestaurantes();
  const destaques = restaurantes.filter((r) => r.destaque);
  const indicadores = document.getElementById("indicadores-carrossel");
  const conteudo = document.getElementById("conteudo-carrossel");

  if (!indicadores || !conteudo) return;

  indicadores.innerHTML = "";
  conteudo.innerHTML = "";

  destaques.forEach((restaurante, index) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.setAttribute("data-bs-target", "#carrosselPrincipal");
    botao.setAttribute("data-bs-slide-to", index);
    if (index === 0) {
      botao.classList.add("active");
      botao.setAttribute("aria-current", "true");
    }
    indicadores.appendChild(botao);

    const item = document.createElement("div");
    item.classList.add("carousel-item");
    if (index === 0) item.classList.add("active");

    item.innerHTML = `
      <img src="${restaurante.imagem_principal}" alt="${restaurante.nome}">
      <div class="carousel-caption">
        <h5>${restaurante.nome}</h5>
        <p>${restaurante.descricao}</p>
        <a href="detalhe.html?id=${restaurante.id}" class="btn">Saiba mais</a>
      </div>
    `;

    conteudo.appendChild(item);
  });
}

// Função para montar os cards de restaurantes
async function montarCards() {
  const restaurantes = await buscarRestaurantes();
  todosRestaurantes = restaurantes; // Armazena globalmente
  const container = document.getElementById("container-cards");

  if (!container) return;

  container.innerHTML = "";

  restaurantes.forEach((restaurante) => {
    const coluna = document.createElement("div");
    coluna.classList.add("col-md-4", "col-sm-6", "mb-4");

    // Verifica se é favorito
    const favorito = isFavorito(restaurante.id);
    const iconeFavorito = favorito ? "bi-heart-fill" : "bi-heart";
    const corFavorito = favorito ? "text-danger" : "";

    coluna.innerHTML = `
      <div class="card">
        <img src="${restaurante.imagem_principal}" class="card-img-top" alt="${restaurante.nome}">
        <div class="card-body">
          <span class="badge">${restaurante.categoria}</span>
          <h5 class="card-title">${restaurante.nome}</h5>
          <p class="card-text">${restaurante.descricao}</p>
          <div class="d-flex justify-content-between align-items-center">
            <a href="detalhe.html?id=${restaurante.id}" class="btn btn-detalhes">Ver detalhes</a>
            <button class="btn btn-link ${corFavorito}" onclick="toggleFavorito('${restaurante.id}', event)">
              <i class="bi ${iconeFavorito} fs-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(coluna);
  });
}

// ID da URL
function obterIdDaURL() {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get("id");
}

// Função para mostrar detalhes do restaurante
async function mostrarDetalhes() {
  const id = obterIdDaURL();
  const restaurante = await buscarRestaurantePorId(id);

  if (!restaurante) {
    alert("Restaurante não encontrado!");
    window.location.href = "index.html";
    return;
  }

  const container = document.getElementById("container-detalhes");

  if (!container) return;

  // Verifica se é favorito
  const favorito = isFavorito(restaurante.id);
  const iconeFavorito = favorito ? "bi-heart-fill" : "bi-heart";
  const corFavorito = favorito ? "text-danger" : "";

  // Montar galeria de fotos
  let fotosHTML = "";
  if (restaurante.fotos && restaurante.fotos.length > 0) {
    restaurante.fotos.forEach((foto) => {
      fotosHTML += `
        <div class="col-md-4 col-sm-6">
          <div class="card card-foto">
            <img src="${foto.imagem}" class="card-img-top" alt="${foto.titulo}">
            <div class="card-body">
              <p class="card-text">${foto.titulo}</p>
            </div>
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = `
    <section class="secao-detalhes">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <a href="index.html" class="btn btn-voltar">
            <i class="bi bi-arrow-left"></i> Voltar para Home
          </a>
          
          <!-- Botão de Favorito -->
          <button class="btn btn-link ${corFavorito}" onclick="toggleFavoritoDetalhes('${restaurante.id}')" id="btn-favorito-detalhe">
            <i class="bi ${iconeFavorito} fs-1"></i>
          </button>
        </div>
        
        <!-- Botões de ação CRUD (apenas para admin) -->
        <div class="acoes-crud mb-3" id="acoes-admin" style="display: none;">
          <button class="btn btn-warning" onclick="window.location.href='formulario.html?id=${restaurante.id}'">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <button class="btn btn-danger" onclick="confirmarDelecao('${restaurante.id}')">
            <i class="bi bi-trash"></i> Deletar
          </button>
        </div>
        
        <!-- Informações Gerais -->
        <div class="info-detalhes">
          <div class="row">
            <div class="col-md-6">
              <img src="${restaurante.imagem_principal}" class="imagem-principal" alt="${restaurante.nome}">
            </div>
            <div class="col-md-6">
              <span class="badge">${restaurante.categoria}</span>
              <h1>${restaurante.nome}</h1>
              <p><strong>Descrição:</strong> ${restaurante.descricao}</p>
              <p>${restaurante.conteudo}</p>
              <hr>
              <p><strong><i class="bi bi-geo-alt-fill"></i> Endereço:</strong> ${restaurante.endereco}</p>
              <p><strong><i class="bi bi-telephone-fill"></i> Telefone:</strong> ${restaurante.telefone}</p>
              <p><strong><i class="bi bi-clock-fill"></i> Horário:</strong> ${restaurante.horario}</p>
              <p><strong><i class="bi bi-globe"></i> Site:</strong> ${restaurante.site}</p>
              <p><strong><i class="bi bi-cash"></i> Preço Médio:</strong> ${restaurante.preco_medio}</p>
            </div>
          </div>
        </div>

        <!-- Fotos Vinculadas -->
        <div class="secao-fotos">
          <h2>Fotos do Restaurante</h2>
          <div class="row">
            ${fotosHTML}
          </div>
        </div>
      </div>
    </section>
  `;

  // Mostra botões de admin se for administrador
  if (isAdmin()) {
    document.getElementById("acoes-admin").style.display = "block";
  }
}

// Função para toggle de favorito na página de detalhes
async function toggleFavoritoDetalhes(restauranteId) {
  if (!verificarLogin()) {
    alert("Faça login para adicionar favoritos!");
    window.location.href = "login.html";
    return;
  }

  if (isFavorito(restauranteId)) {
    await removerFavorito(restauranteId);
  } else {
    await adicionarFavorito(restauranteId);
  }

  // Atualiza o ícone
  const favorito = isFavorito(restauranteId);
  const btn = document.getElementById("btn-favorito-detalhe");
  const icone = btn.querySelector("i");

  if (favorito) {
    icone.classList.remove("bi-heart");
    icone.classList.add("bi-heart-fill");
    btn.classList.add("text-danger");
  } else {
    icone.classList.remove("bi-heart-fill");
    icone.classList.add("bi-heart");
    btn.classList.remove("text-danger");
  }
}

// Deletar restaurante selecionado
async function confirmarDelecao(id) {
  if (confirm("Tem certeza que deseja deletar este restaurante?")) {
    const sucesso = await deletarRestaurante(id);
    if (sucesso) {
      alert("Restaurante deletado com sucesso!");
      window.location.href = "index.html";
    } else {
      alert("Erro ao deletar restaurante.");
    }
  }
}

// Redirecionamento para edição
function editarRestaurante(id) {
  window.location.href = `formulario.html?id=${id}`;
}

// Função para preencher formulário (edição)
async function preencherFormulario() {
  const id = obterIdDaURL();

  if (id) {
    document.getElementById("titulo-formulario").textContent =
      "Editar Restaurante";
    const restaurante = await buscarRestaurantePorId(id);

    if (restaurante) {
      document.getElementById("nome").value = restaurante.nome;
      document.getElementById("descricao").value = restaurante.descricao;
      document.getElementById("conteudo").value = restaurante.conteudo;
      document.getElementById("categoria").value = restaurante.categoria;
      document.getElementById("destaque").checked = restaurante.destaque;
      document.getElementById("endereco").value = restaurante.endereco;
      document.getElementById("telefone").value = restaurante.telefone;
      document.getElementById("horario").value = restaurante.horario;
      document.getElementById("site").value = restaurante.site;
      document.getElementById("preco_medio").value = restaurante.preco_medio;
      document.getElementById("latitude").value = restaurante.latitude || "";
      document.getElementById("longitude").value = restaurante.longitude || "";
      document.getElementById("imagem_principal").value =
        restaurante.imagem_principal;

      // Preenche fotos adicionais
      if (restaurante.fotos && restaurante.fotos.length > 0) {
        if (restaurante.fotos[0]) {
          document.getElementById("foto1_url").value =
            restaurante.fotos[0].imagem || "";
          document.getElementById("foto1_titulo").value =
            restaurante.fotos[0].titulo || "";
        }
        if (restaurante.fotos[1]) {
          document.getElementById("foto2_url").value =
            restaurante.fotos[1].imagem || "";
          document.getElementById("foto2_titulo").value =
            restaurante.fotos[1].titulo || "";
        }
        if (restaurante.fotos[2]) {
          document.getElementById("foto3_url").value =
            restaurante.fotos[2].imagem || "";
          document.getElementById("foto3_titulo").value =
            restaurante.fotos[2].titulo || "";
        }
      }
    }
  }
}

// Função para salvar restaurante (criar ou atualizar)
async function salvarRestaurante(event) {
  event.preventDefault();

  const id = obterIdDaURL();

  // Monta array de fotos
  const fotos = [];

  // Foto 1
  if (document.getElementById("foto1_url").value) {
    fotos.push({
      id: 1,
      titulo: document.getElementById("foto1_titulo").value || "Foto 1",
      imagem: document.getElementById("foto1_url").value,
    });
  }

  // Foto 2
  if (document.getElementById("foto2_url").value) {
    fotos.push({
      id: 2,
      titulo: document.getElementById("foto2_titulo").value || "Foto 2",
      imagem: document.getElementById("foto2_url").value,
    });
  }

  // Foto 3
  if (document.getElementById("foto3_url").value) {
    fotos.push({
      id: 3,
      titulo: document.getElementById("foto3_titulo").value || "Foto 3",
      imagem: document.getElementById("foto3_url").value,
    });
  }

  const restaurante = {
    nome: document.getElementById("nome").value,
    descricao: document.getElementById("descricao").value,
    conteudo: document.getElementById("conteudo").value,
    categoria: document.getElementById("categoria").value,
    destaque: document.getElementById("destaque").checked,
    endereco: document.getElementById("endereco").value,
    telefone: document.getElementById("telefone").value,
    horario: document.getElementById("horario").value,
    site: document.getElementById("site").value,
    preco_medio: document.getElementById("preco_medio").value,
    latitude: document.getElementById("latitude").value,
    longitude: document.getElementById("longitude").value,
    imagem_principal: document.getElementById("imagem_principal").value,
    fotos: fotos,
  };

  let resultado;

  if (id) {
    // Atualizar
    resultado = await atualizarRestaurante(id, restaurante);
    if (resultado) {
      alert("Restaurante atualizado com sucesso!");
      window.location.href = `detalhe.html?id=${id}`;
    }
  } else {
    // Criar
    resultado = await criarRestaurante(restaurante);
    if (resultado) {
      alert("Restaurante criado com sucesso!");
      window.location.href = "index.html";
    }
  }

  if (!resultado) {
    alert("Erro ao salvar restaurante.");
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  const paginaAtual = window.location.pathname;
  if (paginaAtual.includes("index.html") || paginaAtual.endsWith("/")) {
    montarCarrossel();
    montarCards();
  }
  if (paginaAtual.includes("detalhe.html")) {
    mostrarDetalhes();
  }
  if (paginaAtual.includes("formulario.html")) {
    preencherFormulario();
    document
      .getElementById("form-restaurante")
      .addEventListener("submit", salvarRestaurante);
  }
});

// Função para pesquisar restaurantes
function pesquisarRestaurantes() {
  const termo = document.getElementById("campo-pesquisa").value.toLowerCase();
  const restaurantesFiltrados = todosRestaurantes.filter(
    (r) =>
      r.nome.toLowerCase().includes(termo) ||
      r.descricao.toLowerCase().includes(termo) ||
      r.categoria.toLowerCase().includes(termo)
  );

  const container = document.getElementById("container-cards");
  container.innerHTML = "";

  if (restaurantesFiltrados.length === 0) {
    container.innerHTML =
      '<div class="col-12"><p class="text-center">Nenhum restaurante encontrado.</p></div>';
    return;
  }

  restaurantesFiltrados.forEach((restaurante) => {
    const coluna = document.createElement("div");
    coluna.classList.add("col-md-4", "col-sm-6", "mb-4");

    // Verifica se é favorito
    const favorito = isFavorito(restaurante.id);
    const iconeFavorito = favorito ? "bi-heart-fill" : "bi-heart";
    const corFavorito = favorito ? "text-danger" : "";

    coluna.innerHTML = `
      <div class="card">
        <img src="${restaurante.imagem_principal}" class="card-img-top" alt="${restaurante.nome}">
        <div class="card-body">
          <span class="badge">${restaurante.categoria}</span>
          <h5 class="card-title">${restaurante.nome}</h5>
          <p class="card-text">${restaurante.descricao}</p>
          <div class="d-flex justify-content-between align-items-center">
            <a href="detalhe.html?id=${restaurante.id}" class="btn btn-detalhes">Ver detalhes</a>
            <button class="btn btn-link ${corFavorito}" onclick="toggleFavorito('${restaurante.id}', event)">
              <i class="bi ${iconeFavorito} fs-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(coluna);
  });
}

// Adiciona variável global para armazenar todos os restaurantes
let todosRestaurantes = [];

// Função para alternar favorito
async function toggleFavorito(restauranteId, event) {
  event.preventDefault();

  if (!verificarLogin()) {
    alert("Faça login para adicionar favoritos!");
    window.location.href = "login.html";
    return;
  }

  if (isFavorito(restauranteId)) {
    await removerFavorito(restauranteId);
  } else {
    await adicionarFavorito(restauranteId);
  }

  // Recarrega os cards
  montarCards();
}
