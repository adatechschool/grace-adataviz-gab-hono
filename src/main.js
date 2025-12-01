import './style.css'

const app = document.getElementById("app");

async function fetchApi() {
  try {
    const response = await fetch(
      "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/ilots-de-fraicheur-equipements-activites/records?where=type%20%3D%20%27Piscine%27&limit=20"
    );
    const apiData = await response.json();
    console.log(apiData);
    return apiData;
  } catch (error) {
    console.log(error);
  }

  const listePiscines = document.createElement(ul);
  listePiscines.id = ''
  app.appendChild(listePiscines);
}

fetchApi();