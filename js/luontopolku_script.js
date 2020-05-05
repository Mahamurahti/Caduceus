'use strict';

const name = document.getElementById('name');
const address = document.getElementById('address');
const city = document.getElementById('city');
const length = document.getElementById('length');
const summary = document.getElementById('summary');
const navigate = document.getElementById('navigate');
const proxyUrl = `https://cors-anywhere.herokuapp.com/`;
const searchButton = document.getElementById('searchbutton');
const resetButton = document.getElementById('reset');
const input = document.getElementById('input');
const dropdownOptions = document.getElementsByClassName('dropdown_option');
const dropdownButton = document.getElementById('dropdown_button');

//------------------------------EVENT LISTENERS-------------------------------//

//On click event listener for search button
searchButton.addEventListener('click', function() {
  searchByKeyword();

});

/*On click event listener for reset button (paikanna)
* Clears all markers from the map
* Adds marker for current user location
* Adds markers for nature trails within approximately 50 km distance from the
* user
* */
resetButton.addEventListener('click', function() {
  LayerGroup.clearLayers();
  addMarker(myLocation, 'Olen tässä', blueIcon);
  searchNature(50);
});

/*On click event listener for dropdown button
* Displays all dropdown options on click
*/
dropdownButton.addEventListener('click', function() {
  document.getElementById('info').style.visibility = 'hidden';
  document.getElementById('dropdown_container').classList.toggle('show');
});

/*On click event listener for each option of the dropdown button
*Displays nature trails within a given distance (km) from the user
*/
for (let i = 0; i < dropdownOptions.length; i++) {
  dropdownOptions[i].addEventListener('click', function(event) {

    switch (event.target.id) {
      case '20km':
        searchNature(20);
        break;

      case '40km':
        searchNature(40);
        break;

      case '60km':
        searchNature(60);
        break;

      case '100km':
        searchNature(100);
        break;

      case '150km':
        searchNature(150);
        break;
    }
  });
}

//--------------------SETTING UP THE MAP AND USER LOCATION--------------------//

let myLocation = null;
const map = L.map('map');

//Feature group created in order to group the markers
const LayerGroup = L.featureGroup().addTo(map);

//Using openstreetmap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

//Function sets the map view
function showMap(crd) {
  map.setView([crd.latitude, crd.longitude], 7);
}

//Function finds current user location
function userLocation(pos) {
  myLocation = pos.coords;
  showMap(myLocation);
  addMarker(myLocation, 'Olen tässä', blueIcon);
  searchNature(50);

}

//Function starts if geolocation search fails
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

//Start geolocation search
navigator.geolocation.getCurrentPosition(userLocation, error);

//-------------------------------SETTING UP MARKERS---------------------------//

//Custom icons: user location blue, nature trail green
const blueIcon = L.divIcon({
  className: 'blue-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 1],
});
const greenIcon = L.divIcon({
  className: 'green-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 1],
});

/*Function adds icon markers with a popup text to the map
* On click function prints trail data on the webpage, if available
* Navigation link opens Google Maps and shows driving route from user
* location to the destination (clicked marker).
*/
function addMarker(crd, text, icon, data) {
  L.marker([crd.latitude, crd.longitude], {icon: icon}).
      addTo(LayerGroup).
      bindPopup(text).
      on('click', function() {
        document.getElementById('info').style.visibility = 'visible';
        name.innerHTML = data.name;
        address.innerHTML = data.location.address;
        city.innerHTML = data.location.city.name;
        if (data.properties.routeLengthKm != null) {
          length.innerHTML = 'Luontoreitin pituus on ' +
              data.properties.routeLengthKm + ' km.';
        }
        if (data.properties.infoFi != null) {
          summary.innerHTML = data.properties.infoFi;
        }
        navigate.href = `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${myLocation.latitude}, ${myLocation.longitude}&destination=${crd.latitude}, ${crd.longitude}`;
      });
}

//--------------------------FETCHING DATA FROM API----------------------------//

/*Function for fetching sport places by type code for nature trails (4404)
*Shows nature trails within 100km radius from user location
* First for-loop is for showing all search results. Data is in paginated format and thus can show maximum 100 search results per page. */
function searchNature(distance) {
  LayerGroup.clearLayers();

  addMarker(myLocation, 'Olen tässä', blueIcon);
  for (let i = 1; i < 7; i++) {
    fetch(proxyUrl +
        `http://lipas.cc.jyu.fi/api/sports-places?closeToLon=${myLocation.longitude}&closeToLat=${myLocation.latitude}&closeToDistanceKm=${distance}&typeCodes=4404&pageSize=100&page=${i}`).
        then(function(response) {
          return response.json();
        }).then(function(data) {

      console.log(data);

      for (let j = 0; j < data.length; j++) {
        findTrail(data[j]);
      }
    }).catch(function(error) {
      console.log(error);
    });
  }
}

//Function fetches nature trail information
function findTrail(data) {
  fetch(proxyUrl +
      `http://lipas.cc.jyu.fi/api/sports-places/${data.sportsPlaceId}`).
      then(function(response) {
        return response.json();
      }).then(function(data) {

    const coords = {
      latitude: data.location.coordinates.wgs84.lat,
      longitude: data.location.coordinates.wgs84.lon,
    };
    const text = `
              <p style="font-weight: bold; font-family: 'Montserrat', sans-serif">${data.name} </p>
              <p style="font-family: 'Montserrat', sans-serif">${data.location.address} 
              <br> ${data.location.city.name}</p>
            `;
    addMarker(coords, text, greenIcon, data);

    //Centers map view around group of visible markers
    map.fitBounds(LayerGroup.getBounds());

  });
}

//Function for searching nature tarils by user input keyword
function searchByKeyword() {

  LayerGroup.clearLayers();
  //addMarker(myLocation, 'Olen tässä', blueIcon);
  for (let i = 1; i < 7; i++) {
    fetch(proxyUrl +
        `http://lipas.cc.jyu.fi/api/sports-places?searchString=${input.value}&typeCodes=4404&pageSize=100&page=${i}`).
        then(function(response) {
          return response.json();
        }).then(function(data) {

      console.log(data);

      for (let j = 0; j < data.length; j++) {
        findTrail(data[j]);
      }

    }).catch(function(error) {
      console.log(error);
    });
  }
}