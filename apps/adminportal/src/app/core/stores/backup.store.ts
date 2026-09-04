import { inject, Injectable } from '@angular/core';
import { BACKUP_VERSION, FmaBackup } from '../models/backup';
import { AnimalService as AnimalDataService } from '../services/animal.service';
import { BatchService as BatchDataService } from '../services/batch.service';
import { EventService as EventDataService } from '../services/event.service';
import { KraalService as KraalDataService } from '../services/kraal.service';
import { ProductService as ProductDataService } from '../services/product.service';
import { StockMovementService as StockMovementDataService } from '../services/stock-movement.service';
import { nowIso } from '../utils/dates';

@Injectable({ providedIn: 'root' })
export class BackupStore {
  private readonly kraalService = inject(KraalDataService);
  private readonly animalService = inject(AnimalDataService);
  private readonly productService = inject(ProductDataService);
  private readonly batchService = inject(BatchDataService);
  private readonly stockMovementService = inject(StockMovementDataService);
  private readonly eventService = inject(EventDataService);

  async exportBackup(): Promise<FmaBackup> {
    return {
      version: BACKUP_VERSION,
      exportedAt: nowIso(),
      kraals: await this.kraalService.list(),
      animals: await this.animalService.list(),
      products: await this.productService.list(),
      batches: await this.batchService.list(),
      stockMovements: await this.stockMovementService.list(),
      events: await this.eventService.list(),
    };
  }

  async importBackup(backup: FmaBackup): Promise<void> {
    if (backup.version !== BACKUP_VERSION) {
      throw new Error('This backup file is not compatible with this app version.');
    }
    await this.eventService.clear();
    await this.stockMovementService.clear();
    await this.batchService.clear();
    await this.productService.clear();
    await this.animalService.clear();
    await this.kraalService.clear();
    for (const kraal of backup.kraals) {
      await this.kraalService.create({ ...kraal, species: kraal.species ?? 'goat' });
    }
    for (const animal of backup.animals) {
      await this.animalService.create(animal);
    }
    for (const product of backup.products) {
      await this.productService.create(product);
    }
    for (const batch of backup.batches) {
      await this.batchService.create(batch);
    }
    for (const movement of backup.stockMovements) {
      await this.stockMovementService.create(movement);
    }
    for (const event of backup.events) {
      await this.eventService.create(event);
    }
  }

  downloadJson(backup: FmaBackup): void {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const day = backup.exportedAt.slice(0, 10);
    link.href = url;
    link.download = `fma-backup-${day}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
