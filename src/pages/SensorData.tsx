import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Satellite, 
  Thermometer, 
  Droplets, 
  Activity, 
  Beaker, 
  Leaf, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

const SensorData: React.FC = () => {
  const { user } = useAuth();
  const [sensorData, setSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Add AI-powered anomaly detection and recommendations
  const [aiSummary, setAiSummary] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);

  // Mock sensor data (replace with real data fetching if available)
  const mockSensorData = useMemo(() => {
    return [
      { id: 1, type: 'Soil Moisture', value: 18, unit: '%', normalRange: [20, 60] },
      { id: 2, type: 'Temperature', value: 38, unit: '°C', normalRange: [15, 35] },
      { id: 3, type: 'Humidity', value: 45, unit: '%', normalRange: [40, 80] },
      { id: 4, type: 'pH', value: 5.2, unit: '', normalRange: [6, 7.5] },
    ];
  }, []);

  // AI-powered analysis (mocked)
  const aiAnalysis = useMemo(() => {
    const anomalies = mockSensorData.filter(d => d.value < d.normalRange[0] || d.value > d.normalRange[1]);
    let summary = '';
    let recs: string[] = [];
    if (anomalies.length === 0) {
      summary = 'All sensor readings are within normal ranges. No action needed.';
      recs = ['Continue regular monitoring.'];
    } else {
      summary = `Detected ${anomalies.length} issue(s): ` + anomalies.map(a => a.type).join(', ') + '.';
      anomalies.forEach(a => {
        if (a.type === 'Soil Moisture') recs.push('Irrigate the field to increase soil moisture.');
        if (a.type === 'Temperature') recs.push('Consider shade nets or irrigation to reduce temperature.');
        if (a.type === 'Humidity') recs.push('Monitor for plant stress due to low humidity.');
        if (a.type === 'pH') recs.push('Apply lime to raise soil pH.');
      });
    }
    return { summary, recs };
  }, [mockSensorData]);

  // Update summary and recommendations when analysis changes
  useEffect(() => {
    setAiSummary(aiAnalysis.summary);
    setAiRecommendations(aiAnalysis.recs);
  }, [aiAnalysis]);

  useEffect(() => {
    if (user) {
      fetchSensorData();
    }
  }, [user]);

  const fetchSensorData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/sensors/${user.id}`);
      setSensorData(response.data);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value: number, min: number, max: number) => {
    if (value < min || value > max) return 'text-red-600';
    if (value < min + (max - min) * 0.2 || value > max - (max - min) * 0.2) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (value: number, min: number, max: number) => {
    if (value < min || value > max) return AlertTriangle;
    return CheckCircle;
  };

  const SensorCard = ({ icon: Icon, title, value, unit, min, max, description }: any) => {
    const StatusIcon = getStatusIcon(value, min, max);
    const statusColor = getStatusColor(value, min, max);
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <StatusIcon className={`h-5 w-5 ${statusColor}`} />
        </div>
        <div className="mb-4">
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            <span className="text-lg text-gray-600">{unit}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Normal range: {min} - {max} {unit}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              value < min || value > max ? 'bg-red-500' : 
              value < min + (max - min) * 0.2 || value > max - (max - min) * 0.2 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-green-700 mb-2">AI Sensor Data Analysis</h2>
        <div className="text-gray-800 mb-2">{aiSummary}</div>
        <ul className="list-disc pl-6 text-green-900">
          {aiRecommendations.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Satellite & Sensor Data</h1>
            <p className="text-gray-600 mt-2">
              Real-time monitoring of your farm's environmental conditions
            </p>
          </div>
          <button
            onClick={fetchSensorData}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading sensor data...</p>
        </div>
      ) : sensorData ? (
        <div className="space-y-6">
          {/* Satellite Data */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Satellite Analysis</h3>
              <Satellite className="h-5 w-5 text-green-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">NDVI (Vegetation Health)</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-end space-x-2">
                      <span className="text-2xl font-bold text-green-600">{sensorData.ndvi}%</span>
                      <span className="text-sm text-gray-600">Health Index</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${sensorData.ndvi}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <p className="text-sm text-green-600 mt-1">Healthy</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Coverage Analysis</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Crop coverage: 95% of field</p>
                  <p>• Growth stage: Vegetative</p>
                  <p>• Stress indicators: None detected</p>
                  <p>• Last updated: {new Date(sensorData.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Sensors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SensorCard
              icon={Thermometer}
              title="Temperature"
              value={sensorData.temperature}
              unit="°C"
              min={15}
              max={35}
              description="Ambient temperature"
            />
            <SensorCard
              icon={Droplets}
              title="Soil Moisture"
              value={sensorData.soilMoisture}
              unit="%"
              min={25}
              max={75}
              description="Soil water content"
            />
            <SensorCard
              icon={Activity}
              title="pH Level"
              value={sensorData.pH}
              unit=""
              min={6.0}
              max={8.0}
              description="Soil acidity/alkalinity"
            />
          </div>

          {/* Soil Nutrients */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Soil Nutrient Analysis</h3>
              <Beaker className="h-5 w-5 text-purple-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <h4 className="text-md font-semibold text-gray-700">Nitrogen (N)</h4>
                </div>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{sensorData.nitrogen}</span>
                  <span className="text-sm text-gray-600">ppm</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(sensorData.nitrogen / 150) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Optimal: 50-150 ppm</p>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Leaf className="h-5 w-5 text-orange-600" />
                  <h4 className="text-md font-semibold text-gray-700">Phosphorus (P)</h4>
                </div>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{sensorData.phosphorus}</span>
                  <span className="text-sm text-gray-600">ppm</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(sensorData.phosphorus / 70) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Optimal: 20-70 ppm</p>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Leaf className="h-5 w-5 text-blue-600" />
                  <h4 className="text-md font-semibold text-gray-700">Potassium (K)</h4>
                </div>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{sensorData.potassium}</span>
                  <span className="text-sm text-gray-600">ppm</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(sensorData.potassium / 120) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Optimal: 40-120 ppm</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Smart Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Immediate Actions</h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-600">Soil moisture levels are optimal</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-600">Temperature within acceptable range</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <span className="text-sm text-gray-600">Monitor pH levels - slightly elevated</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Nutrient Management</h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-600">Nitrogen levels are sufficient</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-600">Phosphorus within optimal range</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-600">Potassium levels are good</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <Satellite className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sensor Data</h3>
          <p className="text-gray-500">Unable to fetch sensor information at this time.</p>
        </div>
      )}
    </div>
  );
};

export default SensorData;