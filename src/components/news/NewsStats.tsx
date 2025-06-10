
import React from 'react';
import { TrendingUp, Bookmark, Eye } from 'lucide-react';
import { NEWS_SOURCES } from '../../config/newsSources';

interface NewsStatsProps {
  unreadCount: number;
  totalArticles: number;
}

const NewsStats: React.FC<NewsStatsProps> = ({ unreadCount, totalArticles }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm">Unread Articles</p>
            <p className="text-2xl font-bold text-white">{unreadCount}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-400" />
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm">Total Articles</p>
            <p className="text-2xl font-bold text-white">{totalArticles}</p>
          </div>
          <Bookmark className="w-8 h-8 text-purple-400" />
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm">News Sources</p>
            <p className="text-2xl font-bold text-white">{NEWS_SOURCES.length}</p>
          </div>
          <Eye className="w-8 h-8 text-green-400" />
        </div>
      </div>
    </div>
  );
};

export default NewsStats;
