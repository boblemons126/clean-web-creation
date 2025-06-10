
export interface NewsItem {
  id: string;
  title: string;
  originalTitle: string;
  description: string;
  source: {
    name: string;
  };
  publishedAt: string;
  url: string;
  urlToImage?: string;
  category: string;
  isRead?: boolean;
  priority?: 'high' | 'medium' | 'low';
  readTime?: string;
}
