const API_URL = "http://localhost:3000/restaurantes";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYnJ1bmFwZWRyb3NhIiwiYSI6ImNtaTJkYXZhODFneTAya29wZTdtbzl6YzAifQ.L8eB22TL0HS4T8lvCkiSmw";

// Coordenadas centro de BH
const centralLatLong = [-43.9397233, -19.9332786];

let map;
let marcadores = [];
let todosRestaurantes = [];

const coresCategorias = {
  "Frutos do Mar": "#3498db",
  Francesa: "#e74c3c",
  Mineira: "#f39c12",
  Contemporânea: "#9b59b6",
  Hamburgueria: "#e67e22",
  Pizzaria: "#27ae60",
  Italiana: "#16a085",
};

// Inicializa o mapa
function inicializarMapa() {
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: centralLatLong,
    zoom: 11,
  });

  // Zoom +/-
  map.addControl(new mapboxgl.NavigationControl());
}

// Buscar restaurantes
async function buscarRestaurantes() {
  try {
    const response = await fetch(API_URL);
    todosRestaurantes = await response.json();
    return todosRestaurantes;
  } catch (error) {
    console.error("Erro ao buscar restaurantes:", error);
    return [];
  }
}

// Marcadores no mapa
function adicionarMarcadores(restaurantes) {
  marcadores.forEach((marcador) => marcador.remove());
  marcadores = [];

  restaurantes.forEach((restaurante) => {
    if (restaurante.latitude && restaurante.longitude) {
      const lat = parseFloat(restaurante.latitude);
      const lng = parseFloat(restaurante.longitude);
      const cor = coresCategorias[restaurante.categoria] || "#95a5a6";

      // Popup - restaurante
      const popupHTML = `
        <div class="popup-restaurante">
          <img src="${restaurante.imagem_principal}" alt="${restaurante.nome}" class="popup-imagem">
          <h6 class="popup-titulo">${restaurante.nome}</h6>
          <span class="badge mb-2" style="background-color: ${cor}">${restaurante.categoria}</span>
          <p class="popup-descricao">${restaurante.descricao}</p>
          <p class="popup-info"><i class="bi bi-geo-alt"></i> ${restaurante.endereco}</p>
          <p class="popup-info"><i class="bi bi-telephone"></i> ${restaurante.telefone}</p>
          <p class="popup-info"><i class="bi bi-cash"></i> ${restaurante.preco_medio}</p>
          <a href="detalhe.html?id=${restaurante.id}" class="btn btn-sm btn-primary w-100 mt-2">Ver detalhes</a>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);

      // Marcador
      const marcador = new mapboxgl.Marker({ color: cor })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      marcadores.push(marcador);
    }
  });
}

// Lista lateral dos restaurantes
function criarListaRestaurantes(restaurantes) {
  const lista = document.getElementById("lista-restaurantes");
  lista.innerHTML = "";

  if (restaurantes.length === 0) {
    lista.innerHTML =
      '<p class="text-muted text-center">Nenhum restaurante encontrado</p>';
    return;
  }

  restaurantes.forEach((restaurante) => {
    const item = document.createElement("div");
    item.classList.add("item-restaurante");

    const cor = coresCategorias[restaurante.categoria] || "#95a5a6";

    item.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <div class="marcador-mini" style="background-color: ${cor}"></div>
        <div class="flex-grow-1">
          <h6 class="mb-0">${restaurante.nome}</h6>
          <small class="text-muted">${restaurante.categoria}</small>
        </div>
      </div>
    `;

    // Centralizar no mapa
    item.addEventListener("click", () => {
      if (restaurante.latitude && restaurante.longitude) {
        const lat = parseFloat(restaurante.latitude);
        const lng = parseFloat(restaurante.longitude);

        map.flyTo({
          center: [lng, lat],
          zoom: 15,
          essential: true,
        });

        marcadores.forEach((marcador) => {
          const pos = marcador.getLngLat();
          if (
            Math.abs(pos.lat - lat) < 0.0001 &&
            Math.abs(pos.lng - lng) < 0.0001
          ) {
            marcador.togglePopup();
          }
        });
      }
    });

    lista.appendChild(item);
  });
}

// Filtrar por categoria
function filtrarPorCategoria(categoria) {
  let restaurantesFiltrados;

  if (categoria === "todos") {
    restaurantesFiltrados = todosRestaurantes;
  } else {
    restaurantesFiltrados = todosRestaurantes.filter(
      (r) => r.categoria === categoria
    );
  }

  adicionarMarcadores(restaurantesFiltrados);
  criarListaRestaurantes(restaurantesFiltrados);

  // Ajuste zoom
  if (restaurantesFiltrados.length > 0) {
    const coordenadas = restaurantesFiltrados
      .filter((r) => r.latitude && r.longitude)
      .map((r) => [parseFloat(r.longitude), parseFloat(r.latitude)]);

    if (coordenadas.length > 0) {
      const bounds = coordenadas.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordenadas[0], coordenadas[0]));

      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
      });
    }
  }
}

// Inicialização
window.onload = async () => {
  inicializarMapa();

  const restaurantes = await buscarRestaurantes();

  if (restaurantes.length > 0) {
    adicionarMarcadores(restaurantes);
    criarListaRestaurantes(restaurantes);

    // Ajuste zoom
    const coordenadas = restaurantes
      .filter((r) => r.latitude && r.longitude)
      .map((r) => [parseFloat(r.longitude), parseFloat(r.latitude)]);

    if (coordenadas.length > 0) {
      const bounds = coordenadas.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordenadas[0], coordenadas[0]));

      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 13,
      });
    }
  }

  // Filtro Categoria
  const filtro = document.getElementById("filtro-categoria");
  if (filtro) {
    filtro.addEventListener("change", (e) => {
      filtrarPorCategoria(e.target.value);
    });
  }
};
