import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Activity, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MarketInsights: React.FC = () => {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [loading, setLoading] = useState(false);
  // Add state for AI Q&A
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');

  // Add fallback demo data for realistic Indian retail prices
  const demoMarketData = [
    {
      name: 'Wheat',
      currentPrice: 31250,
      change: +2.1,
      trend: [31000, 31100, 31200, 31250, 31200, 31300, 31250, 31200, 31300, 31250, 31200, 31300, 31250, 31200, 31300, 31250, 31200, 31300, 31250, 31200, 31300, 31250, 31200, 31300, 31250, 31200, 31300, 31250, 31200, 31250]
    },
    {
      name: 'Corn',
      currentPrice: 27000,
      change: -1.2,
      trend: [27200, 27150, 27100, 27050, 27000, 26950, 27000, 27050, 27000, 26950, 27000, 27050, 27000, 26950, 27000, 27050, 27000, 26950, 27000, 27050, 27000, 26950, 27000, 27050, 27000, 26950, 27000, 27050, 27000, 27000]
    },
    {
      name: 'Soybeans',
      currentPrice: 45000,
      change: +0.8,
      trend: [44800, 44900, 45000, 45100, 45050, 45000, 44950, 45000, 45050, 45000, 44950, 45000, 45050, 45000, 44950, 45000, 45050, 45000, 44950, 45000, 45050, 45000, 44950, 45000, 45050, 45000, 44950, 45000, 45050, 45000]
    },
    {
      name: 'Rice',
      currentPrice: 42570,
      change: +1.5,
      trend: [42400, 42450, 42500, 42550, 42600, 42550, 42500, 42550, 42600, 42550, 42500, 42550, 42600, 42550, 42500, 42550, 42600, 42550, 42500, 42550, 42600, 42550, 42500, 42550, 42600, 42550, 42500, 42550, 42600, 42570]
    }
  ];

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/market-data');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setMarketData(response.data);
        setSelectedCrop(response.data[0].name);
      } else {
        setMarketData(demoMarketData);
        setSelectedCrop(demoMarketData[0].name);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      setMarketData(demoMarketData);
      setSelectedCrop(demoMarketData[0].name);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = (crop: any) => {
    const labels = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      labels,
      datasets: [
        {
          label: `${crop.name} Retail Price (₹/ton)`,
          data: crop.trend,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Price Trend (30 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const selectedCropData = marketData.find(crop => crop.name === selectedCrop);

  // Mock AI Q&A handler
  const handleAiQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock logic
    if (aiQuestion.toLowerCase().includes('best value')) {
      setAiAnswer('Wheat currently offers the best value for customers based on price and trend.');
    } else if (aiQuestion.toLowerCase().includes('why did wheat prices rise')) {
      setAiAnswer('Wheat prices rose due to recent supply shortages and increased demand.');
    } else {
      setAiAnswer('AI: Sorry, I can only answer questions about crop prices and trends for now.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Retail Crop Prices</h1>
        <p className="text-gray-600 mt-2">
          Real-time prices and trends for crops as sold to customers
        </p>
      </div>

      {/* Ask AI about Crop Prices - moved to top */}
      <div className="mb-10 bg-gradient-to-tr from-green-500 via-green-400 to-green-300 p-1 rounded-xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-00 mb-2">Ask AI about Crop Prices</h3>
          <form onSubmit={handleAiQuestion} className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. What’s the best value crop this week?"
              required
            />
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Ask AI
            </button>
          </form>
          {aiAnswer && (
            <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm text-green-900 font-medium animate-fade-in">
              {aiAnswer}
            </div>
          )}
          {/* Suggested Prompts Dropdown - now after result, smaller */}
          <div className="mt-2 w-60">
            <select
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-700 text-sm"
              value=""
              onChange={e => {
                if (e.target.value) setAiQuestion(e.target.value);
              }}
            >
              <option value="" disabled>Suggested questions…</option>
              <option value="What’s the best value crop this week?">What’s the best value crop this week?</option>
              <option value="Why did wheat prices rise recently?">Why did wheat prices rise recently?</option>
              <option value="Is it a good time to buy rice?">Is it a good time to buy rice?</option>
              <option value="Which crop has the most stable price?">Which crop has the most stable price?</option>
              <option value="What is the price trend for corn?">What is the price trend for corn?</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading market data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Market Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {marketData.map((crop, index) => (
              <div 
                key={index} 
                className={`bg-white p-4 rounded-lg shadow-md cursor-pointer transition-all ${
                  selectedCrop === crop.name ? 'ring-2 ring-green-500' : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedCrop(crop.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{crop.name}</h3>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹{crop.currentPrice}</p>
                    <p className="text-sm text-gray-600">per ton</p>
                  </div>
                  <div className="flex items-center">
                    {crop.change > 0 ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${crop.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(crop.change)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed View */}
          {selectedCropData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Price Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedCropData.name} Price Trend
                  </h3>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <Line data={getChartData(selectedCropData)} options={chartOptions} />
                {/* AI Price Prediction */}
                <div className="mt-6 bg-green-50 rounded p-4 text-green-900">
                  <span className="font-semibold">AI Price Prediction:</span> {selectedCropData.name} price is expected to {selectedCropData.change > 0 ? 'increase' : 'decrease'} slightly over the next week based on current trends.
                </div>
                {/* Best Time to Buy/Sell */}
                <div className="mt-2 bg-blue-50 rounded p-4 text-blue-900">
                  <span className="font-semibold">Best Time to {selectedCropData.change > 0 ? 'Buy' : 'Sell'}:</span> {selectedCropData.change > 0 ? 'Buy now before prices rise further.' : 'Sell soon as prices may drop.'}
                </div>
              </div>

              {/* Market Statistics */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Retail Price Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Retail Price</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{selectedCropData.currentPrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Daily Change</span>
                    <span className={`text-sm font-semibold ${selectedCropData.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedCropData.change > 0 ? '+' : ''}{selectedCropData.change}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">30-Day High</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{Math.max(...selectedCropData.trend)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">30-Day Low</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{Math.min(...selectedCropData.trend)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Volatility</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {(Math.max(...selectedCropData.trend) - Math.min(...selectedCropData.trend)).toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Customer Insights */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Customer Insights</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Trend</span>
                      <span className={`text-sm font-medium ${selectedCropData.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedCropData.change > 0 ? 'Increasing' : 'Decreasing'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Customer Recommendation</span>
                      <span className="text-sm font-medium text-blue-600">
                        {selectedCropData.change > 0 ? 'Consider buying soon' : 'Prices are stable or falling'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* New Section: Retail Price Analysis & Outlook */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Local Supply & Demand Factors Card */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Activity className="h-5 w-5 text-blue-500 mr-2" />
                Local Supply & Demand Factors
              </h3>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </span>
                  Weather conditions affecting local crop yields
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <ArrowUp className="h-4 w-4 text-yellow-600" />
                  </span>
                  Seasonal demand fluctuations
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  </span>
                  Local supply disruptions (e.g., transportation)
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </span>
                  Government policies on agricultural subsidies
                </li>
              </ul>
            </div>
            {/* Retail Price Outlook Card */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
                Retail Price Outlook
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                  <span className="font-medium text-blue-700">Short-term</span>
                  <span className="text-sm text-gray-700">Moderate price volatility expected</span>
                </div>
                <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                  <span className="font-medium text-green-700">Medium-term</span>
                  <span className="text-sm text-gray-700">Stable growth anticipated</span>
                </div>
                <div className="flex items-center justify-between bg-yellow-50 rounded-lg p-3">
                  <span className="font-medium text-yellow-700">Long-term</span>
                  <span className="text-sm text-gray-700">Positive outlook due to global demand</span>
                </div>
                <div className="flex items-center justify-between bg-red-50 rounded-lg p-3">
                  <span className="font-medium text-red-700">Risk factors</span>
                  <span className="text-sm text-gray-700">Climate change, policy changes</span>
                </div>
              </div>
              {/* Infographic: Outlook Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Short-term</span>
                  <span className="text-xs text-gray-500">Long-term</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-4 bg-blue-400 rounded-l-full" style={{ width: '25%' }}></div>
                  <div className="absolute left-1/4 top-0 h-4 bg-green-400" style={{ width: '35%' }}></div>
                  <div className="absolute left-[60%] top-0 h-4 bg-yellow-400" style={{ width: '30%' }}></div>
                  <div className="absolute left-[90%] top-0 h-4 bg-red-400 rounded-r-full" style={{ width: '10%' }}></div>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-blue-600 font-semibold">Volatile</span>
                  <span className="text-green-600 font-semibold">Stable</span>
                  <span className="text-yellow-600 font-semibold">Growth</span>
                  <span className="text-red-600 font-semibold">Risk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketInsights;