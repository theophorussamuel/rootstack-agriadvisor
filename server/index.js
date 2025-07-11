import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
let users = [
  { id: 1, email: 'farmer@example.com', password: 'password', role: 'farmer', name: 'John Farmer', location: 'California', landSize: 50 },
  { id: 2, email: 'agronomist@example.com', password: 'password', role: 'agronomist', name: 'Dr. Sarah Green', location: 'Iowa', landSize: 0 }
];

let cropRecommendations = [];
let blockchainLogs = [];

// Auth endpoints
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/signup', (req, res) => {
  const { email, password, role, name, location, landSize } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }
  
  const newUser = {
    id: users.length + 1,
    email,
    password,
    role,
    name,
    location,
    landSize: landSize || 0
  };
  
  users.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ success: true, user: userWithoutPassword });
});

// Crop recommendation endpoint
app.post('/api/recommend-crop', (req, res) => {
  const { location, season, soilType, landSize } = req.body;
  
  // Mock AI logic for crop recommendations
  const cropDatabase = {
    spring: {
      clay: ['Wheat', 'Barley', 'Oats'],
      sandy: ['Corn', 'Soybeans', 'Sunflower'],
      loamy: ['Tomatoes', 'Peppers', 'Lettuce']
    },
    summer: {
      clay: ['Rice', 'Cotton', 'Sugarcane'],
      sandy: ['Peanuts', 'Sweet Potato', 'Watermelon'],
      loamy: ['Corn', 'Beans', 'Squash']
    },
    fall: {
      clay: ['Winter Wheat', 'Rye', 'Rapeseed'],
      sandy: ['Carrots', 'Radishes', 'Turnips'],
      loamy: ['Cabbage', 'Broccoli', 'Cauliflower']
    },
    winter: {
      clay: ['Cover Crops', 'Alfalfa', 'Clover'],
      sandy: ['Winter Rye', 'Crimson Clover', 'Winter Peas'],
      loamy: ['Spinach', 'Kale', 'Winter Lettuce']
    }
  };
  
  const recommendations = cropDatabase[season]?.[soilType] || ['Corn', 'Wheat', 'Soybeans'];
  
  const result = {
    recommendations: recommendations.slice(0, 3).map(crop => ({
      name: crop,
      confidence: Math.round(Math.random() * 30 + 70),
      expectedYield: Math.round(Math.random() * 50 + 20),
      estimatedProfit: Math.round(Math.random() * 5000 + 2000)
    })),
    factors: {
      location,
      season,
      soilType,
      landSize
    }
  };
  
  cropRecommendations.push({ ...result, timestamp: new Date() });
  
  // Simulate blockchain logging
  const logEntry = {
    id: blockchainLogs.length + 1,
    hash: `0x${Math.random().toString(16).substr(2, 8)}`,
    timestamp: new Date(),
    data: { recommendations: result.recommendations.map(r => r.name) },
    previousHash: blockchainLogs.length > 0 ? blockchainLogs[blockchainLogs.length - 1].hash : '0x0'
  };
  blockchainLogs.push(logEntry);
  
  res.json(result);
});

// Weather endpoint
app.get('/api/weather/:lat/:lng', async (req, res) => {
  const { lat, lng } = req.params;
  try {
    // Fetch real weather data from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&forecast_days=10&timezone=auto`;
    const response = await fetch(url);
    const data = await response.json();

    // Map Open-Meteo weather codes to descriptions
    const weatherCodeMap = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Drizzle',
      55: 'Dense drizzle',
      56: 'Freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Rain',
      65: 'Heavy rain',
      66: 'Freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with heavy hail',
    };

    // Compose current weather
    const current = {
      temp: data.current_weather?.temperature,
      humidity: null, // Open-Meteo free API does not provide current humidity
      windSpeed: data.current_weather?.windspeed,
      description: weatherCodeMap[data.current_weather?.weathercode] || 'N/A',
    };

    // Compose 10-day forecast
    const forecast = (data.daily?.time || []).map((date, i) => ({
      date,
      temp: data.daily.temperature_2m_max[i],
      humidity: null, // Not available in free API
      precipitation: data.daily.precipitation_sum[i],
      description: weatherCodeMap[data.daily.weathercode[i]] || 'N/A',
    }));

    res.json({
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      current,
      forecast,
    });
  } catch (error) {
    res.status(500).json({ error: 'Weather data unavailable' });
  }
});

// Market data endpoint
app.get('/api/market-data', (req, res) => {
  const crops = ['Wheat', 'Corn', 'Soybeans', 'Rice', 'Cotton'];
  const marketData = crops.map(crop => ({
    name: crop,
    currentPrice: Math.round(Math.random() * 500 + 100),
    change: Math.round((Math.random() - 0.5) * 50),
    trend: Array.from({ length: 30 }, () => Math.round(Math.random() * 500 + 100))
  }));
  
  res.json(marketData);
});

// Sensor data endpoint
app.get('/api/sensors/:userId', (req, res) => {
  const { userId } = req.params;
  
  const sensorData = {
    userId: parseInt(userId),
    timestamp: new Date(),
    ndvi: Math.round(Math.random() * 40 + 60), // 60-100 range
    soilMoisture: Math.round(Math.random() * 30 + 20), // 20-50 range
    temperature: Math.round(Math.random() * 30 + 10),
    pH: Math.round((Math.random() * 3 + 6) * 10) / 10, // 6.0-9.0 range
    nitrogen: Math.round(Math.random() * 100 + 50),
    phosphorus: Math.round(Math.random() * 50 + 20),
    potassium: Math.round(Math.random() * 80 + 40)
  };
  
  res.json(sensorData);
});

// Blockchain logs endpoint
app.get('/api/blockchain-logs', (req, res) => {
  res.json(blockchainLogs.slice(-10)); // Return last 10 logs
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});