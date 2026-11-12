import { inject, Injectable } from '@angular/core';
import { InsufficientStockError } from '../utils/errors';
import { TreatmentEventRow } from '../models/event';
import { BatchService as BatchDataService } from '../services/batch.service';
import { EventService as EventDataService } from '../services/event.service';
import { StockMovementService as StockMovementDataService } from '../services/stock-movement.service';
import { nowIso, todayIsoDate } from '../utils/dates';

export interface VaccinateKraalDraft {
  kraalId: string;
  productId: string;
  batchId: string;
  date: string;
  treatedAnimalIds: string[];
  excludedAnimalIds: string[];
  exclusionReasons: Record<string, string>;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class VaccinationStore {
  private readonly batchService = inject(BatchDataService);
  private readonly eventService = inject(EventDataService);
  private readonly stockMovementService = inject(StockMovementDataService);

  async vaccinateKraal(draft: VaccinateKraalDraft): Promise<TreatmentEventRow> {
    if (draft.treatedAnimalIds.length === 0) {
      throw new Error('Select at least one animal to vaccinate.');
    }
    const dosesUsed = draft.treatedAnimalIds.length;
    const batch = await this.batchService.get(draft.batchId);
    if (!batch || batch.quantityOnHand < dosesUsed) {
      throw new InsufficientStockError();
    }
    await this.batchService.update({
      $id: draft.batchId,
      quantityOnHand: batch.quantityOnHand - dosesUsed,
    });
    const event = await this.eventService.create({
      type: 'treatment',
      date: draft.date || todayIsoDate(),
      kraalId: draft.kraalId,
      productId: draft.productId,
      batchId: draft.batchId,
      treatedAnimalIds: [...draft.treatedAnimalIds],
      excludedAnimalIds: [...draft.excludedAnimalIds],
      exclusionReasons: JSON.stringify({ ...draft.exclusionReasons }),
      dosesUsed,
      notes: draft.notes.trim(),
      createdAt: nowIso(),
    });
    await this.stockMovementService.create({
      batchId: draft.batchId,
      productId: draft.productId,
      type: 'out',
      quantity: dosesUsed,
      date: event.date,
      treatmentEventId: event.$id,
      notes: draft.notes.trim(),
    });
    return event as TreatmentEventRow;
  }
}
