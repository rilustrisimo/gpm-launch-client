import { useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import api from '@/lib/api';

/**
 * This is a debugging component that helps diagnose authentication issues.
 * It should be removed from production.
 */
export const AuthDebug = () => {
  const { user, token, isAuthenticated } = useAuthContext();
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  
  useEffect(() => {
    setApiBaseUrl(api.defaults.baseURL || 'Not set');
  }, []);
  
  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setShowDebug(true)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Debug Auth
        </button>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-0 right-0 bg-white border shadow-lg p-4 m-4 rounded-lg z-50 max-w-md">
      <div className="flex justify-between mb-4">
        <h3 className="font-bold">Auth Debug Info</h3>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold">API Base URL:</span> {apiBaseUrl}
        </div>
        <div>
          <span className="font-semibold">Authenticated:</span> {isAuthenticated ? 'Yes' : 'No'}
        </div>
        <div>
          <span className="font-semibold">Token:</span> 
          <div className="max-h-20 overflow-auto bg-gray-100 p-2 mt-1 rounded text-xs">
            {token ? token.substring(0, 20) + '...' : 'None'}
          </div>
        </div>
        <div>
          <span className="font-semibold">User:</span>
          <pre className="max-h-40 overflow-auto bg-gray-100 p-2 mt-1 rounded text-xs">
            {user ? JSON.stringify(user, null, 2) : 'None'}
          </pre>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
          }}
          className="bg-red-100 hover:bg-red-200 text-red-800 text-xs py-1 px-2 rounded"
        >
          Clear Auth & Reload
        </button>
      </div>
    </div>
  );
}; 