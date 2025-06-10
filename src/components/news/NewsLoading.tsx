
import React from 'react';

const NewsLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 max-w-md mx-auto">
              <div className="animate-pulse">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-xl font-bold text-white mb-2">Loading News</h3>
                <p className="text-white/60">Fetching latest articles from configured sources...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsLoading;
