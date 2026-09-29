import { useState } from "react";

// Import des composants
import ErrorMessage from "./components/ErrorMessage";
import ForecastCard from "./components/ForecastCard";
import LoadingSpinner from "./components/LoadingSpinner";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";

// Import des fonctions API
import {
  getCurrentWeatherByCoords,
  getForecastByCoords,
} from "./services/weatherApi";

// Retourne un dégradé CSS selon le code météo et l'icône
function getBackground(weatherData) {
  if (!weatherData) return "from-blue-800 via-blue-900 to-slate-900";

  const id = weatherData.weather[0].id;
  const icon = weatherData.weather[0].icon;

  // Nuit → détecté via la lettre "n" à la fin du code icône
  const isNight = icon.endsWith("n");
  if (isNight) return "from-indigo-950 via-blue-950 to-slate-900";

  // Orage
  if (id >= 200 && id < 300) return "from-gray-800 via-gray-900 to-slate-900";

  // Pluie / Bruine
  if (id >= 300 && id < 600) return "from-slate-600 via-slate-700 to-slate-900";

  // Neige
  if (id >= 600 && id < 700) return "from-blue-100 via-blue-200 to-slate-300";

  // Brouillard
  if (id >= 700 && id < 800) return "from-gray-400 via-gray-500 to-gray-700";

  // Ciel dégagé → soleil
  if (id === 800) return "from-amber-400 via-orange-400 to-blue-500";

  // Nuageux
  return "from-slate-400 via-slate-500 to-slate-700";
}

function App() {
  // Données météo actuelles
  const [weatherData, setWeatherData] = useState(null);

  // Données des prévisions 5 jours
  const [forecastData, setForecastData] = useState(null);

  // Chargement en cours
  const [loading, setLoading] = useState(false);

  // Message d'erreur
  const [error, setError] = useState(null);

  // Indique si l'utilisateur a déjà effectué une recherche
  // Permet d'afficher le message d'accueil tant qu'aucune recherche n'a été faite
  const [hasSearched, setHasSearched] = useState(false);

  // Appelée quand l'utilisateur choisit une ville dans les suggestions
  async function handleSearch(city) {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setForecastData(null);

    // On marque qu'une recherche a été effectuée → cache le message d'accueil
    setHasSearched(true);

    try {
      // Appels API en parallèle avec les coordonnées GPS de la ville
      const [weather, forecast] = await Promise.all([
        getCurrentWeatherByCoords(city.lat, city.lon),
        getForecastByCoords(city.lat, city.lon),
      ]);

      setWeatherData(weather);
      setForecastData(forecast);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Le dégradé change automatiquement selon la météo
  const background = getBackground(weatherData);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${background} transition-all duration-1000 p-6 flex flex-col justify-center`}
    >
      {/* Titre principal */}
      <h1 className="text-4xl font-bold text-white text-center mb-2">
        🌤️ MeteoLand
      </h1>

      {/* Sous-titre */}
      <p className="text-center text-white/60 text-sm mb-8">
        Recherchez n'importe quelle ville dans le monde
      </p>

      {/* Barre de recherche */}
      <SearchBar onSearch={handleSearch} />

      {/* Contenu principal */}
      <div className="mt-8 flex flex-col items-center gap-6">
        {/* Spinner affiché pendant le chargement */}
        {loading && <LoadingSpinner />}

        {/* Message d'erreur si la ville est introuvable */}
        {error && <ErrorMessage message={error} />}

        {/* Carte météo actuelle */}
        {weatherData && <WeatherCard data={weatherData} />}

        {/* Carte prévisions 5 jours */}
        {forecastData && <ForecastCard data={forecastData} />}

        {/* Message d'accueil → affiché uniquement avant la première recherche */}
        {!hasSearched && !loading && (
          <div className="text-center mt-8 flex flex-col items-center gap-4">
            {/* Icône décorative */}
            <div className="text-6xl">🌍</div>

            {/* Message principal */}
            <p className="text-white/70 text-lg font-medium">
              Où fait-il beau aujourd'hui ?
            </p>

            {/* Message secondaire */}
            <p className="text-white/40 text-sm max-w-xs">
              Tapez le nom d'une ville pour obtenir la météo actuelle et les
              prévisions sur 5 jours.
            </p>

            {/* Suggestions de villes populaires */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {["Paris", "Tokyo", "New York", "Sydney", "Dubai"].map((city) => (
                <span
                  key={city}
                  className="bg-white/10 border border-white/20 text-white/60 text-xs px-3 py-1 rounded-full"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
