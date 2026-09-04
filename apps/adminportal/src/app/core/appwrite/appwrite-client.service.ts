import { Injectable } from '@angular/core';
import { Account, Client, Realtime, TablesDB } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from './appwrite.constants';

export const ensureGuestSession = async (account: {
  get: () => Promise<unknown>;
  createAnonymousSession: () => Promise<unknown>;
}): Promise<void> => {
  try {
    await account.get();
  } catch {
    await account.createAnonymousSession();
  }
};

@Injectable({ providedIn: 'root' })
export class AppwriteClient {
  readonly client: Client;
  readonly account: Account;
  readonly tables: TablesDB;
  readonly realtime: Realtime;
  private sessionReady: Promise<void> | undefined;

  constructor() {
    this.client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
    this.account = new Account(this.client);
    this.tables = new TablesDB(this.client);
    this.realtime = new Realtime(this.client);
  }

  get ready(): Promise<void> {
    this.sessionReady ??= ensureGuestSession(this.account);
    return this.sessionReady;
  }
}
