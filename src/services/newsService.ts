
import { NewsItem } from '../types/news';
import { NewsSource, NEWS_SOURCES } from '../config/newsSources';
import { parseXMLToArticles } from '../utils/newsUtils';

export const fetchNewsFromSources = async (): Promise<NewsItem[]> => {
  const allArticles = await Promise.all(
    NEWS_SOURCES.map(async (source: NewsSource) => {
      try {
        const response = await fetch(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(source.url)}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${source.name} news`);
        }
        
        const xmlText = await response.text();
        return parseXMLToArticles(xmlText, source.name, source.defaultImage);
      } catch (err) {
        console.error(`Error fetching ${source.name} news:`, err);
        return [];
      }
    })
  );
  
  const combinedArticles = allArticles
    .flat()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  if (combinedArticles.length === 0) {
    throw new Error('No news articles available from configured sources');
  }
  
  return combinedArticles;
};
