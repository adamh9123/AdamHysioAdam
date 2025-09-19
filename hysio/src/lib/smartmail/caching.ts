// SmartMail caching strategy for templates and healthcare communication patterns
// Implements intelligent caching to improve performance and reduce AI generation costs

import type {
  EmailTemplate,
  RecipientCategory,
  CommunicationObjective,
  SupportedLanguage,
  FormalityLevel,
  EmailGenerationRequest
} from '@/lib/types/smartmail';

// Cache entry interface
export interface CacheEntry<T> {
  key: string;
  data: T;
  createdAt: number;
  lastAccessedAt: number;
  accessCount: number;
  ttl: number; // Time to live in milliseconds
  tags: string[];
}

// Cache configuration
export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enablePersistence: boolean;
}

// Template cache key structure
export interface TemplateCacheKey {
  recipientCategory: RecipientCategory;
  objective: CommunicationObjective;
  language: SupportedLanguage;
  formality: FormalityLevel;
  contextHash?: string;
}

// Healthcare pattern cache entry
export interface HealthcarePattern {
  pattern: string;
  frequency: number;
  successRate: number;
  avgRating: number;
  contexts: string[];
}

/**
 * Smart caching system for SmartMail templates and patterns
 */
export class SmartMailCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private hitRate: number = 0;
  private totalRequests: number = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 24 * 60 * 60 * 1000, // 24 hours
      cleanupInterval: config.cleanupInterval || 60 * 60 * 1000, // 1 hour
      enablePersistence: config.enablePersistence || false
    };

    this.startCleanupTimer();
    
    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }
  }

  /**
   * Generate cache key for email templates
   */
  generateTemplateKey(keyData: TemplateCacheKey): string {
    const baseKey = `template:${keyData.recipientCategory}:${keyData.objective}:${keyData.language}:${keyData.formality}`;
    return keyData.contextHash ? `${baseKey}:${keyData.contextHash}` : baseKey;
  }

  /**
   * Generate cache key for healthcare patterns
   */
  generatePatternKey(pattern: string, context: string): string {
    return `pattern:${this.hashString(pattern)}:${this.hashString(context)}`;
  }

  /**
   * Store email template in cache
   */
  cacheTemplate(
    keyData: TemplateCacheKey,
    template: EmailTemplate,
    customTTL?: number
  ): void {
    const key = this.generateTemplateKey(keyData);
    const ttl = customTTL || this.config.defaultTTL;
    
    const entry: CacheEntry<EmailTemplate> = {
      key,
      data: template,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 0,
      ttl,
      tags: ['template', keyData.recipientCategory, keyData.objective, keyData.language]
    };

    this.set(key, entry);
  }

  /**
   * Retrieve email template from cache
   */
  getTemplate(keyData: TemplateCacheKey): EmailTemplate | null {
    const key = this.generateTemplateKey(keyData);
    const entry = this.get<EmailTemplate>(key);
    return entry?.data || null;
  }

  /**
   * Cache healthcare communication pattern
   */
  cachePattern(
    pattern: string,
    context: string,
    frequency: number = 1,
    successRate: number = 1.0
  ): void {
    const key = this.generatePatternKey(pattern, context);
    
    const existingPattern = this.get<HealthcarePattern>(key);
    const patternData: HealthcarePattern = existingPattern ? {
      ...existingPattern.data,
      frequency: existingPattern.data.frequency + frequency,
      successRate: (existingPattern.data.successRate + successRate) / 2,
      contexts: [...new Set([...existingPattern.data.contexts, context])]
    } : {
      pattern,
      frequency,
      successRate,
      avgRating: 0,
      contexts: [context]
    };

    const entry: CacheEntry<HealthcarePattern> = {
      key,
      data: patternData,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: existingPattern ? existingPattern.accessCount + 1 : 1,
      ttl: this.config.defaultTTL * 7, // Patterns have longer TTL
      tags: ['pattern', 'healthcare']
    };

    this.set(key, entry);
  }

  /**
   * Get frequently used patterns for a context
   */
  getFrequentPatterns(context: string, limit: number = 5): HealthcarePattern[] {
    const patterns: HealthcarePattern[] = [];
    
    for (const [key, entry] of this.cache) {
      if (entry.tags.includes('pattern') && entry.data.contexts?.includes(context)) {
        patterns.push(entry.data);
      }
    }

    return patterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  /**
   * Check if similar template exists based on fuzzy matching
   */
  findSimilarTemplate(
    keyData: TemplateCacheKey,
    similarityThreshold: number = 0.8
  ): EmailTemplate | null {
    const templates: Array<{ template: EmailTemplate; similarity: number }> = [];
    
    for (const [key, entry] of this.cache) {
      if (entry.tags.includes('template')) {
        const similarity = this.calculateSimilarity(keyData, key);
        if (similarity >= similarityThreshold) {
          templates.push({ template: entry.data, similarity });
        }
      }
    }

    if (templates.length === 0) return null;

    // Return most similar template
    templates.sort((a, b) => b.similarity - a.similarity);
    return templates[0].template;
  }

  /**
   * Intelligent cache warming based on usage patterns
   */
  warmCache(commonRequests: EmailGenerationRequest[]): void {
    commonRequests.forEach(request => {
      const keyData: TemplateCacheKey = {
        recipientCategory: request.recipient.category,
        objective: request.context.objective,
        language: request.recipient.language,
        formality: request.recipient.formality,
        contextHash: this.generateContextHash(request.context)
      };

      // Check if similar template already exists
      const existing = this.getTemplate(keyData);
      if (!existing) {
        // Mark as commonly requested pattern for future generation
        this.cachePattern(
          `${keyData.recipientCategory}-${keyData.objective}`,
          keyData.language,
          1
        );
      }
    });
  }

  /**
   * Generic get method with hit/miss tracking
   */
  private get<T>(key: string): CacheEntry<T> | null {
    this.totalRequests++;
    
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.createdAt > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.lastAccessedAt = Date.now();
    entry.accessCount++;
    
    // Update hit rate
    this.hitRate = ((this.hitRate * (this.totalRequests - 1)) + 1) / this.totalRequests;
    
    return entry;
  }

  /**
   * Generic set method with size management
   */
  private set<T>(key: string, entry: CacheEntry<T>): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    let oldestTime = Date.now();
    let oldestKey = '';

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessedAt < oldestTime) {
        oldestTime = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Calculate similarity between cache key patterns
   */
  private calculateSimilarity(keyData: TemplateCacheKey, cacheKey: string): number {
    const keyParts = cacheKey.split(':');
    if (keyParts[0] !== 'template') return 0;

    let score = 0;
    let totalCriteria = 4;

    // Exact matches get higher scores
    if (keyParts[1] === keyData.recipientCategory) score += 0.3;
    if (keyParts[2] === keyData.objective) score += 0.3;
    if (keyParts[3] === keyData.language) score += 0.25;
    if (keyParts[4] === keyData.formality) score += 0.15;

    return score;
  }

  /**
   * Generate context hash for template variations
   */
  private generateContextHash(context: any): string {
    const relevantFields = {
      urgency: context.urgency,
      patientAge: context.patientAge ? Math.floor(context.patientAge / 10) * 10 : null, // Age groups
      hasDocuments: context.documents && context.documents.length > 0,
      followUpRequired: context.followUpRequired
    };
    
    return this.hashString(JSON.stringify(relevantFields));
  }

  /**
   * Simple string hashing function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now - entry.createdAt > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalRequests: number;
    memoryUsage: number;
  } {
    const memoryUsage = JSON.stringify([...this.cache.entries()]).length;
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.hitRate,
      totalRequests: this.totalRequests,
      memoryUsage
    };
  }

  /**
   * Clear cache by tags
   */
  clearByTags(tags: string[]): number {
    let cleared = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      cleared++;
    });

    return cleared;
  }

  /**
   * Export cache for persistence
   */
  exportCache(): string {
    const cacheData = [...this.cache.entries()];
    return JSON.stringify({
      cache: cacheData,
      stats: this.getCacheStats(),
      exportedAt: Date.now()
    });
  }

  /**
   * Import cache from persistence
   */
  importCache(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (imported.cache && Array.isArray(imported.cache)) {
        this.cache.clear();
        imported.cache.forEach(([key, entry]: [string, CacheEntry<any>]) => {
          this.cache.set(key, entry);
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to import cache:', error);
    }
    return false;
  }

  /**
   * Save cache to localStorage (if available)
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('smartmail-cache', this.exportCache());
      } catch (error) {
        console.warn('Failed to save cache to localStorage:', error);
      }
    }
  }

  /**
   * Load cache from localStorage (if available)
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cached = localStorage.getItem('smartmail-cache');
        if (cached) {
          this.importCache(cached);
        }
      } catch (error) {
        console.warn('Failed to load cache from localStorage:', error);
      }
    }
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
    
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }
}

// Global cache instance
let globalCache: SmartMailCache | null = null;

/**
 * Get global SmartMail cache instance
 */
export function getSmartMailCache(config?: Partial<CacheConfig>): SmartMailCache {
  if (!globalCache) {
    globalCache = new SmartMailCache(config);
  }
  return globalCache;
}

/**
 * Template caching utilities
 */
export const TemplateCache = {
  /**
   * Cache a successful email generation
   */
  cacheSuccessfulGeneration(
    request: EmailGenerationRequest,
    template: EmailTemplate,
    userRating?: number
  ): void {
    const cache = getSmartMailCache();
    const keyData: TemplateCacheKey = {
      recipientCategory: request.recipient.category,
      objective: request.context.objective,
      language: request.recipient.language,
      formality: request.recipient.formality,
      contextHash: cache['generateContextHash'](request.context)
    };

    // Cache the template
    cache.cacheTemplate(keyData, template);

    // Cache the successful pattern
    const pattern = `${keyData.recipientCategory}-${keyData.objective}-${keyData.formality}`;
    cache.cachePattern(pattern, keyData.language, 1, userRating || 1.0);
  },

  /**
   * Try to get cached template for request
   */
  getCachedTemplate(request: EmailGenerationRequest): EmailTemplate | null {
    const cache = getSmartMailCache();
    const keyData: TemplateCacheKey = {
      recipientCategory: request.recipient.category,
      objective: request.context.objective,
      language: request.recipient.language,
      formality: request.recipient.formality,
      contextHash: cache['generateContextHash'](request.context)
    };

    // Try exact match first
    let template = cache.getTemplate(keyData);
    
    // Try similar template if no exact match
    if (!template) {
      template = cache.findSimilarTemplate(keyData, 0.85);
    }

    return template;
  },

  /**
   * Warm cache with common request patterns
   */
  warmCommonPatterns(): void {
    const cache = getSmartMailCache();
    
    // Common patterns for warming
    const commonPatterns: EmailGenerationRequest[] = [
      {
        recipient: { category: 'patient', formality: 'empathetic', language: 'nl' },
        context: { objective: 'patient_education', subject: 'Behandelinformatie', background: 'Na ons gesprek' },
        userId: 'cache-warm',
        timestamp: new Date().toISOString(),
        requestId: 'cache-warm-1'
      },
      {
        recipient: { category: 'specialist', formality: 'formal', language: 'nl' },
        context: { objective: 'referral', subject: 'Patiënt verwijzing', background: 'Verwijzing voor verdere diagnostiek' },
        userId: 'cache-warm',
        timestamp: new Date().toISOString(),
        requestId: 'cache-warm-2'
      },
      {
        recipient: { category: 'colleague', formality: 'professional', language: 'nl' },
        context: { objective: 'follow_up', subject: 'Behandeling update', background: 'Update over patiënt behandeling' },
        userId: 'cache-warm',
        timestamp: new Date().toISOString(),
        requestId: 'cache-warm-3'
      }
    ];

    cache.warmCache(commonPatterns);
  }
};

// Auto-initialize cache warming
if (typeof window !== 'undefined') {
  // Warm cache after a short delay in browser environment
  setTimeout(() => {
    TemplateCache.warmCommonPatterns();
  }, 5000);
}