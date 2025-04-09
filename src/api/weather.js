const API_KEY = '4708b95dc986f34d7eed4f339316e7a0';

export const fetchWeather = async (city) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  );
  if (!response.ok) {
    throw new Error('City not found');
  }
  return response.json();
};