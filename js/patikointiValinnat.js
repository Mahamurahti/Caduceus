'use strict';
const filterBtn = document.getElementById("FilterBtn");
const checkbox  = document.getElementById("filters");
const rtLengthCB = document.getElementById("routeLength");
const rtDistanceCB = document.getElementById("routeDistance");
const rtDistanceInput = document.getElementById("routeDistanceInput");
const rtLengthInput = document.getElementById("routeLengthInput");
const searchFiltersBtn = document.getElementById("searchFilters");
const keywordInput = document.getElementById('keyword');
const searchBtn = document.getElementById('searchbutton');

searchBtn.addEventListener('click', searchClick);
filterBtn.addEventListener('click', filterClick);
searchFiltersBtn.addEventListener('click', filterSearch);

function filterClick() {
  checkbox.style.display = "block";
}

function routeFilters() {
  if (rtLengthCB.checked == true) {
    rtLengthInput.style.display ="block";
  } else {
    rtLengthInput.style.display ="none";
  }

  if(rtDistanceCB.checked == true) {
    rtDistanceInput.style.display ="block";
  } else {
    rtDistanceInput.style.display ="none";
  }
}

function filterSearch() {
  layerGroup.clearLayers();
  if(rtLengthCB.checked == true && rtDistanceCB.checked == false) {
    //haetaan pelkästään lenkin pituuden mukaan
  } else if (rtLengthCB.checked == true && rtDistanceCB.checked == true) {
    // haetaan molempien mukaan
  } else if (rtLengthCB.checked == false && rtDistanceCB.checked == true) {
    //haetaan pelkästään etäisyyden mukaan
    const rtDist = rtDistanceInput.value;
    let apiUrl = "http://lipas.cc.jyu.fi/api/sports-places?closeToLon=" +
        currentPos.longitude + "&closeToLat=" + currentPos.latitude +
        "&closeToDistanceKm="+ rtDist + "&pageSize=100&typeCodes=4405&page=";
    findTrails(apiUrl);
  }
}

/* Function for searching trails with keywords.
 */
function searchClick() {
  console.log('haku nappi painettu');
  layerGroup.clearLayers();
  addMarker(currentPos, 'olet tässä');
  let keyword = keywordInput.value;
  console.log("keyword on ",typeof keyword, keyword);
  let apiUrl;

  if (keyword != '') {
    console.log('keyword tyyppi on', typeof keyword, 'keyword on ', keyword);
    apiUrl = 'http://lipas.cc.jyu.fi/api/sports-places?&pageSize=100&typeCodes=4405&searchString=' +
        keyword + '&page=';
  }
  findTrails(apiUrl);
}