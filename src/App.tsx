import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import Weather from './pages/Weather';
import MarketInsights from './pages/MarketInsights';
import SensorData from './pages/SensorData';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="crop-recommendation" element={<CropRecommendation />} />
              <Route path="weather" element={<Weather />} />
              <Route path="market-insights" element={<MarketInsights />} />
              <Route path="sensor-data" element={<SensorData />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;