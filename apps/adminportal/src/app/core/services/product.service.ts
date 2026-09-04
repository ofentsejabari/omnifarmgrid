import { inject, Injectable } from '@angular/core';
import { AppwriteRowStore } from '../data/appwrite-row-store';
import { Product } from '../models/inventory';
import { fromAppwriteProduct, PRODUCT_TABLE, toAppwriteProduct, toAppwriteProductPatch } from './product.mapper';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly rows = inject(AppwriteRowStore);

  async list(): Promise<Product[]> {
    return (await this.rows.list(PRODUCT_TABLE)).map(fromAppwriteProduct);
  }

  async get(id: string): Promise<Product | undefined> {
    const row = await this.rows.get(PRODUCT_TABLE, id);
    return row ? fromAppwriteProduct(row) : undefined;
  }

  async create(product: Product): Promise<Product> {
    const row = await this.rows.create(PRODUCT_TABLE, product.id, toAppwriteProduct(product));
    return fromAppwriteProduct(row);
  }

  async update(id: string, changes: Partial<Product>): Promise<void> {
    await this.rows.update(PRODUCT_TABLE, id, toAppwriteProductPatch(changes));
  }

  async delete(id: string): Promise<void> {
    await this.rows.delete(PRODUCT_TABLE, id);
  }

  async clear(): Promise<void> {
    for (const product of await this.list()) {
      await this.delete(product.id);
    }
  }

  watch(onChange: () => void): () => void {
    return this.rows.watch(PRODUCT_TABLE, onChange);
  }
}
