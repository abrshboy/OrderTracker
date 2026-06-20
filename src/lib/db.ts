import { openDB, DBSchema } from 'idb';
import { Order } from '../types';

interface PODDB extends DBSchema {
  orders: {
    key: string;
    value: Order;
  };
}

const dbPromise = openDB<PODDB>('pod-manager-db', 2, {
  upgrade(db, oldVersion, newVersion) {
    if (oldVersion < 1) {
      db.createObjectStore('orders', { keyPath: 'id' });
    }
    // Handle migration clean if any
    if (oldVersion >= 1 && !db.objectStoreNames.contains('orders')) {
      db.createObjectStore('orders', { keyPath: 'id' });
    }
  },
});

export async function getAllOrders() {
  const db = await dbPromise;
  return db.getAll('orders');
}

export async function putOrder(order: Order) {
  const db = await dbPromise;
  await db.put('orders', order);
}

export async function putOrders(orders: Order[]) {
  const db = await dbPromise;
  const tx = db.transaction('orders', 'readwrite');
  for (const o of orders) {
    tx.store.put(o);
  }
  await tx.done;
}

export async function deleteOrder(id: string) {
  const db = await dbPromise;
  await db.delete('orders', id);
}

export async function clearAllOrders() {
  const db = await dbPromise;
  const tx = db.transaction('orders', 'readwrite');
  await tx.store.clear();
  await tx.done;
}
