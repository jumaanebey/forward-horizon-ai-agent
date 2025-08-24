/**
 * Internet Access Module
 * Provides web scraping, research, and data gathering capabilities
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const Logger = require('../utils/logger');

class InternetAccess {
  constructor() {
    this.logger = new Logger('WebAccess');
    this.browser = null;
    this.initialized = false;
    
    // Rate limiting
    this.requestCount = 0;
    this.lastReset = Date.now();
    this.maxRequestsPerHour = 100;
    
    // Common headers to avoid detection
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  async initialize() {
    this.logger.info('🌐 Initializing Internet Access (lazy mode)...');
    
    // Don't initialize browser immediately - do it when needed
    this.initialized = true;
    this.logger.info('✅ Internet Access initialized - Browser will launch on first use');
    
    return true;
  }

  async ensureBrowser() {
    if (!this.browser) {
      this.logger.info('🚀 Launching browser on-demand...');
      
      try {
        this.browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        });
        
        this.logger.info('✅ Browser launched successfully');
      } catch (error) {
        this.logger.error('❌ Failed to launch browser:', error);
        throw error;
      }
    }
    return this.browser;
  }

  /**
   * Basic web scraping with Axios and Cheerio
   */
  async scrapeWebsite(url, options = {}) {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    try {
      this.logger.info(`🔍 Scraping: ${url}`);
      
      const response = await axios.get(url, {
        headers: { ...this.headers, ...options.headers },
        timeout: options.timeout || 10000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      
      // Extract common elements
      const data = {
        url,
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || '',
        h1: $('h1').map((i, el) => $(el).text().trim()).get(),
        h2: $('h2').map((i, el) => $(el).text().trim()).get(),
        paragraphs: $('p').map((i, el) => $(el).text().trim()).get().filter(p => p.length > 20),
        links: $('a[href]').map((i, el) => ({
          text: $(el).text().trim(),
          href: $(el).attr('href')
        })).get(),
        images: $('img[src]').map((i, el) => ({
          alt: $(el).attr('alt') || '',
          src: $(el).attr('src')
        })).get(),
        scraped_at: new Date().toISOString()
      };

      // Custom selector if provided
      if (options.selector) {
        data.custom = $(options.selector).map((i, el) => $(el).text().trim()).get();
      }

      this.incrementRequestCount();
      return data;
    } catch (error) {
      this.logger.error(`Failed to scrape ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Advanced scraping with Puppeteer (for dynamic content)
   */
  async scrapeDynamicWebsite(url, options = {}) {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded');
    }

    let page = null;
    try {
      this.logger.info(`🤖 Dynamic scraping: ${url}`);
      
      // Ensure browser is launched before use
      const browser = await this.ensureBrowser();
      page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ width: 1366, height: 768 });
      await page.setUserAgent(this.headers['User-Agent']);
      
      // Navigate to page
      await page.goto(url, {
        waitUntil: options.waitUntil || 'networkidle2',
        timeout: options.timeout || 30000
      });

      // Wait for specific elements if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
      }

      // Execute custom JavaScript if provided
      if (options.script) {
        await page.evaluate(options.script);
      }

      // Extract data
      const data = await page.evaluate((customSelector) => {
        const result = {
          url: window.location.href,
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content || '',
          h1: Array.from(document.querySelectorAll('h1')).map(el => el.textContent.trim()),
          h2: Array.from(document.querySelectorAll('h2')).map(el => el.textContent.trim()),
          paragraphs: Array.from(document.querySelectorAll('p'))
            .map(el => el.textContent.trim())
            .filter(p => p.length > 20),
          links: Array.from(document.querySelectorAll('a[href]')).map(el => ({
            text: el.textContent.trim(),
            href: el.href
          })),
          scraped_at: new Date().toISOString()
        };

        if (customSelector) {
          result.custom = Array.from(document.querySelectorAll(customSelector))
            .map(el => el.textContent.trim());
        }

        return result;
      }, options.selector);

      this.incrementRequestCount();
      return data;
    } catch (error) {
      this.logger.error(`Failed to dynamically scrape ${url}:`, error.message);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Research a topic by searching and scraping multiple sources
   */
  async research(topic, options = {}) {
    try {
      this.logger.info(`📚 Researching: ${topic}`);
      
      const maxSources = options.maxSources || 3;
      const searchQueries = this.generateSearchQueries(topic);
      
      const results = {
        topic,
        queries: searchQueries,
        sources: [],
        summary: '',
        researched_at: new Date().toISOString()
      };

      // Search for relevant URLs (this would need a search API or predefined sources)
      const urls = await this.findRelevantUrls(topic, maxSources);
      
      // Scrape each source
      for (const url of urls) {
        try {
          const data = await this.scrapeWebsite(url, { timeout: 15000 });
          
          // Extract relevant content
          const relevantContent = this.extractRelevantContent(data, topic);
          
          results.sources.push({
            url,
            title: data.title,
            content: relevantContent,
            scraped_at: data.scraped_at
          });
          
          // Add delay to be respectful
          await this.delay(2000);
        } catch (error) {
          this.logger.warn(`Failed to scrape research source ${url}:`, error.message);
        }
      }

      // Generate summary
      results.summary = this.generateResearchSummary(results.sources, topic);
      
      return results;
    } catch (error) {
      this.logger.error(`Research failed for topic "${topic}":`, error);
      throw error;
    }
  }

  /**
   * Monitor a website for changes
   */
  async monitorWebsite(url, options = {}) {
    try {
      const current = await this.scrapeWebsite(url);
      
      // This would compare with previously stored data
      // For now, just return current state
      return {
        url,
        timestamp: new Date().toISOString(),
        content: current,
        changes: [] // Would contain detected changes
      };
    } catch (error) {
      this.logger.error(`Failed to monitor ${url}:`, error);
      throw error;
    }
  }

  /**
   * Check if a website is accessible
   */
  async checkWebsiteStatus(url) {
    try {
      const start = Date.now();
      const response = await axios.head(url, {
        headers: this.headers,
        timeout: 10000
      });
      const responseTime = Date.now() - start;

      return {
        url,
        status: response.status,
        accessible: response.status >= 200 && response.status < 400,
        response_time: responseTime,
        headers: response.headers,
        checked_at: new Date().toISOString()
      };
    } catch (error) {
      return {
        url,
        status: error.response?.status || 0,
        accessible: false,
        error: error.message,
        checked_at: new Date().toISOString()
      };
    }
  }

  // Helper methods
  generateSearchQueries(topic) {
    return [
      topic,
      `"${topic}" latest news`,
      `${topic} trends 2024`,
      `${topic} industry report`
    ];
  }

  async findRelevantUrls(topic, maxResults) {
    // In a real implementation, this would use a search API
    // For now, return some example URLs based on business context
    const businessUrls = [
      'https://www.businesswire.com',
      'https://www.prnewswire.com',
      'https://techcrunch.com',
      'https://www.reuters.com',
      'https://www.bloomberg.com'
    ];
    
    return businessUrls.slice(0, maxResults);
  }

  extractRelevantContent(data, topic) {
    const topicWords = topic.toLowerCase().split(' ');
    const relevant = [];
    
    // Find paragraphs mentioning the topic
    data.paragraphs.forEach(paragraph => {
      const lowerParagraph = paragraph.toLowerCase();
      const relevanceScore = topicWords.reduce((score, word) => {
        return score + (lowerParagraph.includes(word) ? 1 : 0);
      }, 0);
      
      if (relevanceScore > 0) {
        relevant.push({
          text: paragraph,
          relevance: relevanceScore
        });
      }
    });
    
    return relevant
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
      .map(item => item.text);
  }

  generateResearchSummary(sources, topic) {
    if (sources.length === 0) {
      return `No reliable sources found for research on "${topic}".`;
    }
    
    const totalSources = sources.length;
    const totalContent = sources.reduce((acc, source) => acc + source.content.length, 0);
    
    return `Research completed on "${topic}" from ${totalSources} sources with ${totalContent} content items extracted. Key sources include: ${sources.map(s => s.title).join(', ')}.`;
  }

  checkRateLimit() {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;
    
    // Reset counter every hour
    if (now - this.lastReset > hourInMs) {
      this.requestCount = 0;
      this.lastReset = now;
    }
    
    return this.requestCount < this.maxRequestsPerHour;
  }

  incrementRequestCount() {
    this.requestCount++;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    this.initialized = false;
    this.logger.info('🧹 Internet Access cleaned up');
  }
}

module.exports = InternetAccess;