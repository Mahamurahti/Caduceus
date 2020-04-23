'use strict';

const name = document.getElementById('name');
const difficulty = document.getElementById('difflevel');
const address = document.getElementById('address');
const city = document.getElementById('city');
const summary = document.getElementById('summary');

const input = document.getElementById('input');




function searchNatureTrail(crd) {
  fetch (`https://citynature.eu/api/wp/v2/?title=${input.value}`).
      then(function(result) {
        return result.json();
      }).then(function(natureTrails) {
        console.log(natureTrails);
      })
}