import { computed, inject, Injectable, signal } from '@angular/core';
import { Models } from 'appwrite';
import { AppwriteClient, isRegisteredUser } from '../appwrite/appwrite-client.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly appwrite = inject(AppwriteClient);
  private readonly user = signal<Models.User | null>(null);
  private hydratePromise: Promise<void> | undefined;

  readonly currentUser = this.user.asReadonly();
  readonly displayName = computed(() => {
    const current = this.user();
    if (!current) {
      return '';
    }
    return current.name.trim() || current.email;
  });
  readonly initials = computed(() => {
    const current = this.user();
    if (!current) {
      return '';
    }
    const source = current.name.trim() || current.email;
    const parts = source.split(/[\s@._-]+/).filter((part) => part.length > 0);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  });

  hydrate(): Promise<void> {
    this.hydratePromise ??= this.loadUser();
    return this.hydratePromise;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await this.appwrite.account.deleteSession({ sessionId: 'current' });
    } catch {
      /* no existing session */
    }
    await this.appwrite.account.createEmailPasswordSession({ email, password });
    const user = await this.appwrite.account.get();
    this.user.set(user);
    this.appwrite.markAuthenticated();
    this.hydratePromise = Promise.resolve();
  }

  async logout(): Promise<void> {
    try {
      await this.appwrite.account.deleteSession({ sessionId: 'current' });
    } catch {
      /* already signed out */
    }
    this.user.set(null);
    this.appwrite.clearSession();
    this.hydratePromise = Promise.resolve();
  }

  private async loadUser(): Promise<void> {
    try {
      const user = await this.appwrite.account.get();
      if (!isRegisteredUser(user)) {
        await this.appwrite.account.deleteSession({ sessionId: 'current' });
        this.user.set(null);
        this.appwrite.clearSession();
        return;
      }
      this.user.set(user);
      this.appwrite.markAuthenticated();
    } catch {
      this.user.set(null);
      this.appwrite.clearSession();
    }
  }
}
