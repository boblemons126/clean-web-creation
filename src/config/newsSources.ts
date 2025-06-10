
export interface NewsSource {
  name: string;
  url: string;
  defaultImage: string;
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    name: 'Sky News',
    url: 'https://feeds.skynews.com/feeds/rss/home.xml',
    defaultImage: 'https://news.sky.com/resources/sky-news-logo.png'
  },
  {
    name: 'Cornwall Live',
    url: 'https://www.cornwalllive.com/news/?service=rss',
    defaultImage: 'https://i2-prod.cornwalllive.com/incoming/article1162068.ece/ALTERNATES/s615/cornwalllive.jpg'
  },
  {
    name: 'Devon Live',
    url: 'https://www.devonlive.com/news/?service=rss',
    defaultImage: 'https://i2-prod.devonlive.com/incoming/article1162065.ece/ALTERNATES/s615/devonlive.jpg'
  }
];
