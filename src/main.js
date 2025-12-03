import './style.css'

const app = document.getElementById('app');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const retourBtn = document.getElementById('retourBtn');

async function fetchApi() {
  try {
    const response = await fetch(
      "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/ilots-de-fraicheur-equipements-activites/records?where=type%20%3D%20%27Piscine%27&limit=20"
    );
    const apiData = await response.json();
    console.log(apiData);
    return apiData.results;
  } catch (error) {
    console.log(error);
  };
};

function clearList() {
  const existing = document.getElementById('liste-piscines');
  if (existing) existing.remove();
}

function boucles(boucle) {
  clearList();

  const listePiscines = document.createElement('ul');
  listePiscines.id = 'liste-piscines';
  app.appendChild(listePiscines);

  boucle.forEach(element => {
    const piscine = document.createElement('li');
    piscine.classList = 'piscine';
    piscine.innerHTML = ''
    listePiscines.appendChild(piscine);

      const nomPiscine = document.createElement('p');
      nomPiscine.classList = 'nom-piscine';
      nomPiscine.innerHTML = `Piscine : <em>${element.nom}</em>`
      piscine.appendChild(nomPiscine);

      const adressePiscine = document.createElement('p');
      adressePiscine.classList = 'adresse-piscine';
      adressePiscine.innerHTML =
        `Adresse : ${element.adresse}, ${element.arrondissement}`;
      piscine.appendChild(adressePiscine);

      const voirPlus = document.createElement('button');
      voirPlus.classList = 'voir-plus';
      voirPlus.innerText = 'Voir Plus'
      piscine.appendChild(voirPlus);

      voirPlus.addEventListener('click', () => {

        voirPlus.classList = 'hidden';

        const details = document.createElement('div');
        details.classList = 'details';
        piscine.appendChild(details);

        const horairesBlock = document.createElement('div');
        horairesBlock.classList = 'horaires-block';
        details.appendChild(horairesBlock);

        const horairesBtn = document.createElement('button');
        horairesBtn.id = 'horairesBtn';
        horairesBtn.innerText = "Horaires";
        horairesBlock.appendChild(horairesBtn);

        const horairesContent = document.createElement('div');
        horairesContent.id = 'horairesContent';
        horairesContent.classList = "dropdown-content hidden";
        horairesContent.innerHTML = `
          <ul>
            <li>Lundi : ${element.horaires_lundi}</li>
            <li>Mardi : ${element.horaires_mardi}</li>
            <li>Mercredi : ${element.horaires_mercredi}</li>
            <li>Jeudi : ${element.horaires_jeudi}</li>
            <li>Vendredi : ${element.horaires_vendredi}</li>
            <li>Samedi : ${element.horaires_samedi}</li>
            <li>Dimanche : ${element.horaires_dimanche}</li>
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
          <li>PMR : Non renseigné</li>
        `;
        details.appendChild(autres);


        const voirMoins = document.createElement('button');
        voirMoins.classList = 'voir-moins';
        voirMoins.innerText = "Voir Moins";
        voirMoins.addEventListener("click", () => {
          details.remove();
          voirPlus.classList = 'in-block';
        });
        details.appendChild(voirMoins);
      });
  });
};

async function showData() {

  const getData = await fetchApi();

  boucles(getData);

  searchBtn.addEventListener('click', (e) => {

    retourBtn.style.display = 'block';

    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
    boucles(getData);
    return;
    }

    const filtered = getData.filter (element => {
      const nom = (element.nom || '').trim().toString().toLowerCase();
      const adresse = (element.adresse || '').trim().toString().toLowerCase();
      const arrondissement = (element.arrondissement || '').trim().toString().toLowerCase();
      return nom.includes(searchTerm) || adresse.includes(searchTerm) || arrondissement.includes(searchTerm);
    });

    if (filtered.length > 0) {
      boucles(filtered);
    }
  });

  retourBtn.addEventListener('click', (e) => {
    retourBtn.style.display = 'hidden';
    searchInput.innerText=''
    boucles(getData);
  })
};

fetchApi();
showData();