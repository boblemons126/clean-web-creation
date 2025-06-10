
import React from 'react';
import { Bell, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NEWS_SOURCES } from '../../config/newsSources';

interface NewsHeaderProps {
  unreadCount: number;
  onRefresh: () => void;
}

const NewsHeader: React.FC<NewsHeaderProps> = ({ unreadCount, onRefresh }) => {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/utilities" className="group p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all duration-300 border border-white/20">
            <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              News & Updates
            </h1>
            <p className="text-blue-200/80">Latest from {NEWS_SOURCES.map(s => s.name).join(', ')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={onRefresh}
            className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default NewsHeader;
