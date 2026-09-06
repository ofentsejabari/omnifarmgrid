import { inject, Injectable } from '@angular/core';
import { Models, Query } from 'appwrite';
import { AppwriteRowStore, ListPagination } from '../data/appwrite-row-store';
import { ProductRow, ProductWrite } from '../models/inventory';

const PRODUCT_TABLE = 'products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly rows = inject(AppwriteRowStore);

  async list(pagination?: ListPagination): Promise<Models.RowList<ProductRow>> {
    return this.rows.list<ProductRow>(PRODUCT_TABLE, [Query.orderAsc('name')], pagination);
  }

  async create(product: ProductWrite): Promise<ProductRow> {
    return this.rows.create<ProductRow>(PRODUCT_TABLE, product);
  }

  watch(onChange: () => void): () => void {
    return this.rows.watch(PRODUCT_TABLE, onChange);
  }
}
