
import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { getCategoryIcon } from '../../utils/newsUtils';

interface NewsFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'all' | 'news' | 'notifications';
  setActiveTab: (tab: 'all' | 'news' | 'notifications') => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  onRefresh: () => void;
}

const NewsFilters: React.FC<NewsFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  categories,
  onRefresh
}) => {
  return (
    <div className="mb-8 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
        <input
          type="text"
          placeholder="Search articles, updates, and notifications..."
          className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          {[
            { key: 'all', label: 'All', icon: '📰' },
            { key: 'news', label: 'News', icon: '🚀' },
            { key: 'notifications', label: 'Alerts', icon: '🔔' }
          ].map((tab) => (
            <button
              key={tab.key}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.key 
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 border border-white/20">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button 
            onClick={onRefresh}
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 border border-white/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
              selectedCategory === category
                ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white'
            }`}
          >
            {category !== 'All' && (
              <span className="mr-2">{getCategoryIcon(category)}</span>
            )}
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewsFilters;
