
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface NewsErrorProps {
  error: string;
  onRetry: () => void;
}

const NewsError: React.FC<NewsErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 max-w-md mx-auto">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Unable to Load News</h3>
              <p className="text-white/60 mb-6">{error}</p>
              <button 
                onClick={onRetry}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsError;
