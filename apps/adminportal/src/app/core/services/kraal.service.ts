import { inject, Injectable } from '@angular/core';
import { Models, Query } from 'appwrite';
import { AppwriteClientService, ListPagination } from '../data/appwrite-client.service';
import { KraalRow } from '../models/kraal';
import { Species } from '../models/species';

const KRAAL_TABLE = 'kraals';

@Injectable({ providedIn: 'root' })
export class KraalService {
  private readonly appwriteClientService = inject(AppwriteClientService);

  async list(species?: Species, pagination?: ListPagination): Promise<Models.RowList<KraalRow>> {
    const queries = [Query.orderDesc('$createdAt')];
    if (species) {
      queries.push(Query.equal('species', species));
    }
    return this.appwriteClientService.list<KraalRow>(KRAAL_TABLE, queries, pagination);
  }

  async get(id: string): Promise<KraalRow | undefined> {
    return this.appwriteClientService.get<KraalRow>(KRAAL_TABLE, id);
  }

  async create(kraal: Pick<KraalRow, 'name' | 'notes' | 'species'>): Promise<KraalRow> {
    return this.appwriteClientService.create<KraalRow>(KRAAL_TABLE, kraal);
  }

  async update(changes: Pick<KraalRow, '$id' | 'name' | 'notes' | 'species'>): Promise<void> {
    await this.appwriteClientService.update(KRAAL_TABLE, changes.$id, changes);
  }

  async delete(id: string): Promise<void> {
    await this.appwriteClientService.delete(KRAAL_TABLE, id);
  }

  watch(onChange: () => void): () => void {
    return this.appwriteClientService.watch(KRAAL_TABLE, onChange);
  }
}
