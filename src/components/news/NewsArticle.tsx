
import React from 'react';
import { Clock, Share2, Bookmark } from 'lucide-react';
import { NewsItem } from '../../types/news';
import { getCategoryIcon, getTimeAgo, getPriorityColor } from '../../utils/newsUtils';

interface NewsArticleProps {
  item: NewsItem;
  index: number;
}

const NewsArticle: React.FC<NewsArticleProps> = ({ item, index }) => {
  return (
    <article
      className={`group relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${getPriorityColor(item.priority || 'low')} border-l-4 cursor-pointer`}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => window.open(item.url, '_blank')}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Image Section */}
        {item.urlToImage && (
          <div className="lg:w-80 h-48 lg:h-auto relative overflow-hidden">
            <img 
              src={item.urlToImage} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/30">
                {getCategoryIcon(item.category)} {item.category}
              </span>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {!item.urlToImage && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/30">
                    {getCategoryIcon(item.category)} {item.category}
                  </span>
                )}
                <div className="flex items-center text-white/60 text-sm gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{getTimeAgo(item.publishedAt)}</span>
                  </div>
                  {item.readTime && (
                    <span className="text-blue-300">{item.readTime}</span>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                {item.title}
              </h3>
              
              <p className="text-white/80 leading-relaxed mb-4 line-clamp-3">
                {item.description}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 ml-4">
              {!item.isRead && (
                <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium animate-pulse">
                  New
                </span>
              )}
              <button 
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.share?.({
                    title: item.title,
                    url: item.url
                  });
                }}
              >
                <Share2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>Source: {item.source.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Bookmark className="w-4 h-4 text-white/60 hover:text-white" />
              </button>
              {item.priority === 'high' && (
                <span className="text-red-400 text-sm font-medium">High Priority</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsArticle;
