import { inject, Injectable } from '@angular/core';
import { Models, Query } from 'appwrite';
import { AppwriteClient } from '../appwrite/appwrite-client.service';
import { APPWRITE_DATABASE_ID } from '../appwrite/appwrite.constants';
import { createId } from '../utils/id';

export const LIST_PAGE_SIZE = 10;
const LIST_MAX_PAGE_SIZE = 100;

export interface ListPagination {
  limit: number;
  offset?: number;
}

@Injectable({ providedIn: 'root' })
export class AppwriteRowStore {
  private readonly appwrite = inject(AppwriteClient);
  private readonly listeners = new Map<string, Set<() => void>>();

  async list<Row extends Models.Row = Models.DefaultRow>(
    table: string,
    queries: string[] = [],
    pagination?: ListPagination,
  ): Promise<Models.RowList<Row>> {
    await this.appwrite.ready;
    if (pagination) {
      return this.listPage<Row>(table, queries, pagination);
    }
    return this.listAll<Row>(table, queries);
  }

  async query<Row extends Models.Row = Models.DefaultRow>(
    table: string,
    queries: string[],
  ): Promise<Row[]> {
    await this.appwrite.ready;
    const page = await this.appwrite.tables.listRows<Row>({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: table,
      queries,
    });
    return page.rows;
  }

  async get<Row extends Models.Row = Models.DefaultRow>(
    table: string,
    id: string,
  ): Promise<Row | undefined> {
    await this.appwrite.ready;
    try {
      return await this.appwrite.tables.getRow<Row>({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: table,
        rowId: id,
      });
    } catch {
      return undefined;
    }
  }

  async create<Row extends Models.Row = Models.DefaultRow>(
    table: string,
    data: Record<string, unknown>,
  ): Promise<Row> {
    await this.appwrite.ready;
    const created = await this.appwrite.tables.createRow<Row>({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: table,
      rowId: createId(),
      data: data as never,
    });
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

  private async listPage<Row extends Models.Row = Models.DefaultRow>(
    table: string,
    queries: string[],
    pagination: ListPagination,
  ): Promise<Models.RowList<Row>> {
    const limit = Math.min(Math.max(Math.trunc(pagination.limit), 1), LIST_MAX_PAGE_SIZE);
    const offset = Math.max(Math.trunc(pagination.offset ?? 0), 0);
    return this.appwrite.tables.listRows<Row>({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: table,
      queries: [...queries, Query.limit(limit), Query.offset(offset)],
    });
  }

  private async listAll<Row extends Models.Row = Models.DefaultRow>(
    table: string,
    queries: string[],
  ): Promise<Models.RowList<Row>> {
    const rows: Row[] = [];
    let cursor: string | undefined;
    let total = 0;
    for (;;) {
      const pageQueries = [...queries, Query.limit(LIST_MAX_PAGE_SIZE)];
      if (cursor) {
        pageQueries.push(Query.cursorAfter(cursor));
      }
      const page = await this.appwrite.tables.listRows<Row>({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: table,
        queries: pageQueries,
      });
      if (!cursor) {
        total = page.total;
      }
      const pageRows = page.rows;
      rows.push(...pageRows);
      if (pageRows.length < LIST_MAX_PAGE_SIZE) {
        break;
      }
      cursor = pageRows[pageRows.length - 1].$id;
    }
    return { total, rows };
  }

  private notify(table: string): void {
    this.listeners.get(table)?.forEach((listener) => listener());
  }
}
