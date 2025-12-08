import './style.css'

const app = document.getElementById('app');
const searchInput = document.getElementById('searchInput');

const modeSelector = document.getElementById("mode-selector");
const retour = document.getElementById("retour");
const mapDiv = document.getElementById("map");
const btnListe = document.getElementById("btnListe");
const btnCarte = document.getElementById("btnCarte");

let getDataGlobal = null;
let map = null;
let markers = [];
let searchListenerAttached = false;
let mapInitialized = false;
let pendingInitMap = false;

async function fetchApi() {
  try {
    const response = await fetch(
      "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/ilots-de-fraicheur-equipements-activites/records?where=type%20%3D%20%27Piscine%27&order_by=arrondissement%20ASC&limit=100"
    );
    const apiData = await response.json();
    return apiData.results;
  } catch (error) {
    console.log(error);
    return [];
  }
};

function clearList() {
  const existing = document.getElementById('container-piscines');
  if (existing) existing.remove();
}

function imageFromName(nom) {
  if (nom === "Piscine Saint-Merri / Marie-Marvingt") {
    return "/images/piscine-saint-merri-marie-marvingt.jpg";
  }
  return "/images/" + nom + ".jpg";
}

function boucles(boucle) {
  clearList();

  const listePiscines = document.createElement('div');
  listePiscines.id = 'container-piscines';
  app.appendChild(listePiscines);

  boucle.forEach(element => {
    const piscine = document.createElement('div');
    piscine.classList = 'piscine-card';
    listePiscines.appendChild(piscine);

    const favBtn = document.createElement('button');
    favBtn.innerHTML = "💙";
    favBtn.classList = "fav-btn";

    favBtn.addEventListener("click", () => {
      favBtn.classList.toggle("active");
    });

    piscine.appendChild(favBtn);

    const img = document.createElement('img');
    img.src = imageFromName(element.nom);
    img.alt = `${element.nom}`
    img.classList = 'piscine-banner';
    piscine.appendChild(img);

    const nomPiscine = document.createElement('h2');
    nomPiscine.id = 'nom-piscine';
    nomPiscine.innerHTML = `<strong>${element.nom}</strong>`;
    piscine.appendChild(nomPiscine);

    const adressePiscine = document.createElement('address');
    adressePiscine.classList = 'adresse-piscine';
    adressePiscine.innerHTML = `Adresse : ${element.adresse}, ${element.arrondissement}`;
    piscine.appendChild(adressePiscine);

    const voirPlus = document.createElement('button');
    voirPlus.classList = 'voir-plus';
    voirPlus.innerText = 'Voir Plus';
    piscine.appendChild(voirPlus);

    voirPlus.addEventListener('click', () => {
      voirPlus.classList.add('hidden');

      const details = document.createElement('div');
      details.classList = 'details';
      piscine.appendChild(details);

      const horairesBlock = document.createElement('div');
      horairesBlock.classList = 'horaires-block';
      details.appendChild(horairesBlock);

      const horairesBtn = document.createElement('button');
      horairesBtn.classList.add('horairesBtn');
      horairesBtn.innerText = "Horaires";
      horairesBlock.appendChild(horairesBtn);

      const horairesContent = document.createElement('div');
      horairesContent.classList.add("dropdown-content", "hidden");
      horairesContent.innerHTML = `
        <ul>
          <li><strong>Lundi :</strong> ${element.horaires_lundi}</li>
          <li><strong>Mardi :</strong> ${element.horaires_mardi}</li>
          <li><strong>Mercredi :</strong> ${element.horaires_mercredi}</li>
          <li><strong>Jeudi :</strong> ${element.horaires_jeudi}</li>
          <li><strong>Vendredi :</strong> ${element.horaires_vendredi}</li>
          <li><strong>Samedi :</strong> ${element.horaires_samedi}</li>
          <li><strong>Dimanche :</strong> ${element.horaires_dimanche}</li>
        </ul>
      `;
      horairesBlock.appendChild(horairesContent);

      horairesBtn.addEventListener("click", () => {
        horairesContent.classList.toggle("hidden");
      });

      const autres = document.createElement("ul");
      autres.classList = "autres-details";
      autres.innerHTML = `
        <li>Type de bassin : Non renseigné</li>
        <li>Petit bassin : Non renseigné</li>
        <li>Tarifs : Non renseigné</li>
        <li>Vestiaires : Non renseigné</li>
        <li>Accès PMR : Non renseigné</li>
      `;
      details.appendChild(autres);

      const voirMoins = document.createElement('button');
      voirMoins.classList = 'voir-moins';
      voirMoins.innerText = "Voir Moins";

      voirMoins.addEventListener("click", () => {
        details.remove();
        voirPlus.classList.remove('hidden');
      });

      details.appendChild(voirMoins);
    });
  });
};


function initMapWithData(data) {
  if (mapInitialized) return;
  if (!data || !data.length) {
    mapInitialized = true;
    return;
  }

  map = L.map('map').setView([48.8566, 2.3522], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  markers = [];
  data.forEach(piscine => {
    if (piscine.geo_point_2d && piscine.geo_point_2d.lat) {
      const marker = L.marker([piscine.geo_point_2d.lat, piscine.geo_point_2d.lon])
        .bindPopup(`<strong>${piscine.nom}</strong><br>${piscine.adresse}`);
      marker.addTo(map);
      markers.push({ marker, data: piscine });
    }
  });

  mapInitialized = true;
}

function attachSearchListenerOnce() {
  if (searchListenerAttached) return;
  searchListenerAttached = true;

  searchInput.addEventListener('input', () => {
    const inputValue = (searchInput.value || '').toLowerCase().trim();
    const listItems = document.querySelectorAll('.piscine-card');

    let visibleCount = 0;

    getDataGlobal.forEach((element, i) => {
      const nom = (element.nom || '').toLowerCase();
      const adresse = (element.adresse || '').toLowerCase();
      const arrondissement = (element.arrondissement || '').toLowerCase();

      const isVisible =
        nom.includes(inputValue) ||
        adresse.includes(inputValue) ||
        arrondissement.includes(inputValue);

      if (listItems[i]) {
        listItems[i].classList.toggle('hidden', !isVisible);
      }
      if (isVisible) visibleCount++;
    });

    const noResults = document.getElementById('noResults');
    if (noResults) {
      noResults.classList.toggle('hidden', visibleCount !== 0);
    }

    if (mapInitialized && markers.length > 0) {
      markers.forEach(obj => {
        const nom = (obj.data.nom || '').toLowerCase();
        const adresse = (obj.data.adresse || '').toLowerCase();
        const arrondissement = (obj.data.arrondissement || '').toLowerCase();

        const isVisible =
          nom.includes(inputValue) ||
          adresse.includes(inputValue) ||
          arrondissement.includes(inputValue);

        if (isVisible) {
          if (!map.hasLayer(obj.marker)) obj.marker.addTo(map);
        } else {
          if (map.hasLayer(obj.marker)) map.removeLayer(obj.marker);
        }
      });
    }
  });
}

async function showData() {

  mapDiv.style.display = "none";
  app.style.display = "none";
  searchInput.style.display = "none";

  const loader = document.getElementById('loader');
  if (loader) loader.style.display = "block";

  const getData = await fetchApi();
  getDataGlobal = getData || [];

  if (loader) loader.style.display = "none";

  boucles(getDataGlobal);

  attachSearchListenerOnce();

  if (pendingInitMap) {
    initMapWithData(getDataGlobal);
    setTimeout(() => { if (map) map.invalidateSize(); }, 100);
  }
}


btnListe.addEventListener("click", () => {
  modeSelector.style.display = "none";
  retour.classList.remove("hidden");

  searchInput.style.display = "block";
  app.style.display = "block";
  mapDiv.style.display = "none";
});

btnCarte.addEventListener("click", () => {
  modeSelector.style.display = "none";
  retour.classList.remove("hidden");

  searchInput.style.display = "block";
  app.style.display = "none";
  mapDiv.style.display = "block";

  if (!getDataGlobal || getDataGlobal.length === 0) {
    pendingInitMap = true;
    return;
  }

  if (mapInitialized) {
    setTimeout(() => { if (map) map.invalidateSize(); }, 100);
    return;
  }

  initMapWithData(getDataGlobal);

  setTimeout(() => { if (map) map.invalidateSize(); }, 200);
});

retour.addEventListener("click", () => {
  modeSelector.style.display = "flex";
  retour.classList.add("hidden");

  searchInput.style.display = "none";
  app.style.display = "none";
  mapDiv.style.display = "none";
});

showData();