'use strict';


const name = document.getElementById('name');
const address = document.getElementById('address');
const city = document.getElementById('city');
const summary = document.getElementById('summary');
const navigate = document.getElementById('navigate');
/*
const searchButton = document.getElementById('searchButton');
const input = document.getElementById('input');
input.addEventListener('keyup',findTrail);*/

//let idArray = [];
let myLocation = null;
const map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
navigator.geolocation.getCurrentPosition(userLocation, error);
let proxyUrl = `https://cors-anywhere.herokuapp.com/`;

for(let i = 1; i < 7; i++) {
  fetch(proxyUrl +
      `http://lipas.cc.jyu.fi/api/sports-places?typeCodes=4404&pageSize=100&page=${i}`).
      then(function(response) {
        return response.json();
      }).then(function(data) {


        for(let j = 0; j < data.length; j++){
        /*  let object = {
            sportsId: data[j].sportsPlaceId
          };
          idArray.push(object); */

         findTrail(data[j]);
        }

  }).catch(function(error) {
    console.log(error);
  });
}


//console.log(idArray);

  function findTrail(data) {
    fetch(proxyUrl + `http://lipas.cc.jyu.fi/api/sports-places/${data.sportsPlaceId}`).
        then(function(response) {
          return response.json();
        }).then(function(data) {

      const coords = {
        latitude: data.location.coordinates.wgs84.lat,
        longitude: data.location.coordinates.wgs84.lon
      };
      const teksti = `
              <h3>${data.name}</h3>
              <h4>${data.location.address}</h4>
              <br>
              <p>${data.location.city.name}</p>

            `;
      addMarker(coords, teksti, data);
    })
  }


function userLocation(pos) {
  myLocation = pos.coords;

  findTrail(myLocation);

  map.setView([myLocation.latitude, myLocation.longitude], 13);
  addMarker(myLocation, 'Olen tässä');
}


function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function addMarker(crd, teksti, data) {
  L.marker([crd.latitude, crd.longitude]).
      addTo(map).
      bindPopup(teksti).
      on('click', function() {
        name.innerHTML = data.name;
        address.innerHTML = data.location.address;
        city.innerHTML = data.location.city.name;
        summary.innerHTML = data.properties.infoFi;
        navigate.href = `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${myLocation.latitude}, ${myLocation.longitude}&destination=${crd.latitude}, ${crd.longitude}`;
      });
}








/*  let proxyUrl = `https://cors-anywhere.herokuapp.com/`,
      targetUrlTypeCode = `https://bridge.buddyweb.fr/api/naturetrails/naturetrails`,
      targetUrlId = `http://lipas.cc.jyu.fi/api/sports-places/`;

  fetch(proxyUrl + targetUrlTypeCode).
      then(function(response) {
        return response.json();
      }).then(function(data) {

    console.log(data);

    for (let i = 0; i < data.length; i++) {
      searchNatureTrail(data[i]);

    }
    document.querySelector('pre').innerHTML=JSON.stringify(data, null, 2);
  });

  function searchNatureTrail(data) {
    fetch(proxyUrl + targetUrlId + data.sportplacesid).
        then(function(response) {
          return response.json();
        }).then(function(data) {
      console.log(data);

      const coordinates = {
        latitude: data.location.coordinates.wgs84.lat,
        longitude: data.location.coordinates.wgs84.lon

      };

      const teksti = `
              <h3>${data.name}</h3>
              <h4>${data.location.address}</h4>
              <br>
              <p>${data.location.city.name}</p>

            `;

      addMarker(coordinates, teksti, data);

    });
  }
*/


/*searchButton.addEventListener('click', function(){
  searchNatureTrail();
}); */





