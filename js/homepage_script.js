// API key: c50d08ff7a7d0ee1c09a3f597d3e83bc

// Fetching Weather data from openweathermap
fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=helsinki&units=metric&lang=fi&appid=c50d08ff7a7d0ee1c09a3f597d3e83bc`).
    then(function(response) {
      return response.json();
    }).
    then(function(json) {
      console.log(json);
      const div = document.getElementById('weather');

      // Translating to finnish
      if (json.weather[0].main === 'Clear') {
        json.weather[0].main = 'Selkeää';
      }
      if (json.weather[0].main === 'Clouds') {
        json.weather[0].main = 'Pilvistä';
      }
      if (json.weather[0].main === 'Atmosphere') {
        json.weather[0].main = 'Ilma';
      }
      if (json.weather[0].main === 'Snow') {
        json.weather[0].main = 'Lunta';
      }
      if (json.weather[0].main === 'Rain') {
        json.weather[0].main = 'Sadetta';
      }
      if (json.weather[0].main === 'Drizzle') {
        json.weather[0].main = 'Tihkusadetta';
      }
      if (json.weather[0].main === 'Thunderstorm') {
        json.weather[0].main = 'Salamoi';
      }

      div.innerHTML = `<img src="http://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png">
                        <h2>${json.weather[0].main}<p><br>${json.weather[0].description}</p></p>
                        <p id="temp">Lämpötila: ${json.main.temp} °C</p>`;
    }).
    catch(function(error) {
      console.log('Error: ' + error);
    });
