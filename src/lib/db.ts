import { openDB, DBSchema } from 'idb';
import { Order, DailyReport } from '../types';

interface PODDB extends DBSchema {
  orders: {
    key: string;
    value: Order;
  };
  reports: {
    key: string;
    value: DailyReport;
  };
}

const dbPromise = openDB<PODDB>('pod-manager-db', 1, {
  upgrade(db) {
    db.createObjectStore('orders', { keyPath: 'id' });
    db.createObjectStore('reports', { keyPath: 'id' });
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

export async function getAllReports() {
  const db = await dbPromise;
  return db.getAll('reports');
}

export async function putReport(report: DailyReport) {
  const db = await dbPromise;
  await db.put('reports', report);
}

export async function deleteOrder(id: string) {
  const db = await dbPromise;
  await db.delete('orders', id);
}

