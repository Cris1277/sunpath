
document.addEventListener("DOMContentLoaded", () => {
const apiKey = "a9b7f097937046b4b1d131943251501"; // Reemplaza con tu API Key de WeatherAPI
const weatherDisplay = document.getElementById("weatherDisplay");
const forecastDisplay = document.getElementById("forecastDisplay");
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");

const temperatureCtx = document.getElementById("temperatureChart").getContext("2d");
const precipitationCtx = document.getElementById("precipitationChart").getContext("2d");
const windSpeedCtx = document.getElementById("windSpeedChart").getContext("2d");

let currentUnit = "metric"; // Unidad actual (metric = °C, imperial = °F)
let temperatureChart, precipitationChart, windSpeedChart;

async function getWeatherAndForecast(city) {
try {
const response = await fetch(
 `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&lang=es`
);
if (!response.ok) {
 throw new Error("Ciudad no encontrada");
}
const data = await response.json();
displayWeather(data); // Mostrar clima actual
displayForecast(data.forecast.forecastday); // Mostrar pronóstico
updateCharts(data.forecast.forecastday); // Actualizar gráficos
} catch (error) {
alert(error.message);
}
}

function displayWeather(data) {
const { name } = data.location;
const temp = currentUnit === "metric" ? data.current.temp_c : data.current.temp_f;
const { text, icon } = data.current.condition;

weatherDisplay.innerHTML = `
<h2>📍 Ciudad: ${name}</h2>
<p>🌡️ Temperatura: ${temp}°${currentUnit === "metric" ? "C" : "F"}</p>
<p>☁️ Estado: ${text}</p>
<img src="https:${icon}" alt="${text}">
`;
}

function displayForecast(forecastDays) {
// Limpiar el contenido previo del pronóstico
forecastDisplay.innerHTML = "";

forecastDays.forEach(day => {
 const { date } = day;
 const tempMax = currentUnit === "metric" ? day.day.maxtemp_c : day.day.maxtemp_f;
 const tempMin = currentUnit === "metric" ? day.day.mintemp_c : day.day.mintemp_f;
 const { text, icon } = day.day.condition;

 forecastDisplay.innerHTML += `
     <div class="forecast-day">
         <h4>${date}</h4>
         <img src="https:${icon}" alt="${text}">
         <p>🌡️ Máx: ${tempMax}°${currentUnit === "metric" ? "C" : "F"}</p>
         <p>🌡️ Mín: ${tempMin}°${currentUnit === "metric" ? "C" : "F"}</p>
         <p>☁️ ${text}</p>
     </div>
 `;
});

// Hacer visibles los gráficos después de mostrar el pronóstico
document.querySelectorAll(".chart-container").forEach(container => {
 container.style.display = "block"; // Mostrar los gráficos
});
}



function createChart(ctx, label, data, color, unit) {
return new Chart(ctx, {
type: "line",
data: {
 labels: data.labels,
 datasets: [
   {
     label: label,
     data: data.values,
     backgroundColor: color,
     borderColor: color,
     fill: false,
     tension: 0.1,
   },
 ],
},
options: {
 responsive: true,
 plugins: {
   legend: {
     display: true,
   },
 },
 scales: {
   y: {
     beginAtZero: true,
     ticks: {
       callback: function (value) {
         return `${value} ${unit}`;
       },
     },
   },
 },
},
});
}

function updateCharts(forecastDays) {
const labels = forecastDays.map(day => day.date);
const tempData = forecastDays.map(day =>
currentUnit === "metric" ? day.day.avgtemp_c : day.day.avgtemp_f
);
const precipitationData = forecastDays.map(day => day.day.totalprecip_mm);
const windData = forecastDays.map(day => day.day.maxwind_kph);

if (temperatureChart) temperatureChart.destroy();
if (precipitationChart) precipitationChart.destroy();
if (windSpeedChart) windSpeedChart.destroy();

temperatureChart = createChart(
temperatureCtx,
"Temperatura Promedio",
{ labels, values: tempData },
"rgba(255, 99, 132, 0.6)",
`°${currentUnit === "metric" ? "C" : "F"}`
);

precipitationChart = createChart(
precipitationCtx,
"Precipitación Total",
{ labels, values: precipitationData },
"rgba(54, 162, 235, 0.6)",
"mm"
);

windSpeedChart = createChart(
windSpeedCtx,
"Velocidad Máxima del Viento",
{ labels, values: windData },
"rgba(75, 192, 192, 0.6)",
"kph"
);
}

searchBtn.addEventListener("click", () => {
const city = cityInput.value.trim();
if (city) getWeatherAndForecast(city);
});

celsiusBtn.addEventListener("click", () => {
currentUnit = "metric";
celsiusBtn.classList.add("active");
fahrenheitBtn.classList.remove("active");
});

fahrenheitBtn.addEventListener("click", () => {
currentUnit = "imperial";
fahrenheitBtn.classList.add("active");
celsiusBtn.classList.remove("active");
});
});

