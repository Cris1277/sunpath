
document.addEventListener("DOMContentLoaded", () => {
    const weatherDisplay = document.getElementById("weatherDisplay");
    const forecastDisplay = document.getElementById("forecastDisplay");
    const searchBtn = document.getElementById("searchBtn");
    const cityInput = document.getElementById("cityInput");
    const celsiusBtn = document.getElementById("celsiusBtn");
    const fahrenheitBtn = document.getElementById("fahrenheitBtn");
    const temperatureChartCtx = document.getElementById("temperatureChart").getContext("2d");
    const precipitationChartCtx = document.getElementById("precipitationChart").getContext("2d");
    const windSpeedChartCtx = document.getElementById("windSpeedChart").getContext("2d");

    let tempChart, precipChart, windChart;
    let unit = "metric"; // 'metric' for Celsius, 'imperial' for Fahrenheit

    // Función principal para obtener y mostrar datos del clima
    async function getWeather(city) {
        try {
            //  Esta clave API es de uso limitado y con fines de demostración en portfolio.
            // Si deseas usar la aplicación completamente, por favor obtén tu propia API key en: https://www.weatherapi.com/
            const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=a9b7f097937046b4b1d131943251501&q=${city}&days=7&lang=es`);
            if (!res.ok) throw new Error("Ciudad no encontrada");

            const data = await res.json();

            // Mostrar datos actuales
            const { name } = data.location;
            const temp = unit === "metric" ? data.current.temp_c : data.current.temp_f;
            const { text: conditionText, icon } = data.current.condition;

            weatherDisplay.innerHTML = `
                <h2>Ciudad: ${name}</h2>
                <p>Temperatura: ${temp}°${unit === "metric" ? "C" : "F"}</p>
                <p>Estado: ${conditionText}</p>
                <img src="https:${icon}" alt="${conditionText}">
            `;

            // Mostrar pronóstico de varios días
            forecastDisplay.innerHTML = "";
            data.forecast.forecastday.forEach(day => {
                const max = unit === "metric" ? day.day.maxtemp_c : day.day.maxtemp_f;
                const min = unit === "metric" ? day.day.mintemp_c : day.day.mintemp_f;
                const { date } = day;
                const { text, icon } = day.day.condition;

                forecastDisplay.innerHTML += `
                    <div class="forecast-day">
                        <h4>${date}</h4>
                        <img src="https:${icon}" alt="${text}">
                        <p>Máx: ${max}°${unit === "metric" ? "C" : "F"}</p>
                        <p>Mín: ${min}°${unit === "metric" ? "C" : "F"}</p>
                        <p>${text}</p>
                    </div>
                `;
            });

            // Mostrar contenedores de gráficas
            document.querySelectorAll(".chart-container").forEach(chart => chart.style.display = "block");

            // Preparar datos para gráficas
            const labels = data.forecast.forecastday.map(d => d.date);
            const avgTemps = data.forecast.forecastday.map(d => unit === "metric" ? d.day.avgtemp_c : d.day.avgtemp_f);
            const precip = data.forecast.forecastday.map(d => d.day.totalprecip_mm);
            const windSpeeds = data.forecast.forecastday.map(d => d.day.maxwind_kph);

            // Destruir gráficas anteriores
            tempChart && tempChart.destroy();
            precipChart && precipChart.destroy();
            windChart && windChart.destroy();

            // Crear nuevas gráficas
            tempChart = createChart(temperatureChartCtx, "Temperatura Promedio", labels, avgTemps, "rgba(255,99,132,0.6)", "°" + (unit === "metric" ? "C" : "F"));
            precipChart = createChart(precipitationChartCtx, "Precipitación Total", labels, precip, "rgba(54,162,235,0.6)", "mm");
            windChart = createChart(windSpeedChartCtx, "Velocidad del Viento", labels, windSpeeds, "rgba(75,192,192,0.6)", "kph");

        } catch (error) {
            alert(error.message);
        }
    }

    // Función para crear una gráfica con Chart.js
    function createChart(ctx, label, labels, data, color, unitLabel) {
        return new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label,
                    data,
                    backgroundColor: color,
                    borderColor: color,
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: true } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `${value} ${unitLabel}`
                        }
                    }
                }
            }
        });
    }

    // Event listeners para buscar ciudad
    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) getWeather(city);
    });

    // Botones para cambiar unidad de temperatura
    celsiusBtn.addEventListener("click", () => {
        unit = "metric";
        celsiusBtn.classList.add("active");
        fahrenheitBtn.classList.remove("active");
    });

    fahrenheitBtn.addEventListener("click", () => {
        unit = "imperial";
        fahrenheitBtn.classList.add("active");
        celsiusBtn.classList.remove("active");
    });
});
