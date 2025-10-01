'use client';

import * as React from 'react';
import { useScribeStore } from '@/lib/state/scribe-store';
import type { WorkflowType, PatientInfo } from '@/types/api';

export interface PersistenceConfig {
  autoSaveInterval: number; // milliseconds
  immediateFields: string[]; // fields that trigger immediate save
  maxRetries: number;
  retryDelay: number; // milliseconds
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  crossTabSync: boolean;
}

export interface PersistenceMetadata {
  version: string;
  timestamp: string;
  checksum: string;
  sessionId: string;
  clientId: string;
  dataSize: number;
  compressed: boolean;
  encrypted: boolean;
}

export interface PersistenceSnapshot {
  metadata: PersistenceMetadata;
  workflowData: any;
  patientInfo: PatientInfo | null;
  currentWorkflow: WorkflowType | null;
  sessionData: Record<string, unknown> | null;
}

const DEFAULT_CONFIG: PersistenceConfig = {
  autoSaveInterval: 15000, // 15 seconds
  immediateFields: ['result', 'completed', 'transcript', 'recording'],
  maxRetries: 3,
  retryDelay: 2000,
  compressionEnabled: true,
  encryptionEnabled: false, // Disabled for now - would need proper key management
  crossTabSync: true
};

export class AutoPersistence {
  private static instance: AutoPersistence | null = null;
  private config: PersistenceConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private lastSnapshot: PersistenceSnapshot | null = null;
  private sessionId: string;
  private clientId: string;
  private saveQueue: Array<{ data: PersistenceSnapshot; timestamp: number }> = [];
  private isSaving = false;

  private constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.clientId = this.generateClientId();
  }

  static getInstance(config?: Partial<PersistenceConfig>): AutoPersistence {
    if (!AutoPersistence.instance) {
      AutoPersistence.instance = new AutoPersistence(config);
    }
    return AutoPersistence.instance;
  }

  /**
   * Initialize auto-persistence system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing auto-persistence system...', {
      sessionId: this.sessionId,
      clientId: this.clientId,
      config: this.config
    });

    try {
      // Load existing data if available
      await this.loadPersistedData();

      // Set up cross-tab synchronization
      if (this.config.crossTabSync) {
        this.setupCrossTabSync();
      }

      // Start auto-save interval
      this.startAutoSave();

      // Listen for immediate save triggers
      this.setupImmediateSaveTriggers();

      // Handle page unload
      this.setupUnloadHandlers();

      this.isInitialized = true;
      console.log('Auto-persistence system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize auto-persistence:', error);
      throw error;
    }
  }

  /**
   * Stop auto-persistence system
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Process remaining saves in queue
    if (this.saveQueue.length > 0) {
      this.processQueuedSaves();
    }

    this.isInitialized = false;
    console.log('Auto-persistence system stopped');
  }

  /**
   * Force immediate save of current state
   */
  async saveImmediately(): Promise<boolean> {
    try {
      const snapshot = this.createSnapshot();
      return await this.persistSnapshot(snapshot, true);
    } catch (error) {
      console.error('Failed to save immediately:', error);
      return false;
    }
  }

  /**
   * Get persistence status and statistics
   */
  getStatus(): {
    isInitialized: boolean;
    lastSaveTime: string | null;
    queueLength: number;
    sessionId: string;
    clientId: string;
    dataSize: number;
  } {
    return {
      isInitialized: this.isInitialized,
      lastSaveTime: this.lastSnapshot?.metadata.timestamp || null,
      queueLength: this.saveQueue.length,
      sessionId: this.sessionId,
      clientId: this.clientId,
      dataSize: this.lastSnapshot?.metadata.dataSize || 0
    };
  }

  // Private methods

  private startAutoSave(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        await this.performAutoSave();
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, this.config.autoSaveInterval);
  }

  private async performAutoSave(): Promise<void> {
    if (this.isSaving || !this.hasDataChanged()) return;

    const snapshot = this.createSnapshot();
    this.queueSave(snapshot);
    await this.processQueuedSaves();
  }

  private createSnapshot(): PersistenceSnapshot {
    const store = useScribeStore.getState();
    const data = JSON.stringify({
      workflowData: store.workflowData,
      patientInfo: store.patientInfo,
      currentWorkflow: store.currentWorkflow,
      sessionData: store.sessionData
    });

    const metadata: PersistenceMetadata = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      checksum: this.calculateChecksum(data),
      sessionId: this.sessionId,
      clientId: this.clientId,
      dataSize: data.length,
      compressed: this.config.compressionEnabled,
      encrypted: this.config.encryptionEnabled
    };

    return {
      metadata,
      workflowData: store.workflowData,
      patientInfo: store.patientInfo,
      currentWorkflow: store.currentWorkflow,
      sessionData: store.sessionData
    };
  }

  private async persistSnapshot(snapshot: PersistenceSnapshot, immediate: boolean = false): Promise<boolean> {
    const maxRetries = immediate ? this.config.maxRetries * 2 : this.config.maxRetries;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Prepare data for storage
        let dataToStore = snapshot;

        // Apply compression if enabled
        if (this.config.compressionEnabled) {
          dataToStore = await this.compressSnapshot(dataToStore);
        }

        // Apply encryption if enabled
        if (this.config.encryptionEnabled) {
          dataToStore = await this.encryptSnapshot(dataToStore);
        }

        // Store in localStorage with multiple keys for reliability
        const storageKey = `hysio-autopersist-${this.sessionId}`;
        const backupKey = `hysio-autopersist-backup-${this.clientId}`;

        localStorage.setItem(storageKey, JSON.stringify(dataToStore));
        localStorage.setItem(backupKey, JSON.stringify(dataToStore));
        localStorage.setItem('hysio-autopersist-latest', storageKey);

        // Update last snapshot
        this.lastSnapshot = snapshot;

        // Broadcast to other tabs if cross-tab sync is enabled
        if (this.config.crossTabSync) {
          this.broadcastUpdate(snapshot);
        }

        console.log('Data persisted successfully', {
          timestamp: snapshot.metadata.timestamp,
          dataSize: snapshot.metadata.dataSize,
          compressed: snapshot.metadata.compressed,
          attempt: attempt + 1
        });

        return true;
      } catch (error) {
        attempt++;
        console.warn(`Persistence attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        }
      }
    }

    console.error('Failed to persist data after maximum retries');
    return false;
  }

  private async loadPersistedData(): Promise<void> {
    try {
      // Try to load latest data
      const latestKey = localStorage.getItem('hysio-autopersist-latest');
      let dataString: string | null = null;

      if (latestKey) {
        dataString = localStorage.getItem(latestKey);
      }

      // Fallback to backup
      if (!dataString) {
        const backupKey = `hysio-autopersist-backup-${this.clientId}`;
        dataString = localStorage.getItem(backupKey);
      }

      // Fallback to any auto-persist key
      if (!dataString) {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('hysio-autopersist-'));
        for (const key of keys) {
          const stored = localStorage.getItem(key);
          if (stored) {
            dataString = stored;
            break;
          }
        }
      }

      if (!dataString) {
        console.log('No persisted data found');
        return;
      }

      let snapshot: PersistenceSnapshot = JSON.parse(dataString);

      // Verify data integrity
      if (!this.verifySnapshot(snapshot)) {
        console.warn('Persisted data failed integrity check');
        return;
      }

      // Apply decryption if needed
      if (snapshot.metadata.encrypted) {
        snapshot = await this.decryptSnapshot(snapshot);
      }

      // Apply decompression if needed
      if (snapshot.metadata.compressed) {
        snapshot = await this.decompressSnapshot(snapshot);
      }

      // Restore state to Zustand store
      const store = useScribeStore.getState();

      if (snapshot.patientInfo) {
        store.setPatientInfo(snapshot.patientInfo);
      }

      if (snapshot.currentWorkflow) {
        store.setCurrentWorkflow(snapshot.currentWorkflow);
      }

      if (snapshot.sessionData) {
        store.setSessionData(snapshot.sessionData);
      }

      // Restore workflow data
      if (snapshot.workflowData) {
        const { workflowData } = snapshot;

        if (workflowData.anamneseData) {
          store.setAnamneseData(workflowData.anamneseData);
        }

        if (workflowData.onderzoekData) {
          store.setOnderzoekData(workflowData.onderzoekData);
        }

        if (workflowData.klinischeConclusieData) {
          store.setKlinischeConclusieData(workflowData.klinischeConclusieData);
        }

        if (workflowData.automatedIntakeData) {
          store.setAutomatedIntakeData(workflowData.automatedIntakeData);
        }

        if (workflowData.consultData) {
          store.setConsultData(workflowData.consultData);
        }

        // Restore completed steps
        if (workflowData.completedSteps) {
          workflowData.completedSteps.forEach((step: string) => {
            store.markStepComplete(step);
          });
        }
      }

      this.lastSnapshot = snapshot;
      console.log('Persisted data loaded successfully', {
        timestamp: snapshot.metadata.timestamp,
        dataSize: snapshot.metadata.dataSize
      });
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  }

  private setupImmediateSaveTriggers(): void {
    // Subscribe to Zustand store changes
    const store = useScribeStore;

    // Create a throttled immediate save function
    let immediateTimeout: NodeJS.Timeout | null = null;
    const throttledImmediateSave = () => {
      if (immediateTimeout) clearTimeout(immediateTimeout);
      immediateTimeout = setTimeout(() => {
        this.saveImmediately();
      }, 100); // 100ms debounce
    };

    // Monitor store changes (this is a simplified version - in practice you'd use store.subscribe)
    store.subscribe((state) => {
      // Check if immediate fields changed
      const hasImmediateChange = this.config.immediateFields.some(field => {
        return this.hasFieldChanged(field, state);
      });

      if (hasImmediateChange) {
        throttledImmediateSave();
      }
    });
  }

  private setupCrossTabSync(): void {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith('hysio-autopersist-') && event.newValue) {
        try {
          const snapshot: PersistenceSnapshot = JSON.parse(event.newValue);

          // Only sync if from different client
          if (snapshot.metadata.clientId !== this.clientId) {
            console.log('Syncing data from another tab');
            this.syncFromSnapshot(snapshot);
          }
        } catch (error) {
          console.error('Failed to sync from another tab:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
  }

  private setupUnloadHandlers(): void {
    const handleUnload = () => {
      // Force synchronous save on unload
      try {
        const snapshot = this.createSnapshot();
        const dataString = JSON.stringify(snapshot);
        localStorage.setItem(`hysio-autopersist-unload-${this.sessionId}`, dataString);
      } catch (error) {
        console.error('Failed to save on unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
  }

  private queueSave(snapshot: PersistenceSnapshot): void {
    this.saveQueue.push({
      data: snapshot,
      timestamp: Date.now()
    });

    // Limit queue size
    if (this.saveQueue.length > 10) {
      this.saveQueue = this.saveQueue.slice(-5); // Keep only last 5
    }
  }

  private async processQueuedSaves(): Promise<void> {
    if (this.isSaving || this.saveQueue.length === 0) return;

    this.isSaving = true;

    try {
      // Process most recent save
      const { data } = this.saveQueue[this.saveQueue.length - 1];
      await this.persistSnapshot(data);
      this.saveQueue = []; // Clear queue after successful save
    } catch (error) {
      console.error('Failed to process queued saves:', error);
    } finally {
      this.isSaving = false;
    }
  }

  private hasDataChanged(): boolean {
    if (!this.lastSnapshot) return true;

    const currentSnapshot = this.createSnapshot();
    return currentSnapshot.metadata.checksum !== this.lastSnapshot.metadata.checksum;
  }

  private hasFieldChanged(field: string, state: any): boolean {
    // Simplified field change detection
    return true; // In practice, you'd compare specific fields
  }

  private calculateChecksum(data: string): string {
    // Simple checksum calculation (in production, use a proper hash function)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  private verifySnapshot(snapshot: PersistenceSnapshot): boolean {
    try {
      const data = JSON.stringify({
        workflowData: snapshot.workflowData,
        patientInfo: snapshot.patientInfo,
        currentWorkflow: snapshot.currentWorkflow,
        sessionData: snapshot.sessionData
      });

      const expectedChecksum = this.calculateChecksum(data);
      return expectedChecksum === snapshot.metadata.checksum;
    } catch {
      return false;
    }
  }

  private async compressSnapshot(snapshot: PersistenceSnapshot): Promise<PersistenceSnapshot> {
    // Simplified compression (in production, use proper compression library)
    return snapshot;
  }

  private async decompressSnapshot(snapshot: PersistenceSnapshot): Promise<PersistenceSnapshot> {
    // Simplified decompression
    return snapshot;
  }

  private async encryptSnapshot(snapshot: PersistenceSnapshot): Promise<PersistenceSnapshot> {
    // Placeholder for encryption (requires proper key management)
    return snapshot;
  }

  private async decryptSnapshot(snapshot: PersistenceSnapshot): Promise<PersistenceSnapshot> {
    // Placeholder for decryption
    return snapshot;
  }

  private broadcastUpdate(snapshot: PersistenceSnapshot): void {
    // Broadcast to other tabs via localStorage event
    localStorage.setItem(
      `hysio-autopersist-broadcast-${Date.now()}`,
      JSON.stringify({
        type: 'update',
        clientId: this.clientId,
        timestamp: snapshot.metadata.timestamp
      })
    );
  }

  private syncFromSnapshot(snapshot: PersistenceSnapshot): void {
    // Sync specific fields from another tab's snapshot
    const store = useScribeStore.getState();

    // Only sync if the snapshot is newer
    if (this.lastSnapshot && snapshot.metadata.timestamp <= this.lastSnapshot.metadata.timestamp) {
      return;
    }

    // Sync patient info if newer
    if (snapshot.patientInfo && (!store.patientInfo || snapshot.metadata.timestamp > (store.patientInfo as any)?.updatedAt)) {
      store.setPatientInfo(snapshot.patientInfo);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateClientId(): string {
    const stored = localStorage.getItem('hysio-client-id');
    if (stored) return stored;

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('hysio-client-id', clientId);
    return clientId;
  }
}

// React hook for using auto-persistence
export function useAutoPersistence(config?: Partial<PersistenceConfig>) {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [status, setStatus] = React.useState<ReturnType<AutoPersistence['getStatus']> | null>(null);

  React.useEffect(() => {
    const persistence = AutoPersistence.getInstance(config);

    persistence.initialize().then(() => {
      setIsInitialized(true);
      setStatus(persistence.getStatus());
    });

    // Update status periodically
    const statusInterval = setInterval(() => {
      setStatus(persistence.getStatus());
    }, 5000);

    return () => {
      clearInterval(statusInterval);
      persistence.stop();
    };
  }, []);

  const saveImmediately = React.useCallback(async () => {
    const persistence = AutoPersistence.getInstance();
    return await persistence.saveImmediately();
  }, []);

  const getStatus = React.useCallback(() => {
    const persistence = AutoPersistence.getInstance();
    return persistence.getStatus();
  }, []);

  return {
    isInitialized,
    status,
    saveImmediately,
    getStatus
  };
}

// Export for use in other components
export default AutoPersistence;