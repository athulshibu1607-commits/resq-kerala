// RESQ KERALA — IndexedDB Offline Emergency SOS Queue Manager
// Stores pending distress payloads locally when cell/mesh connectivity is degraded

import { IncidentCategory, IncidentSeverity } from '@/lib/types';

export interface OfflineSOSDraft {
  idempotencyKey: string;
  trackingCode: string;
  timestamp: string;
  status: 'saved_locally' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string;
  payload: {
    title: string;
    titleMl?: string;
    district: string;
    panchayat?: string;
    locationDescription: string;
    lat: number;
    lng: number;
    category: IncidentCategory;
    severity: IncidentSeverity;
    peopleAffected: number;
    specialNeeds: string[];
    contactName: string;
    contactPhone: string;
    notes?: string;
    photoUrl?: string;
  };
}

const DB_NAME = 'resq_kerala_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'sos_drafts';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in current environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'idempotencyKey' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineDraft(
  payload: OfflineSOSDraft['payload']
): Promise<OfflineSOSDraft> {
  const db = await openDB();
  const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const trackingCode = `KL-${payload.district.substring(0, 3).toUpperCase()}-OFF-${randomSuffix}`;

  const draft: OfflineSOSDraft = {
    idempotencyKey,
    trackingCode,
    timestamp: new Date().toISOString(),
    status: 'saved_locally',
    retryCount: 0,
    payload,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(draft);

    request.onsuccess = () => resolve(draft);
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineDrafts(): Promise<OfflineSOSDraft[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return [];
  }
}

export async function deleteOfflineDraft(idempotencyKey: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(idempotencyKey);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updateDraftStatus(
  idempotencyKey: string,
  status: OfflineSOSDraft['status'],
  error?: string
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(idempotencyKey);

    getReq.onsuccess = () => {
      const draft = getReq.result as OfflineSOSDraft;
      if (draft) {
        draft.status = status;
        if (status === 'syncing') draft.retryCount += 1;
        if (error) draft.lastError = error;
        store.put(draft);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
