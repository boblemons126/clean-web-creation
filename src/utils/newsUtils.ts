
import { NewsItem } from '../types/news';
import { NewsSource } from '../config/newsSources';

export const processTitleForDisplay = (title: string): string => {
  let cleanTitle = title
    .replace(/^(BREAKING:|Breaking:|UPDATE:|Update:|LIVE:|Live:)\s*/g, '')
    .replace(/\s*\|.*$/, '')
    .replace(/\s*-\s*[^-]*$/, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .trim();

  cleanTitle = cleanTitle
    .replace(/^(Cornwall|Devon|UK|South West):\s*/g, '')
    .replace(/^In (Cornwall|Devon|the South West)\s*[:,-]\s*/g, '')
    .trim();

  const fillerPhrases = [
    'here\'s what we know',
    'what you need to know',
    'everything you need to know',
    'latest updates',
    'find out more',
    'read more',
    'see pictures',
    'see photos',
    'in pictures',
    'full story',
    'latest news',
    'due to',
    'following',
    'after',
    'amid',
    'as'
  ];

  fillerPhrases.forEach(phrase => {
    const regex = new RegExp(`\\s*-?\\s*${phrase}\\s+`, 'gi');
    cleanTitle = cleanTitle.replace(regex, ' ');
  });

  cleanTitle = cleanTitle
    .replace(/\s+(?:following|amid|after|due to).*$/i, '')
    .replace(/\s+as\s+.*$/i, '');

  cleanTitle = cleanTitle
    .replace(/police\s+incident/gi, 'incident')
    .replace(/major\s+/gi, '')
    .replace(/breaking\s+/gi, '')
    .replace(/urgent\s+/gi, '')
    .replace(/\s+issues?\s+/gi, ' ')
    .replace(/\s+warning\s+/gi, ' ')
    .replace(/\s+alert\s+/gi, ' ')
    .replace(/\s+update\s+/gi, ' ')
    .trim();

  return cleanTitle.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const parseXMLToArticles = (xmlText: string, sourceName: string, defaultImage: string): NewsItem[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const items = xmlDoc.querySelectorAll('item');
  
  return Array.from(items).map((item) => {
    const getElementText = (elementName: string) => 
      item.querySelector(elementName)?.textContent || '';
    
    let imageUrl = defaultImage;
    const mediaContent = item.getElementsByTagName('media:content')[0];
    const enclosure = item.querySelector('enclosure');
    
    if (mediaContent?.getAttribute('url')) {
      imageUrl = mediaContent.getAttribute('url') || defaultImage;
    } else if (enclosure?.getAttribute('url')) {
      imageUrl = enclosure.getAttribute('url') || defaultImage;
    }
    
    if (imageUrl === defaultImage) {
      const description = getElementText('description');
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
    }
    
    const originalTitle = getElementText('title');
    const processedTitle = processTitleForDisplay(originalTitle);
    
    const description = getElementText('description').replace(/<[^>]*>/g, '');
    const wordCount = description.split(' ').length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    return {
      id: `${sourceName}-${Date.now()}-${Math.random()}`,
      title: processedTitle,
      originalTitle,
      description,
      source: { name: sourceName },
      publishedAt: getElementText('pubDate'),
      url: getElementText('link'),
      urlToImage: imageUrl,
      category: getElementText('category') || 'News',
      isRead: Math.random() > 0.7,
      priority: (['high', 'medium', 'low'] as const)[Math.floor(Math.random() * 3)],
      readTime: `${readTime} min read`
    };
  });
};

export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'Technology': return '🚀';
    case 'Security': return '🔒';
    case 'System': return '⚙️';
    case 'Energy': return '⚡';
    case 'Weather': return '🌤️';
    case 'News': return '📰';
    case 'Politics': return '🏛️';
    case 'Sports': return '⚽';
    case 'Business': return '💼';
    case 'Health': return '🏥';
    default: return '📰';
  }
};

export const getTimeAgo = (publishedAt: string): string => {
  const now = new Date();
  const published = new Date(publishedAt);
  const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const days = Math.floor(diffInHours / 24);
  return `${days}d ago`;
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return 'border-l-red-500 bg-red-500/5';
    case 'medium': return 'border-l-yellow-500 bg-yellow-500/5';
    case 'low': return 'border-l-green-500 bg-green-500/5';
    default: return 'border-l-blue-500 bg-blue-500/5';
  }
};
