import React, { useState, useEffect } from 'react';
import { Shield, Hash, Clock, FileText, CheckCircle, Lock } from 'lucide-react';
import axios from 'axios';

const BlockchainLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBlockchainLogs();
  }, []);

  const fetchBlockchainLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/blockchain-logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching blockchain logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Blockchain Data Logs</h1>
        <p className="text-gray-600 mt-2">
          Immutable record of all agricultural data and recommendations
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading blockchain logs...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Blockchain Overview */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Blockchain Network Status</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">Network Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span className="text-sm">Secured</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-5 w-5" />
                    <span className="text-sm">{logs.length} Blocks</span>
                  </div>
                </div>
              </div>
              <Shield className="h-12 w-12 opacity-80" />
            </div>
          </div>

          {/* Blockchain Logs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
            </div>
            
            {logs.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-md font-semibold text-gray-800">
                              Block #{log.id}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Crop recommendation data logged
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-13">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Hash className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Block Hash</span>
                            </div>
                            <p className="text-sm font-mono text-gray-800 bg-gray-100 p-2 rounded">
                              {formatHash(log.hash)}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Hash className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Previous Hash</span>
                            </div>
                            <p className="text-sm font-mono text-gray-800 bg-gray-100 p-2 rounded">
                              {formatHash(log.previousHash)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 ml-13">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Stored Data</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-700">
                              Crop recommendations: {log.data.recommendations.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600 font-medium">Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Blockchain Logs</h3>
                <p className="text-gray-500">
                  No data has been logged to the blockchain yet. Generate crop recommendations to see blockchain activity.
                </p>
              </div>
            )}
          </div>

          {/* Blockchain Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Blockchain Technology Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Data Integrity</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Immutable record of all agricultural recommendations</p>
                  <p>• Cryptographic hashing ensures data authenticity</p>
                  <p>• Tamper-proof storage of farming decisions</p>
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2">Transparency & Trust</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Complete audit trail of AI recommendations</p>
                  <p>• Verifiable history of farming practices</p>
                  <p>• Enhanced accountability in agricultural decisions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainLogs;