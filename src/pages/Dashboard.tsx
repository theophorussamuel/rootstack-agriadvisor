import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Wheat,
  CloudRain,
  TrendingUp,
  Satellite,
  Thermometer,
  Activity,
  ArrowUp,
  ArrowDown,
  MapPin,
  Navigation,
  Search
} from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet-velocity';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState({
    name: 'New York, NY',
    lat: 40.7128,
    lng: -74.0060
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [sensorData, setSensorData] = useState<any>(null);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch weather data (using default coordinates)
        const weatherResponse = await axios.get(`http://localhost:3001/api/weather/${location.lat}/${location.lng}`);
        setWeatherData(weatherResponse.data);

        // Fetch sensor data for location (mocked, since backend does not support lat/lng)
        const sensorMock = {
          ndvi: Math.round(Math.random() * 40 + 60),
          temperature: Math.round(Math.random() * 30 + 10),
          humidity: Math.round(Math.random() * 40 + 40),
          timestamp: new Date().toLocaleString(),
        };
        setSensorData(sensorMock);

        // Fetch market data
        const marketResponse = await axios.get('http://localhost:3001/api/market-data');
        setMarketData(marketResponse.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user, location]);

  // Automatically detect and set current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use OpenStreetMap Nominatim for reverse geocoding
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const geoData = await geoRes.json();
            const displayName = geoData.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setLocation({
              name: displayName,
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
        (error) => {
          // Do nothing if user denies or error occurs
        }
      );
    }
  }, []);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use OpenStreetMap Nominatim for reverse geocoding
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const geoData = await geoRes.json();
            const displayName = geoData.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setLocation({
              name: displayName,
              lat: latitude,
              lng: longitude
            });
            // Optionally, you can force a weather data refresh here if needed
            // fetchDashboardData();
          } catch (error) {
            console.error('Error getting location name:', error);
            setLocation({
              name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              lat: latitude,
              lng: longitude
            });
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
    // Mock location search - in a real app, you'd use a geocoding service
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

  const StatCard = ({ icon: Icon, title, value, change, color }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {change && (
        <div className="mt-2 flex items-center">
          {change > 0 ? (
            <ArrowUp className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm ml-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>{Math.abs(change)}%</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's your agricultural dashboard overview
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
                  {/* Lat/Lng Inputs */}
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="number"
                      step="any"
                      value={latInput}
                      onChange={e => setLatInput(e.target.value)}
                      placeholder="Latitude"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      step="any"
                      value={lngInput}
                      onChange={e => setLngInput(e.target.value)}
                      placeholder="Longitude"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <button
                    className="w-full mb-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={() => {
                      const lat = parseFloat(latInput);
                      const lng = parseFloat(lngInput);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        setLocation({
                          name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                          lat,
                          lng
                        });
                        setShowLocationPicker(false);
                        setLocationSearch('');
                        setLatInput('');
                        setLngInput('');
                      } else {
                        alert('Please enter valid latitude and longitude values.');
                      }
                    }}
                  >
                    Set Location by Coordinates
                  </button>
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

      {/* Stats Grid - Only Weather, NDVI (satellite), Market */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Thermometer}
          title="Temperature"
          value={weatherData?.current?.temp ? `${weatherData.current.temp}°C` : '--'}
          color="bg-orange-500"
        />
        <StatCard
          icon={Activity}
          title="NDVI Index"
          value={sensorData?.ndvi ? `${sensorData.ndvi}%` : '--'}
          color="bg-green-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Market Status"
          value="Active"
          color="bg-purple-500"
        />
      </div>

      {/* Content Grid - Weather, Satellite/IoT, Market */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Weather Forecast</h3>
            <CloudRain className="h-5 w-5 text-blue-500" />
          </div>
          {weatherData?.forecast ? (
            <div className="overflow-x-auto">
              <div className="flex space-x-4 min-w-max">
                {weatherData.forecast.slice(0, 10).map((day: any, index: number) => (
                  <div key={index} className="flex flex-col items-center bg-gray-50 rounded-lg px-4 py-2 min-w-[90px]">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">{day.description}</p>
                    <p className="text-lg font-semibold text-gray-800">{day.temp}°C</p>
                    <p className="text-xs text-blue-500">{day.precipitation}mm</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading weather data...</p>
          )}
        </div>

        {/* Satellite/IoT Sensor Data Widget (location-based, clean card) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Satellite & IoT Sensors</h3>
            <Satellite className="h-5 w-5 text-green-500" />
          </div>
          {sensorData ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">NDVI Index</span>
                <span className="text-sm font-semibold">{sensorData.ndvi}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Temperature (Local)</span>
                <span className="text-sm font-semibold">{sensorData.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Humidity (Local)</span>
                <span className="text-sm font-semibold">{sensorData.humidity}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Last updated</span>
                <span className="text-xs text-gray-500">{sensorData.timestamp}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">Data for selected location (lat/lng) from satellite and IoT field sensors</div>
            </div>
          ) : (
            <p className="text-gray-500">Loading sensor data...</p>
          )}
        </div>

        {/* Market Trends Widget */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Market Trends</h3>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            {marketData.map((crop, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">{crop.name}</p>
                  <p className="text-xs text-gray-500">₹{crop.currentPrice}/ton</p>
                </div>
                <div className="flex items-center">
                  {crop.change > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${crop.change > 0 ? 'text-green-600' : 'text-red-600'}`}>{Math.abs(crop.change)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsTabbed location={location} />
    </div>
  );
};

const QuickActionsTabbed: React.FC<{ location: any }> = ({ location }) => {
  const [activeTab, setActiveTab] = useState('crop-recommendations');

  const tabs = [
    {
      id: 'crop-recommendations',
      label: 'Get Crop Recommendations',
      icon: Wheat,
      color: 'green'
    },
    {
      id: 'weather-details',
      label: 'Check Weather Details',
      icon: CloudRain,
      color: 'blue'
    },
    {
      id: 'market-analysis',
      label: 'View Market Analysis',
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 shadow-sm">
        <nav className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            // Choose color classes based on tab
            let activeBg = '';
            let activeText = '';
            let border = '';
            if (tab.color === 'green') {
              activeBg = 'bg-green-100';
              activeText = 'text-green-700';
              border = 'border-green-500';
            } else if (tab.color === 'blue') {
              activeBg = 'bg-blue-100';
              activeText = 'text-blue-700';
              border = 'border-blue-500';
            } else if (tab.color === 'purple') {
              activeBg = 'bg-purple-100';
              activeText = 'text-purple-700';
              border = 'border-purple-500';
            }
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors focus:outline-none
                  ${isActive
                    ? `${activeText} border-b-4 ${border} ${activeBg} shadow-md`
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                style={{ minWidth: 0 }}
              >
                <Icon className={`h-5 w-5 ${isActive ? activeText : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      {/* Tab Content */}
      <div className="p-6 bg-gray-50">
        {activeTab === 'crop-recommendations' && <CropRecommendationsTab />}
        {activeTab === 'weather-details' && <WeatherDetailsTab location={location} />}
        {activeTab === 'market-analysis' && <MarketAnalysisTab />}
      </div>
    </div>
  );
};

const CropRecommendationsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Wheat className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">AI-Powered Crop Recommendations</h3>
        <p className="text-gray-600 mb-6">Get personalized crop suggestions based on your farm conditions</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">Soil Analysis</h4>
          <p className="text-sm text-green-700">Advanced soil composition and nutrient analysis</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">Climate Matching</h4>
          <p className="text-sm text-green-700">Weather pattern and seasonal optimization</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">Market Trends</h4>
          <p className="text-sm text-green-700">Profit potential and demand forecasting</p>
        </div>
      </div>
      
      <div className="text-center">
        <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
          Start Crop Analysis
        </button>
      </div>
    </div>
  );
};

const WEATHER_OVERLAYS = [
  { key: 'precipitation_new', label: 'Precipitation' },
  { key: 'temp_new', label: 'Temperature' },
  { key: 'wind_new', label: 'Wind' },
  { key: 'heatmap', label: 'Heat Map' },
];

// Helper component to recenter the map when currentPosition changes
const RecenterMap: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const WeatherDetailsTab: React.FC<{ location: any }> = ({ location }) => {
  const [activeOverlays, setActiveOverlays] = useState<{ [key: string]: boolean }>({
    precipitation_new: false,
    temp_new: false,
    wind_new: false,
    heatmap: true,
  });
  const [precipData, setPrecipData] = useState<any[]>([]);
  const [tempData, setTempData] = useState<any[]>([]);
  const [windData, setWindData] = useState<any>(null);
  const [mapRef, setMapRef] = useState<any>(null);

  const mapCenter: LatLngExpression = [Number(location.lat), Number(location.lng)];

  // Fetch grid data for overlays
  const fetchOverlayData = async (bounds: any) => {
    const { _southWest, _northEast } = bounds;
    const latMin = _southWest.lat;
    const latMax = _northEast.lat;
    const lngMin = _southWest.lng;
    const lngMax = _northEast.lng;
    // Use a grid of points (e.g., 10x10)
    const latSteps = 10;
    const lngSteps = 10;
    const latStep = (latMax - latMin) / latSteps;
    const lngStep = (lngMax - lngMin) / lngSteps;
    const tempPoints: any[] = [];
    const precipPoints: any[] = [];
    const windPoints: any[] = [];
    for (let i = 0; i <= latSteps; i++) {
      for (let j = 0; j <= lngSteps; j++) {
        const lat = latMin + i * latStep;
        const lng = lngMin + j * lngStep;
        // Fetch for each point (could be optimized with batch API if available)
        // For demo, just use the center point for all
        tempPoints.push([lat, lng, null]);
        precipPoints.push([lat, lng, null]);
        windPoints.push({ lat, lng, u: null, v: null });
      }
    }
    // Fetch Open-Meteo grid data for the center
    const centerLat = (latMin + latMax) / 2;
    const centerLng = (lngMin + lngMax) / 2;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${centerLat}&longitude=${centerLng}&hourly=temperature_2m,precipitation,windspeed_10m,winddirection_10m&forecast_days=1&timezone=auto`;
    const response = await fetch(url);
    const data = await response.json();
    // Use the first hour's data for overlays
    const temp = data.hourly?.temperature_2m?.[0] || 0;
    const precip = data.hourly?.precipitation?.[0] || 0;
    const windSpeed = data.hourly?.windspeed_10m?.[0] || 0;
    const windDir = data.hourly?.winddirection_10m?.[0] || 0;
    // Fill all points with the same value (for demo; can be improved with real grid API)
    tempPoints.forEach(p => p[2] = temp);
    precipPoints.forEach(p => p[2] = precip);
    windPoints.forEach(p => {
      // Convert wind speed/direction to u/v
      const rad = (windDir * Math.PI) / 180;
      p.u = windSpeed * Math.sin(rad);
      p.v = windSpeed * Math.cos(rad);
    });
    setTempData(tempPoints);
    setPrecipData(precipPoints);
    setWindData({ data: windPoints, speed: windSpeed, dir: windDir });
  };

  // Fetch overlay data when overlays are toggled or map moves
  useEffect(() => {
    if (!mapRef) return;
    const bounds = mapRef.getBounds();
    fetchOverlayData(bounds);
    // Listen for map move/zoom
    const onMove = () => fetchOverlayData(mapRef.getBounds());
    mapRef.on('moveend', onMove);
    return () => {
      mapRef.off('moveend', onMove);
    };
    // eslint-disable-next-line
  }, [activeOverlays, mapRef, location]);

  // Custom HeatLayer for React-Leaflet
  function HeatLayer({ points, visible }: { points: any[], visible: boolean }) {
    const map = useMap();
    useEffect(() => {
      let layer: any;
      if (visible && points.length) {
        layer = (L as any).heatLayer(points, { radius: 30, blur: 20, maxZoom: 12 });
        layer.addTo(map);
      }
      return () => {
        if (layer) map.removeLayer(layer);
      };
      // eslint-disable-next-line
    }, [visible, points]);
    return null;
  }

  // Custom VelocityLayer for React-Leaflet
  function VelocityLayer({ wind, visible }: { wind: any, visible: boolean }) {
    const map = useMap();
    useEffect(() => {
      let layer: any;
      if (visible && wind && wind.data.length) {
        layer = (L as any).velocityLayer({
          displayValues: true,
          displayOptions: {
            velocityType: 'Global Wind',
            position: 'bottomleft',
            emptyString: 'No wind data',
            angleConvention: 'bearingCW',
            speedUnit: 'm/s',
          },
          data: {
            u: wind.data.map((p: any) => p.u),
            v: wind.data.map((p: any) => p.v),
            grid: wind.data,
            header: {
              parameterUnit: 'm/s',
              parameterNumber: 2,
              parameterNumberName: 'Wind speed',
              parameterCategory: 2,
              nx: 11,
              ny: 11,
              lo1: wind.data[0]?.lng,
              la1: wind.data[0]?.lat,
              lo2: wind.data[wind.data.length - 1]?.lng,
              la2: wind.data[wind.data.length - 1]?.lat,
              dx: 1,
              dy: 1,
              refTime: new Date().toISOString(),
            },
          },
        });
        layer.addTo(map);
      }
      return () => {
        if (layer) map.removeLayer(layer);
      };
      // eslint-disable-next-line
    }, [visible, wind]);
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CloudRain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Live Weather Map</h3>
        <p className="text-gray-600 mb-6">Real-time interactive weather and satellite map</p>
      </div>
      {/* Overlay Filter Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
        {WEATHER_OVERLAYS.map((overlay) => (
          <button
            key={overlay.key}
            onClick={() => setActiveOverlays((prev) => ({ ...prev, [overlay.key]: !prev[overlay.key] }))}
            className={`px-4 py-2 rounded-lg border transition-colors font-medium text-sm
              ${activeOverlays[overlay.key] ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
          >
            {activeOverlays[overlay.key] ? '✓ ' : ''}{overlay.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Map */}
        <div className="lg:col-span-2">
          <div className="rounded-lg overflow-hidden h-96 relative">
            <MapContainer
              center={mapCenter}
              zoom={7}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
              ref={(ref: any) => {
                if (ref && ref.target && mapRef !== ref.target) setMapRef(ref.target);
              }}
            >
              <RecenterMap center={mapCenter} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Real-time overlays */}
              <HeatLayer points={precipData} visible={activeOverlays['precipitation_new']} />
              <HeatLayer points={tempData} visible={activeOverlays['temp_new']} />
              <VelocityLayer wind={windData} visible={activeOverlays['wind_new']} />
              <Marker position={mapCenter}>
                <Popup>
                  <span>{location.name}</span>
                  <br />
                  <span>{mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</span>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
        {/* Weather Details Panel (show location info) */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Current Location</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Name</span>
                <span className="font-medium">{location.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Latitude</span>
                <span className="font-medium text-orange-600">{mapCenter[0]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Longitude</span>
                <span className="font-medium text-blue-600">{mapCenter[1]}</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">Weather Map Info</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Pan and zoom to explore weather in your region.</p>
              <p>• Marker shows your selected location.</p>
              <p>• Toggle overlays above to see clouds, precipitation, temperature, and wind.</p>
            </div>
           
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketAnalysisTab: React.FC = () => {
  const marketTrends = [
    { crop: 'Wheat', price: 24524, change: +12, trend: 'up' },
    { crop: 'Corn', price: 18923, change: -8, trend: 'down' },
    { crop: 'Soybeans', price: 35642, change: +15, trend: 'up' },
    { crop: 'Rice', price: 29823, change: +3, trend: 'up' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <TrendingUp className="h-16 w-16 text-purple-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Market Analysis Dashboard</h3>
        <p className="text-gray-600 mb-6">Real-time commodity prices and market trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketTrends.map((item, index) => (
          <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-purple-800">{item.crop}</h4>
              {item.trend === 'up' ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-900">₹{item.price}</p>
              <p className="text-sm text-purple-700">per ton</p>
              <p className={`text-sm font-medium ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.change > 0 ? '+' : ''}{item.change}% today
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Market Insights</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• Wheat prices rising due to export demand</p>
            <p>• Corn market affected by weather concerns</p>
            <p>• Soybean futures showing strong momentum</p>
            <p>• Rice market stable with steady demand</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Trading Opportunities</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• Consider wheat contracts for Q2</p>
            <p>• Monitor corn price volatility</p>
            <p>• Soybean futures looking bullish</p>
            <p>• Rice offers stable returns</p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
          View Detailed Analysis
        </button>
      </div>
    </div>
  );
};

export default Dashboard;