import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Wheat, 
  CloudRain, 
  TrendingUp, 
  Satellite, 
  LogOut,
  Sprout,
  MessageCircle
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Wheat, label: 'Crop Recommendation', path: '/crop-recommendation' },
    { icon: CloudRain, label: 'Weather', path: '/weather' },
    { icon: TrendingUp, label: 'Market Insights', path: '/market-insights' },
    { icon: Satellite, label: 'Sensor Data', path: '/sensor-data' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatInput, setChatInput] = React.useState('');
  const [chatMessages, setChatMessages] = React.useState<Array<{role: 'user'|'ai', text: string}>>([
    { role: 'ai', text: 'Hi! I am your AgriAdvisor AI Assistant. How can I help you today?' }
  ]);

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(msgs => [
      ...msgs,
      { role: 'user', text: chatInput },
      // Mock AI response
      { role: 'ai', text: 'AI: This is a demo response. I can answer questions about crops, weather, prices, and more!' }
    ]);
    setChatInput('');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">AgriAdvisor</h1>
              <p className="text-sm text-gray-600">Smart Farming Solutions</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                  isActive 
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{user.name[0]}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-600 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
        {/* Floating Chatbot Button */}
        <button
          className="fixed bottom-8 right-8 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={() => setChatOpen(true)}
          aria-label="Open AI Assistant Chat"
          style={{ display: chatOpen ? 'none' : 'block' }}
        >
          <MessageCircle className="h-7 w-7" />
        </button>
        {/* Chat Window */}
        {chatOpen && (
          <div className="fixed bottom-8 right-8 z-50 w-80 bg-white rounded-xl shadow-2xl flex flex-col border border-green-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-green-100 bg-green-600 rounded-t-xl">
              <span className="text-white font-semibold">AgriAdvisor AI Assistant</span>
              <button onClick={() => setChatOpen(false)} className="text-white hover:text-green-200 text-xl font-bold">×</button>
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-72">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-800'}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSend} className="flex items-center border-t border-green-100 p-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm"
                placeholder="Ask me anything..."
              />
              <button type="submit" className="ml-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;