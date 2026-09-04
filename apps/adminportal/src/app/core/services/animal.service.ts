import { inject, Injectable } from '@angular/core';
import { Query } from 'appwrite';
import { AppwriteRowStore } from '../data/appwrite-row-store';
import { Animal } from '../models/animal';
import { AnimalSex, AnimalStatus, Species } from '../models/species';
import { ANIMAL_TABLE, fromAppwriteAnimal, toAppwriteAnimal, toAppwriteAnimalPatch } from './animal.mapper';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private readonly appwriteRowStore = inject(AppwriteRowStore);

  async list(name?: string, species?: Species, sex?: AnimalSex, status?: AnimalStatus): Promise<Animal[]> {
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

    return (await this.appwriteRowStore.list(ANIMAL_TABLE, queries)).map(fromAppwriteAnimal);
  }

  async get(id: string): Promise<Animal | undefined> {
    const row = await this.appwriteRowStore.get(ANIMAL_TABLE, id);
    return row ? fromAppwriteAnimal(row) : undefined;
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
    const rows = await this.appwriteRowStore.query(ANIMAL_TABLE, queries);
    return rows.length > 0;
  }

  async create(animal: Animal): Promise<Animal> {
    const row = await this.appwriteRowStore.create(ANIMAL_TABLE, animal.id, toAppwriteAnimal(animal));
    return fromAppwriteAnimal(row);
  }

  async update(id: string, changes: Partial<Animal>): Promise<void> {
    await this.appwriteRowStore.update(ANIMAL_TABLE, id, toAppwriteAnimalPatch(changes));
  }

  async delete(id: string): Promise<void> {
    await this.appwriteRowStore.delete(ANIMAL_TABLE, id);
  }

  async clear(): Promise<void> {
    for (const animal of await this.list()) {
      await this.delete(animal.id);
    }
  }

  watch(onChange: () => void): () => void {
    return this.appwriteRowStore.watch(ANIMAL_TABLE, onChange);
  }
}
