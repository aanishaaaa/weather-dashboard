import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./App.css";

function App() {
  const [cityInput, setCityInput] = useState("");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [themeMode, setThemeMode] = useState("light");
  const [fiveDayForecast, setFiveDayForecast] = useState([]);
  const [activeCity, setActiveCity] = useState(""); 
  const OPENWEATHER_API_KEY = "1620215ce8142859c566c2d57d5ea95b";

  const toggleThemeMode = () => {
    setThemeMode((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setSearchHistory(savedHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setThemeMode(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

  const fetchWeatherData = async (requestedCity = cityInput) => {
    if (!requestedCity) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${requestedCity}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      const weatherInfo = await weatherResponse.json();
      if (weatherInfo.cod !== 200) throw new Error(weatherInfo.message);
      setCurrentWeather(weatherInfo);
      setActiveCity(requestedCity); 

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${requestedCity}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      const forecastInfo = await forecastResponse.json();

      const dailyForecast = forecastInfo.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );

      setFiveDayForecast(dailyForecast);

      setSearchHistory((prevHistory) => {
        const updatedHistory = [
          requestedCity,
          ...prevHistory.filter(
            (city) => city.toLowerCase() !== requestedCity.toLowerCase()
          ),
        ];
        return updatedHistory.slice(0, 5);
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container ${themeMode}`}>
      <button onClick={toggleThemeMode} className="theme-toggle">
        Switch to {themeMode === "light" ? "Dark" : "Light"} Mode
      </button>

      <h1 className="app-heading">
        <img
          src="https://img.icons8.com/color/48/000000/partly-cloudy-day.png"
          alt="Logo"
          className="logo"
        />
        WEATHER DASHBOARD
      </h1>

      <div className="input-group">
        <input
          type="text"
          placeholder="Enter city"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
        />
        <button onClick={() => fetchWeatherData()}>Get Weather</button>
        {activeCity && (
          <button onClick={() => fetchWeatherData(activeCity)}>Refresh</button>
        )}
      </div>

      {isLoading && <div className="loader"></div>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <div className="weather-forecast-container">
        <div className="weather-history-box">
          {currentWeather && currentWeather.main && (
            <motion.div
              className="weather-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2>{currentWeather.name}</h2>
              <p>🌡 Temperature: {currentWeather.main.temp}°C</p>
              <p>🌥 Condition: {currentWeather.weather[0].description}</p>
              <p>💧 Humidity: {currentWeather.main.humidity}%</p>
              <p>💨 Wind: {currentWeather.wind.speed} m/s</p>
            </motion.div>
          )}

          {searchHistory.length > 0 && (
            <div className="history">
              <h3>Last 5 Searches:</h3>
              <ul>
                {searchHistory.map((city, index) => (
                  <motion.li
                    key={index}
                    onClick={() => fetchWeatherData(city)}
                    whileHover={{ scale: 1.05 }}
                  >
                    {city}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {fiveDayForecast.length > 0 && (
          <div className="forecast">
            <h3>5-Day Forecast:</h3>
            <div className="forecast-container">
              {fiveDayForecast.map((day, index) => (
                <div key={index} className="forecast-day">
                  <p>
                    <strong>{new Date(day.dt_txt).toLocaleDateString()}</strong>
                  </p>
                  <p>{day.weather[0].main}</p>
                  <p>🌡 {day.main.temp}°C</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
