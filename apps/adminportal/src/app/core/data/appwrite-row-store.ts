import { inject, Injectable } from '@angular/core';
import { Query } from 'appwrite';
import { AppwriteClient } from '../appwrite/appwrite-client.service';
import { APPWRITE_DATABASE_ID } from '../appwrite/appwrite.constants';
import { AppwriteRowRecord } from './appwrite-record';

interface RowPage {
  rows?: AppwriteRowRecord[];
  documents?: AppwriteRowRecord[];
}

@Injectable({ providedIn: 'root' })
export class AppwriteRowStore {
  private readonly appwrite = inject(AppwriteClient);
  private readonly listeners = new Map<string, Set<() => void>>();

  async list(table: string, queries: string[] = []): Promise<AppwriteRowRecord[]> {
    await this.appwrite.ready;
    const collected: AppwriteRowRecord[] = [];
    let cursor: string | undefined;
    for (;;) {
      const pageQueries = [...queries, Query.limit(100)];
      if (cursor) {
        pageQueries.push(Query.cursorAfter(cursor));
      }
      const page = (await this.appwrite.tables.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: table,
        queries: pageQueries,
      })) as RowPage;
      const rows = page.rows ?? page.documents ?? [];
      collected.push(...rows);
      if (rows.length < 100) {
        break;
      }
      cursor = rows[rows.length - 1].$id;
    }
    return collected;
  }

  async query(table: string, queries: string[]): Promise<AppwriteRowRecord[]> {
    await this.appwrite.ready;
    const page = (await this.appwrite.tables.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: table,
      queries,
    })) as RowPage;
    return page.rows ?? page.documents ?? [];
  }

  async get(table: string, id: string): Promise<AppwriteRowRecord | undefined> {
    await this.appwrite.ready;
    try {
      return (await this.appwrite.tables.getRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: table,
        rowId: id,
      })) as AppwriteRowRecord;
    } catch {
      return undefined;
    }
  }

  async create(
    table: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<AppwriteRowRecord> {
    await this.appwrite.ready;
    const created = (await this.appwrite.tables.createRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: table,
      rowId: id,
      data,
    })) as AppwriteRowRecord;
    this.notify(table);
    return created;
  }

  async update(table: string, id: string, data: Record<string, unknown>): Promise<void> {
    await this.appwrite.ready;
    await this.appwrite.tables.updateRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: table,
      rowId: id,
      data,
    });
    this.notify(table);
  }

  async delete(table: string, id: string): Promise<void> {
    await this.appwrite.ready;
    await this.appwrite.tables.deleteRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: table,
      rowId: id,
    });
    this.notify(table);
  }

  watch(table: string, onChange: () => void): () => void {
    let listeners = this.listeners.get(table);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(table, listeners);
    }
    listeners.add(onChange);
    const channel = `databases.${APPWRITE_DATABASE_ID}.tables.${table}.rows`;
    let closed = false;
    let closeRealtime: (() => void) | undefined;
    void this.appwrite.ready
      .then(() => {
        if (closed) {
          return undefined;
        }
        return this.appwrite.realtime.subscribe(channel, () => onChange());
      })
      .then((subscription) => {
        if (!subscription) {
          return;
        }
        if (closed) {
          void subscription.close();
          return;
        }
        closeRealtime = () => {
          void subscription.close();
        };
      })
      .catch(() => undefined);
    return () => {
      closed = true;
      listeners.delete(onChange);
      closeRealtime?.();
    };
  }

  private notify(table: string): void {
    this.listeners.get(table)?.forEach((listener) => listener());
  }
}
