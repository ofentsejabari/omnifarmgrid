import { inject, Injectable } from '@angular/core';
import { Models, Query } from 'appwrite';
import { AppwriteClientService, ListPagination } from '../data/appwrite-client.service';
import { AnimalCreatePayload, AnimalRow, AnimalUpdatePayload } from '../models/animal';
import { AnimalSex, AnimalStatus, Species } from '../models/species';

const ANIMAL_TABLE = 'animals';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private readonly rows = inject(AppwriteClientService);

  async list(
    name?: string,
    species?: Species,
    sex?: AnimalSex,
    status?: AnimalStatus,
    kraalId?: string,
    pagination?: ListPagination,
  ): Promise<Models.RowList<AnimalRow>> {
    const queries = [Query.orderDesc('$createdAt')];
    if (name?.trim()) {
      queries.push(Query.contains('name', name.trim()));
    }
    if (species) {
      queries.push(Query.equal('species', species));
    }
    if (sex) {
      queries.push(Query.equal('sex', sex));
    }
    if (status) {
      queries.push(Query.equal('status', status));
    }
    if (kraalId) {
      queries.push(Query.equal('kraalId', kraalId));
    }
    return this.rows.list<AnimalRow>(ANIMAL_TABLE, queries, pagination);
  }

  async get(id: string): Promise<AnimalRow | undefined> {
    return this.rows.get<AnimalRow>(ANIMAL_TABLE, id);
  }

  async existsAliveWithTag(tag: string, species: Species, ignoreId?: string): Promise<boolean> {
    const queries = [
      Query.equal('tag', tag),
      Query.equal('species', species),
      Query.equal('status', 'alive'),
      Query.select(['$id']),
      Query.limit(1),
    ];
    if (ignoreId) {
      queries.push(Query.notEqual('$id', ignoreId));
    }
    const rows = await this.rows.query<AnimalRow>(ANIMAL_TABLE, queries);
    return rows.length > 0;
  }

  async create(animal: AnimalCreatePayload): Promise<AnimalRow> {
    return this.rows.create<AnimalRow>(ANIMAL_TABLE, { ...animal, status: 'alive' });
  }

  async update(changes: Partial<AnimalUpdatePayload> & Pick<AnimalRow, '$id'>): Promise<void> {
    await this.rows.update(ANIMAL_TABLE, changes.$id, changes);
  }

  watch(onChange: () => void): () => void {
    return this.rows.watch(ANIMAL_TABLE, onChange);
  }
}
