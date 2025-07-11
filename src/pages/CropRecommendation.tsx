import React, { useState, useRef } from 'react';
import { Wheat, Sparkles, TrendingUp, Calendar, MapPin, Image as ImageIcon, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import axios from 'axios';

const CropRecommendation: React.FC = () => {
  const [formData, setFormData] = useState({
    location: '',
    season: 'spring',
    soilType: 'loamy',
    landSize: ''
  });
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Add state for image recognition
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiImageResult, setAiImageResult] = useState<null | { crop: string; health: string; issues: string[] }>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/recommend-crop', {
        ...formData,
        landSize: parseFloat(formData.landSize)
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    setAiImageResult(null);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageAnalyze = () => {
    // Mock AI analysis
    setAiImageResult({
      crop: 'Wheat',
      health: 'Healthy',
      issues: ['No visible disease or pest detected.']
    });
  };

  return (
    <div className="p-6 px-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI-Powered Crop Recommendation</h1>
        <p className="text-gray-600 mt-2">
          Get personalized crop suggestions based on your location, soil, and season
        </p>
      </div>

      {/* Replace the two-column layout with a single-column, stacked layout */}
      <div className="mt-10 flex flex-col items-center w-full gap-12">
        {/* Main Crop Recommendation Form and Results */}
        <div className="w-full mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Farm Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your location"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Season
                </label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="fall">Fall</option>
                  <option value="winter">Winter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soil Type
                </label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="clay">Clay</option>
                  <option value="sandy">Sandy</option>
                  <option value="loamy">Loamy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land Size (acres)
                </label>
                <input
                  type="number"
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter land size"
                  min="0"
                  step="0.1"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  'Analyzing...'
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get AI Recommendations
                  </>
                )}
              </button>
            </form>
          </div>

          {recommendations ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Recommended Crops for Your Farm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.recommendations.map((crop: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-800">{crop.name}</h4>
                        <Wheat className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Confidence</span>
                          <span className="text-sm font-medium text-green-600">{crop.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Expected Yield</span>
                          <span className="text-sm font-medium">{crop.expectedYield} tons/acre</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Est. Profit</span>
                          <span className="text-sm font-medium text-green-600">₹{crop.estimatedProfit}</span>
                        </div>
                      </div>
                      {/* AI Reasoning */}
                      <div className="mt-4 bg-green-50 rounded p-3 text-sm text-green-900">
                        <span className="font-semibold">AI Reasoning:</span> {crop.reasoning || `Based on your location (${recommendations.factors.location}), ${crop.name} is suitable for the ${recommendations.factors.season} season and ${recommendations.factors.soilType} soil. Expected yield and profit are estimated using recent weather and market data.`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Analysis Factors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <MapPin className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-sm font-medium">{recommendations.factors.location}</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Season</p>
                    <p className="text-sm font-medium capitalize">{recommendations.factors.season}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-6 h-6 bg-amber-500 rounded mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Soil Type</p>
                    <p className="text-sm font-medium capitalize">{recommendations.factors.soilType}</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Land Size</p>
                    <p className="text-sm font-medium">{recommendations.factors.landSize} acres</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg shadow-md text-center">
              <Wheat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Recommendations Yet</h3>
              <p className="text-gray-500">
                Fill in your farm details and click "Get AI Recommendations" to see personalized crop suggestions.
              </p>
            </div>
          )}
        </div>
        {/* Crop Image Recognition Section */}
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-100">
            <h2 className="text-2xl font-bold text-green-700 mb-1 flex items-center gap-2">
              <ImageIcon className="h-7 w-7" /> Crop Image Recognition (AI)
            </h2>
            <div className="w-16 h-1 bg-green-100 rounded-full mb-4" />
            <p className="text-gray-600 mb-6 text-center">Upload a photo of your crop to get instant AI-powered analysis of crop type, health, and possible issues.</p>
            {/* Drag-and-drop upload area */}
            {!imagePreview && (
              <div
                className="w-full border-2 border-dashed border-green-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 transition mb-4"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleImageChange({ target: { files: [file] } } as any);
                }}
              >
                <ImageIcon className="h-12 w-12 text-green-400 mb-2" />
                <span className="text-green-700 font-medium">Click or drag an image here to upload</span>
                <span className="text-gray-400 text-sm mt-1">JPG, PNG, or JPEG (max 5MB)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}
            {/* Image preview and remove */}
            {imagePreview && (
              <div className="mb-4 flex flex-col items-center w-full">
                <div className="relative">
                  <img src={imagePreview} alt="Crop preview" className="w-48 h-48 object-cover rounded-xl border-2 border-green-200 shadow" />
                  <button
                    onClick={() => { setSelectedImage(null); setImagePreview(null); setAiImageResult(null); }}
                    className="absolute -top-3 -right-3 bg-white border border-gray-200 rounded-full p-1 shadow hover:bg-red-50"
                    aria-label="Remove image"
                  >
                    <XCircle className="h-5 w-5 text-red-400" />
                  </button>
                </div>
                <button
                  onClick={handleImageAnalyze}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-7 py-2 rounded-lg font-semibold transition-colors shadow"
                >
                  Analyze Image
                </button>
              </div>
            )}
            {/* AI result card */}
            {aiImageResult && (
              <div className="w-full mt-4 bg-green-50 rounded-xl p-5 border border-green-200 shadow flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800 text-lg">AI Analysis Result</span>
                </div>
                <div className="flex flex-wrap gap-4 items-center mb-1">
                  <span className="flex items-center gap-1 text-gray-800"><Wheat className="h-4 w-4 text-yellow-700" /> <span className="font-semibold">Crop:</span> {aiImageResult.crop}</span>
                  <span className={`flex items-center gap-1 font-semibold px-2 py-1 rounded text-sm ${aiImageResult.health === 'Healthy' ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}`}><Sparkles className="h-4 w-4" /> {aiImageResult.health}</span>
                </div>
                <div className="text-gray-800 font-semibold">Issues:</div>
                {aiImageResult.issues.length === 0 ? (
                  <div className="text-green-700 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> None detected</div>
                ) : (
                  <ul className="list-disc pl-6 text-yellow-900">
                    {aiImageResult.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-yellow-500" /> {issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;