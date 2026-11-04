const DATABASE_NAME = 'signbridge-ai';
const DATABASE_VERSION = 1;
const STORE_NAME = 'isl-dataset-samples';

export type StoredDatasetSample = {
  id: string;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      reject(request.error ?? new Error('Could not open dataset database.'));
    };
    request.onblocked = () => {
      reject(new Error('Database upgrade is blocked by another open tab.'));
    };
  });
}

export async function getAllSamples<T extends StoredDatasetSample>(): Promise<T[]> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error ?? new Error('Could not read samples.'));

    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not read samples.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('Reading samples was cancelled.'));
    };
  });
}

export async function saveSample<T extends StoredDatasetSample>(sample: T): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(sample);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not save sample.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('Saving sample was cancelled.'));
    };
  });
}

export async function deleteStoredSample(id: string): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not delete sample.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('Deleting sample was cancelled.'));
    };
  });
}