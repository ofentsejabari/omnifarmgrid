import { Injectable } from '@angular/core';
import { Account, Client, Models, Realtime, TablesDB } from 'appwrite';

export const isRegisteredUser = (user: Models.User): boolean => user.email.trim().length > 0;

@Injectable({ providedIn: 'root' })
export class AppwriteClient {
  readonly client: Client;
  readonly account: Account;
  readonly tables: TablesDB;
  readonly realtime: Realtime;
  private sessionReady: Promise<void> | undefined;

  constructor() {
    this.client = new Client()
      .setEndpoint(import.meta.env.NG_APP_APPWRITE_ENDPOINT)
      .setProject(import.meta.env.NG_APP_APPWRITE_PROJECT_ID);
    this.account = new Account(this.client);
    this.tables = new TablesDB(this.client);
    this.realtime = new Realtime(this.client);
  }

  get ready(): Promise<void> {
    this.sessionReady ??= this.requireRegisteredSession();
    return this.sessionReady;
  }

  markAuthenticated(): void {
    this.sessionReady = Promise.resolve();
  }

  clearSession(): void {
    this.sessionReady = undefined;
  }

  private async requireRegisteredSession(): Promise<void> {
    const user = await this.account.get();
    if (!isRegisteredUser(user)) {
      await this.account.deleteSession({ sessionId: 'current' });
      throw new Error('Sign in required.');
    }
  }
}
