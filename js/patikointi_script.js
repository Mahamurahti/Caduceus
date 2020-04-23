'use strict';

const name = document.getElementById("name");
const address = document.getElementById("address");
const navBtn = document.getElementById("navigation");
let currentPos = null;

const map = L.map('mapid');

function showMap(crd) {
  map.setView([crd.latitude, crd.longitude], 14);
}

function getPos(pos){
  currentPos = pos.coords;
  showMap(currentPos);
  addMarker(currentPos);
}

function error(err){
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function addMarker(crd, data){
  L.marker([crd.latitude, crd.longitude]).addTo(map).bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();;
  console.log(data);
  navBtn.href = `https://www.google.com/maps/dir/?api=1&origin=${omaLatitude},${omaLongitude}&destination=${crd.latitude},${crd.longitude}&travelmode=driving`;
}

navigator.geolocation.getCurrentPosition(getPos, error);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

//------------------------------------------------------------------------------//
let proxyUrl = 'https://cors-anywhere.herokuapp.com/',
    targetUrl = 'http://lipas.cc.jyu.fi/api/sports-places?typeCodes=4405';
fetch(proxyUrl + targetUrl)
.then(function(response) {
  return response.json();
})
.then(function(data) {
  console.log(data);
  for(let i = 0; i < data.length; i++){
    findInfo(data[i]);
  }
  document.querySelector("pre").innerHTML = JSON.stringify(data, null, 2);
})
.catch(function(error) {
  console.log('Error: ' + error);
});

function findInfo(data) {
  fetch(proxyUrl + `http://lipas.cc.jyu.fi/api/sports-places/${data.sportsPlaceId}`).
      then(function(response) {
        return response.json();
      }).then(function(data) {
        console.log(data);
        const coords = {
          latitude: data.location.coordinates.wgs84.lat,
          longitude: data.location.coordinates.wgs84.lon,
        };
        addMarker(coords, data)

  })
}
//------------------------------------------------------------------------------//
