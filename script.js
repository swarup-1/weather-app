let baseURL = 'https://api.openweathermap.org';
let apiKey = '6b2a87c90fbe5a4db8368b098ffb4f0f';
let obj = {
    city: '',
    lon: '',
    lat: ''
};



document.addEventListener('DOMContentLoaded', function() {
    let date = new Date();
    document.querySelector('.section1 h3').textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.querySelector('.section1 p').textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            obj.lon = position.coords.longitude;
            obj.lat = position.coords.latitude;
            // API service was not providing accurate results using longitude & latitude thats why need to make another API call
            fetch(`${baseURL}/geo/1.0/reverse?lat=${obj.lat}&lon=${obj.lon}&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                obj.city = data[0].name
                submitValue()
            })

        });
    } else { 
        alert("Geolocation is not supported by this browser.");
    }
});



function submitValue() {
    let city = document.getElementById('inputField').value || obj.city;
    let date = new Date();
    fetch((obj.lat && obj.lon && !city) ? `${baseURL}/data/2.5/weather?lat=${obj.lat}&lon=${obj.lon}&units=metric&appid=${apiKey}` : `${baseURL}/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(weatherData => {
            let { lat, lon } = weatherData.coord;

            // DOm manupulation
            document.querySelector('.r1 #city').textContent = `${weatherData.name}`;
            document.querySelector('.r1 #country').textContent = `${weatherData.sys.country}`;
            document.querySelector('.r1 #time').textContent = formatToTime(date)
            document.querySelector('.r2 #weather').textContent = `${weatherData.weather[0].description}`;
            document.querySelector('.r2 #temp').textContent = `${weatherData.main.temp} °C`;
            document.querySelector('.r2 img').src = getImg(weatherData.weather.description);
            document.getElementById('humidity').textContent = `${weatherData.main.humidity} %`;
            document.getElementById('wind').textContent = `${weatherData.wind.speed} m/s`;
            document.getElementById('pressure').textContent = `${weatherData.main.pressure} mbar`;
            document.querySelector('.sunrise h3').textContent = formatUnixTimestamp(weatherData.sys.sunrise).time;
            document.querySelector('.sunrise .compare-time').textContent = formatUnixTimestamp(weatherData.sys.sunrise).compare;
            document.querySelector('.sunset h3').textContent = formatUnixTimestamp(weatherData.sys.sunset).time;
            document.querySelector('.sunset .compare-time').textContent = formatUnixTimestamp(weatherData.sys.sunset).compare;
            
            // Fetch today's forecast
            return fetch(`${baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(forecastData => {

                let todayForecastElement = document.querySelector('.right-block .r3');
                let weeklyForecastElement = document.querySelector('.section3 > div');
                todayForecastElement.innerHTML = null
                weeklyForecastElement.innerHTML = null

                let dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                let todayDate = new Date().toLocaleDateString('en-US', dateOptions);

                forecastData.list.forEach(forecast => {
                    let forecastDate = new Date(forecast.dt * 1000).toLocaleDateString('en-US', dateOptions);
                    if (forecastDate === todayDate) {
                        let forecastItem = document.createElement('div');
                        forecastItem.innerHTML = `
                            <p class="time">${formatToTime(forecast.dt_txt)}</p>
                            <p class="temp">${forecast.main.temp} °C</p>
                            <p class="type">${forecast.weather[0].description}</p>
                        `;
                        todayForecastElement.appendChild(forecastItem);
                        } else if (!weeklyForecastElement.querySelector(`div[data-date="${forecastDate}"]`)) {
                            let forecastItem = document.createElement('div');
                            forecastItem.innerHTML = `
                            <div class="content">
                                <p class="day">${parseDateInput(forecastDate).day}</p>
                                <p class="date">${parseDateInput(forecastDate).date}</p>
                                <p class="temp">${forecast.main.temp} °C</p>
                                <p class="type">${forecast.weather[0].description}</p>
                            </div>
                            <img src="${getImg(forecast.weather[0].description)}" alt="">
                            `;
                        forecastItem.setAttribute('data-date', forecastDate);
                        
                        weeklyForecastElement.appendChild(forecastItem);
                    }
                });
            });
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

// Format time to 00:00 AM format
function formatToTime(dateInput) {
    let date = new Date(dateInput);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Format time to 00:00 AM format with difference
function formatUnixTimestamp(time) {
    let date = new Date(time * 1000);
    let currentTime = new Date();
    let diffHours = Math.ceil((date - currentTime) / (1000 * 60 * 60));
    let formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    let compare;
    if (diffHours < 0) {
        compare = `${Math.abs(diffHours)} hours ago`;
    } else {
        compare = `In ${diffHours} hours`;
    }
    return { time: formattedTime, compare };
}


function parseDateInput(dateInput) {
    let dateArray = dateInput.split(', ');
    let day = dateArray[0];
    let date = dateArray[1];
    return { day, date };
}

function getImg(type) {
    switch (type) {
        case 'clear sky':
            return './assets/clear.svg';

        case 'light rain':
            return './assets/rainy-1.svg';

        case 'moderate rain':
            return './assets/rainy-3.svg';

        case 'heavy intensity rain':
            return './assets/rainy-6.svg';
            
        case 'few clouds':
            return './assets/cloudy-day-1.svg';
            
        case 'scattered clouds':
            return './assets/cloudy-day-2.svg';

        case 'broken clouds':
            return './assets/thunder.svg';

        case 'overcast clouds':
            return './assets/cloudy.svg';

        default:
            return './assets/clear.svg';
    }
}
