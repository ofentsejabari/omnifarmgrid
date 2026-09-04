import { inject, Injectable } from '@angular/core';
import { AppwriteRowStore } from '../data/appwrite-row-store';
import { Kraal } from '../models/kraal';
import { fromAppwriteKraal, KRAAL_TABLE, toAppwriteKraal, toAppwriteKraalPatch } from './kraal.mapper';

@Injectable({ providedIn: 'root' })
export class KraalService {
  private readonly rows = inject(AppwriteRowStore);

  async list(): Promise<Kraal[]> {
    return (await this.rows.list(KRAAL_TABLE)).map(fromAppwriteKraal);
  }

  async get(id: string): Promise<Kraal | undefined> {
    const row = await this.rows.get(KRAAL_TABLE, id);
    return row ? fromAppwriteKraal(row) : undefined;
  }

  async create(kraal: Kraal): Promise<Kraal> {
    const row = await this.rows.create(KRAAL_TABLE, kraal.id, toAppwriteKraal(kraal));
    return fromAppwriteKraal(row);
  }

  async update(id: string, changes: Partial<Kraal>): Promise<void> {
    await this.rows.update(KRAAL_TABLE, id, toAppwriteKraalPatch(changes));
  }

  async delete(id: string): Promise<void> {
    await this.rows.delete(KRAAL_TABLE, id);
  }

  async clear(): Promise<void> {
    for (const kraal of await this.list()) {
      await this.delete(kraal.id);
    }
  }

  watch(onChange: () => void): () => void {
    return this.rows.watch(KRAAL_TABLE, onChange);
  }
}
