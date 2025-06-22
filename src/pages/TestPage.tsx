import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            PromptShare Test Page
          </h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
                ✅ Application is Working!
              </h2>
              <p className="text-green-700 dark:text-green-300">
                If you can see this page, the React application is running correctly.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">
                🔧 Debug Information
              </h2>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Environment: {import.meta.env.MODE}</li>
                <li>• Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing'}</li>
                <li>• Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</li>
                <li>• Timestamp: {new Date().toISOString()}</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                🚀 Quick Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Go to Login Page
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Clear Storage & Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
