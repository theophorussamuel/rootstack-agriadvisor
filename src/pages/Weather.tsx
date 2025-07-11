import React, { useState, useEffect } from 'react';
import { CloudRain, Thermometer, Droplets, Wind, MapPin, Calendar, Navigation, Search } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, LayersControl, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Weather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [location, setLocation] = useState({
    name: 'New York, NY',
    lat: 40.7128,
    lng: -74.0060
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  // Automatically detect and set current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Optionally, use a reverse geocoding API for a better name
            setLocation({
              name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              lat: latitude,
              lng: longitude
            });
          } catch (error) {
            setLocation({
              name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              lat: latitude,
              lng: longitude
            });
          }
        },
        () => {
          // Do nothing if user denies or error occurs
        }
      );
    }
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/weather/${location.lat}/${location.lng}`);
      setWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            setLocation({
              name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              lat: latitude,
              lng: longitude
            });
          } catch (error) {
            console.error('Error getting location name:', error);
          } finally {
            setGettingLocation(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setGettingLocation(false);
          alert('Unable to get your current location. Please check your browser permissions.');
        }
      );
    } else {
      setGettingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  const searchLocation = (query: string) => {
    const mockLocations = [
      { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
      { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
      { name: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
      { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
      { name: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652 },
      { name: 'San Antonio, TX', lat: 29.4241, lng: -98.4936 },
      { name: 'San Diego, CA', lat: 32.7157, lng: -117.1611 },
      { name: 'Dallas, TX', lat: 32.7767, lng: -96.7970 },
      { name: 'San Jose, CA', lat: 37.3382, lng: -121.8863 }
    ];
    
    return mockLocations.filter(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getWeatherIcon = (description: string) => {
    if (description.includes('rain')) return '🌧️';
    if (description.includes('cloud')) return '☁️';
    if (description.includes('sunny') || description.includes('clear')) return '☀️';
    return '🌤️';
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Weather Forecast</h1>
            <p className="text-gray-600 mt-2">
              10-day weather forecast for your agricultural planning
            </p>
          </div>
          
          {/* Location Selector */}
          <div className="relative">
            <div className="flex items-center space-x-2">
              <button
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                title="Get current location"
              >
                <Navigation className={`h-4 w-4 ${gettingLocation ? 'animate-spin' : ''}`} />
                <span className="text-sm">Current</span>
              </button>
              
              <button
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MapPin className="h-4 w-4 text-gray-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">{location.name}</p>
                  <p className="text-xs text-gray-500">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                </div>
              </button>
            </div>
            
            {/* Location Picker Dropdown */}
            {showLocationPicker && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      placeholder="Search for a city..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto">
                    {locationSearch ? (
                      searchLocation(locationSearch).map((loc, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setLocation(loc);
                            setShowLocationPicker(false);
                            setLocationSearch('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">{loc.name}</p>
                              <p className="text-xs text-gray-500">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Start typing to search for locations</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading weather data...</p>
        </div>
      ) : weatherData ? (
        <div className="space-y-6">
          {/* Current Weather */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Current Weather</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {location.name}
                  </span>
                </div>
                <p className="text-sm opacity-90">{weatherData.current.description}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl mb-2">{getWeatherIcon(weatherData.current.description)}</div>
                <div className="text-3xl font-bold">{weatherData.current.temp}°C</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <Droplets className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Humidity</p>
                  <p className="font-semibold">{weatherData.current.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Wind Speed</p>
                  <p className="font-semibold">{weatherData.current.windSpeed} km/h</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CloudRain className="h-5 w-5" />
                <div>
                  <p className="text-sm opacity-90">Conditions</p>
                  <p className="font-semibold">Good</p>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">10-Day Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weatherData.forecast.map((day: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-3xl mb-2">{getWeatherIcon(day.description)}</div>
                  <p className="text-lg font-semibold text-gray-800">{day.temp}°C</p>
                  <p className="text-sm text-gray-600 mb-2">{day.description}</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-1">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-gray-600">{day.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <CloudRain className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{day.precipitation}mm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Map Section - moved here */}
          <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg mb-6">
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={7}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.Overlay name="Precipitation">
                  <TileLayer
                    url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHERMAP_API_KEY"
                    attribution="&copy; <a href='https://openweathermap.org/'>OpenWeatherMap</a>"
                    opacity={0.5}
                  />
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Clouds">
                  <TileLayer
                    url="https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHERMAP_API_KEY"
                    attribution="&copy; <a href='https://openweathermap.org/'>OpenWeatherMap</a>"
                    opacity={0.5}
                  />
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Temperature">
                  <TileLayer
                    url="https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=YOUR_OPENWEATHERMAP_API_KEY"
                    attribution="&copy; <a href='https://openweathermap.org/'>OpenWeatherMap</a>"
                    opacity={0.5}
                  />
                </LayersControl.Overlay>
              </LayersControl>
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  {location.name}
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Agricultural Insights */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Agricultural Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Irrigation Recommendations</h4>
                <div className="space-y-2">
                  {weatherData.forecast.slice(0, 3).map((day: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className={`text-sm font-medium ${day.precipitation > 5 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {day.precipitation > 5 ? 'Natural irrigation' : 'Irrigation needed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Farming Activity Suggestions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Planting conditions</span>
                    <span className="text-sm font-medium text-green-600">Favorable</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Harvesting weather</span>
                    <span className="text-sm font-medium text-green-600">Good</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pest risk</span>
                    <span className="text-sm font-medium text-yellow-600">Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <CloudRain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Weather Data</h3>
          <p className="text-gray-500">Unable to fetch weather information at this time.</p>
        </div>
      )}
      {weatherData && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">AI Weather Advisor</h3>
          <ul className="list-disc pl-6 text-blue-900 space-y-1">
            <li>
              {weatherData.current && weatherData.current.temp > 35
                ? 'High temperatures detected. Consider irrigation and monitor for heat stress in crops.'
                : 'Temperature is optimal for most crops.'}
            </li>
            <li>
              {weatherData.current && weatherData.current.humidity > 80
                ? 'High humidity may increase risk of fungal diseases. Monitor crops closely.'
                : 'Humidity levels are normal.'}
            </li>
            <li>
              {weatherData.forecast && weatherData.forecast[0]?.precipitation > 10
                ? 'Heavy rainfall expected soon. Prepare drainage and avoid fertilizer application.'
                : 'No heavy rainfall expected in the next day.'}
            </li>
            <li>
              {/* Mocked pest/disease risk */}
              {weatherData.current && weatherData.current.temp > 30 && weatherData.current.humidity > 70
                ? 'Conditions may favor pest outbreaks. Consider preventive measures.'
                : 'No major pest/disease risk detected.'}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Weather;