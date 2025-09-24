// Intelligent API caching system for Hysio Medical Scribe
// Optimizes performance by caching preparation and processing results

import type { PatientInfo, PreparationResponse, HHSBProcessResponse, SOEPProcessResponse } from '@/types/api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
  lastAccessed: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry: number;
}

class APICache {
  private preparationCache = new Map<string, CacheEntry<PreparationResponse>>();
  private hhsbCache = new Map<string, CacheEntry<HHSBProcessResponse>>();
  private soepCache = new Map<string, CacheEntry<SOEPProcessResponse>>();

  private maxEntries = 100; // Maximum cache entries per type
  private defaultTTL = 30 * 60 * 1000; // 30 minutes default TTL
  private preparationTTL = 60 * 60 * 1000; // 1 hour for preparations (more stable)
  private processingTTL = 15 * 60 * 1000; // 15 minutes for processing (more dynamic)

  // Generate cache keys
  private generatePreparationKey(
    workflowType: string,
    step: string | undefined,
    patientInfo: PatientInfo,
    previousStepData?: any
  ): string {
    const baseKey = `${workflowType}-${step || 'default'}-${patientInfo.chiefComplaint}-${patientInfo.birthYear}-${patientInfo.gender}`;
    const additionalKey = patientInfo.additionalInfo ? `-${patientInfo.additionalInfo.substring(0, 50)}` : '';
    const stepDataKey = previousStepData ? `-${JSON.stringify(previousStepData).substring(0, 100)}` : '';
    return `prep-${baseKey}${additionalKey}${stepDataKey}`.replace(/[^a-zA-Z0-9-]/g, '-');
  }

  private generateProcessingKey(
    type: 'hhsb' | 'soep',
    patientInfo: PatientInfo,
    transcript: string,
    preparation?: string
  ): string {
    const transcriptHash = this.simpleHash(transcript);
    const preparationHash = preparation ? this.simpleHash(preparation) : '';
    const baseKey = `${type}-${patientInfo.chiefComplaint}-${patientInfo.birthYear}-${patientInfo.gender}`;
    return `proc-${baseKey}-${transcriptHash}-${preparationHash}`.replace(/[^a-zA-Z0-9-]/g, '-');
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Cache management
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictOldEntries<T>(cache: Map<string, CacheEntry<T>>, maxEntries: number): void {
    if (cache.size <= maxEntries) return;

    // Convert to array and sort by last accessed time (LRU)
    const entries = Array.from(cache.entries()).sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    // Remove oldest entries
    const toRemove = entries.slice(0, cache.size - maxEntries);
    toRemove.forEach(([key]) => cache.delete(key));
  }

  private cleanupExpired<T>(cache: Map<string, CacheEntry<T>>): void {
    for (const [key, entry] of cache.entries()) {
      if (this.isExpired(entry)) {
        cache.delete(key);
      }
    }
  }

  // Preparation caching
  async cachePreparation(
    workflowType: string,
    step: string | undefined,
    patientInfo: PatientInfo,
    response: PreparationResponse,
    previousStepData?: any
  ): Promise<void> {
    const key = this.generatePreparationKey(workflowType, step, patientInfo, previousStepData);

    this.preparationCache.set(key, {
      data: response,
      timestamp: Date.now(),
      hits: 0,
      lastAccessed: Date.now(),
      ttl: this.preparationTTL
    });

    this.evictOldEntries(this.preparationCache, this.maxEntries);
  }

  async getCachedPreparation(
    workflowType: string,
    step: string | undefined,
    patientInfo: PatientInfo,
    previousStepData?: any
  ): Promise<PreparationResponse | null> {
    const key = this.generatePreparationKey(workflowType, step, patientInfo, previousStepData);
    const entry = this.preparationCache.get(key);

    if (!entry || this.isExpired(entry)) {
      if (entry) this.preparationCache.delete(key);
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  // HHSB processing caching
  async cacheHHSBResult(
    patientInfo: PatientInfo,
    transcript: string,
    response: HHSBProcessResponse,
    preparation?: string
  ): Promise<void> {
    const key = this.generateProcessingKey('hhsb', patientInfo, transcript, preparation);

    this.hhsbCache.set(key, {
      data: response,
      timestamp: Date.now(),
      hits: 0,
      lastAccessed: Date.now(),
      ttl: this.processingTTL
    });

    this.evictOldEntries(this.hhsbCache, this.maxEntries);
  }

  async getCachedHHSBResult(
    patientInfo: PatientInfo,
    transcript: string,
    preparation?: string
  ): Promise<HHSBProcessResponse | null> {
    const key = this.generateProcessingKey('hhsb', patientInfo, transcript, preparation);
    const entry = this.hhsbCache.get(key);

    if (!entry || this.isExpired(entry)) {
      if (entry) this.hhsbCache.delete(key);
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  // SOEP processing caching
  async cacheSOEPResult(
    patientInfo: PatientInfo,
    transcript: string,
    response: SOEPProcessResponse,
    preparation?: string
  ): Promise<void> {
    const key = this.generateProcessingKey('soep', patientInfo, transcript, preparation);

    this.soepCache.set(key, {
      data: response,
      timestamp: Date.now(),
      hits: 0,
      lastAccessed: Date.now(),
      ttl: this.processingTTL
    });

    this.evictOldEntries(this.soepCache, this.maxEntries);
  }

  async getCachedSOEPResult(
    patientInfo: PatientInfo,
    transcript: string,
    preparation?: string
  ): Promise<SOEPProcessResponse | null> {
    const key = this.generateProcessingKey('soep', patientInfo, transcript, preparation);
    const entry = this.soepCache.get(key);

    if (!entry || this.isExpired(entry)) {
      if (entry) this.soepCache.delete(key);
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  // Cache management and statistics
  getCacheStats(): CacheStats {
    this.cleanupExpired(this.preparationCache);
    this.cleanupExpired(this.hhsbCache);
    this.cleanupExpired(this.soepCache);

    const totalEntries = this.preparationCache.size + this.hhsbCache.size + this.soepCache.size;

    let totalHits = 0;
    let totalRequests = 0;
    let oldestTimestamp = Date.now();

    [this.preparationCache, this.hhsbCache, this.soepCache].forEach(cache => {
      cache.forEach(entry => {
        totalHits += entry.hits;
        totalRequests += entry.hits > 0 ? entry.hits : 1;
        oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
      });
    });

    return {
      totalEntries,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: oldestTimestamp
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimate of memory usage in KB
    let totalSize = 0;

    [this.preparationCache, this.hhsbCache, this.soepCache].forEach(cache => {
      cache.forEach(entry => {
        totalSize += JSON.stringify(entry.data).length;
      });
    });

    return Math.round(totalSize / 1024); // Convert to KB
  }

  clearCache(): void {
    this.preparationCache.clear();
    this.hhsbCache.clear();
    this.soepCache.clear();
  }

  clearExpired(): void {
    this.cleanupExpired(this.preparationCache);
    this.cleanupExpired(this.hhsbCache);
    this.cleanupExpired(this.soepCache);
  }
}

// Export singleton instance
export const apiCache = new APICache();

// Cache warming function for common patterns
export async function warmCache(commonPatients: PatientInfo[]) {
  console.log(`Warming cache for ${commonPatients.length} common patient patterns...`);
  // This could be called on application startup with common patient scenarios
}

// Cache performance middleware
export function createCacheMiddleware() {
  return {
    beforeRequest: async (key: string) => {
      // Log cache attempts for monitoring
      console.debug(`Cache lookup: ${key}`);
    },
    afterRequest: async (key: string, hit: boolean, responseTime: number) => {
      // Log cache performance
      console.debug(`Cache ${hit ? 'HIT' : 'MISS'}: ${key} (${responseTime}ms)`);
    }
  };
}