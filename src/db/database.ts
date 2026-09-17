import Dexie, { Table } from 'dexie';
import { Batch, DailyFarmRecord, FarmAlert, FarmSettings, FeedDelivery, User } from '../types';

export class PoultryDatabase extends Dexie {
  batches!: Table<Batch, string>;
  daily_records!: Table<DailyFarmRecord, number>;
  feed_deliveries!: Table<FeedDelivery, number>;
  alerts!: Table<FarmAlert, string>;
  settings!: Table<{ key: string; value: any }, string>;
  users!: Table<User, string>;

  constructor() {
    super('VenkateshwaraPoultryDB');
    this.version(1).stores({
      batches: 'id, name, status, startDate',
      daily_records: '++id, batchId, date, dayOfBatch, timestamp, [batchId+date]',
      feed_deliveries: '++id, batchId, date',
      alerts: 'id, category, severity, date, acknowledged',
      settings: 'key',
      users: 'id, email',
    });
  }
}

export const db = new PoultryDatabase();
