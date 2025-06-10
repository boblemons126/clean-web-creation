
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { NewsItem } from '../types/news';
import { fetchNewsFromSources } from '../services/newsService';
import NewsHeader from '../components/news/NewsHeader';
import NewsStats from '../components/news/NewsStats';
import NewsFilters from '../components/news/NewsFilters';
import NewsArticle from '../components/news/NewsArticle';
import NewsLoading from '../components/news/NewsLoading';
import NewsError from '../components/news/NewsError';

const NewsPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'notifications'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const articles = await fetchNewsFromSources();
      setNewsItems(articles);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(newsItems.map(item => item.category)))];
  
  const filteredItems = newsItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'news' && ['Technology', 'Weather', 'Energy', 'News'].includes(item.category)) ||
                      (activeTab === 'notifications' && ['System', 'Security'].includes(item.category));
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const unreadCount = newsItems.filter(item => !item.isRead).length;

  if (loading) {
    return <NewsLoading />;
  }

  if (error) {
    return <NewsError error={error} onRetry={fetchNews} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <NewsHeader unreadCount={unreadCount} onRefresh={fetchNews} />
          
          <NewsStats unreadCount={unreadCount} totalArticles={newsItems.length} />

          <NewsFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            onRefresh={fetchNews}
          />

          {/* News Grid */}
          <div className="space-y-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <NewsArticle key={item.id} item={item} index={index} />
              ))
            ) : (
              <div className="text-center py-16">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 max-w-md mx-auto">
                  <div className="text-6xl mb-4">📰</div>
                  <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
                  <p className="text-white/60">Try adjusting your search or filter criteria</p>
                </div>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {filteredItems.length > 0 && filteredItems.length >= 20 && (
            <div className="text-center mt-12">
              <button 
                onClick={fetchNews}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Load More Articles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
