import './style.css'

const app = document.getElementById("app");

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
  }
}

async function showData() {
  const getData = await fetchApi();

  const listePiscines = document.createElement('ul');
  listePiscines.id = 'liste-piscines'
  app.appendChild(listePiscines);

  getData.forEach(element => {
    console.log(element);
    const piscine = document.createElement('li');
    piscine.classList = 'piscine';
    piscine.innerHTML = 
      `${element.nom}
      ${element.adresse}
      ${element.arrondissement}`;
    listePiscines.appendChild(piscine);
  });
  }


fetchApi();
showData();