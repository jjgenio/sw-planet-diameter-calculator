const axios = require("axios");

/**
 * Checks if specified film is a number
 * @param {String} filmId id of the film
 * @returns true if filmId is a valid number
 */
function isParamValid(filmId) {
  return !isNaN(filmId);
}

/**
 * Checks if planet is valid(has mountains and water surface higher than zero)
 * @param {Object} planet details of the planet
 * @returns true if planet has mountains and water surface is known and higher than zero
 */
function isPlanetValid(planet) {
  //if 'mountain' exists in the terrain string property and surface_water property is a number(!NaN) and higher than zero
  return planet.terrain.includes("mountain") && parseFloat(planet.surface_water)
    ? true
    : false;
}

/**
 * Fetches the details of the planets concurrently
 * @param {Array} planetUrls list of urls to fetch the details of the planets
 * @returns list of details of the planets
 */
async function doPlanetsCalls(planetUrls) {
  //Calls the planets URLs concurrently
  const planetCalls = planetUrls.map((url) => axios(url));
  //Creates a Promisse to wait for all the concurrent calls
  return await Promise.all(planetCalls);
}

/**
 * Sums the diameter of every valid planet
 * @param {Array} planets list of planets
 * @returns the sum of the diameter of every valid planet
 */
function calcTotalDiameter(planets) {
  let total = 0;
  planets.forEach((planet) => {
    //if planet is valid, add its diameter to the total
    total += isPlanetValid(planet.data) ? parseInt(planet.data.diameter) : 0;
  });
  return total;
}

/**
 * Fetches the details of the film
 * @param {String} filmId id of the film
 * @returns details of film(including URLs to fetch the planets details)
 */
async function getFilmDetails(filmId) {
  let filmDetails;
  try {
    //Fetches the film details(including URLs to fetch planets details)
    filmDetails = await axios(`https://swapi.dev/api/films/${filmId}/`);
  } catch (err) {
    if (err.response.status === 404) {
      console.error("Film not found");
    } else {
      console.error(err.stack);
    }
  }
  return filmDetails;
}

/**
 * Fetches the details for the planets
 * @param {Array} planetsUrls list of urls to fetch the planets details
 * @returns the list of planets details
 */
async function getPlanetsDetails(planetsUrls) {
  let responsePlanets;
  try {
    //Fetches planets details from the requested film
    responsePlanets = await doPlanetsCalls(planetsUrls);
  } catch (err) {
    console.error(err.stack);
  }
  return responsePlanets;
}

/**
 * Fetches the film details and the details of the planets of the specified film
 * @param {String} filmId id of the film
 * @returns the sum of the diameter of every valid planet
 */
async function getTotalDiameter(filmId) {
  const responseFilm = await getFilmDetails(filmId);

  if (responseFilm) {
    //Fetches planets details from the requested film
    const responsePlanets = await getPlanetsDetails(responseFilm.data.planets);
    if (responsePlanets) {
      console.log(calcTotalDiameter(responsePlanets));
    }
  }
}

//gets the film id from the list of command line's arguments
const filmId = process.argv[2];

if (isParamValid(filmId)) {
  getTotalDiameter(filmId);
} else {
  console.error("Film id must be a number");
}
