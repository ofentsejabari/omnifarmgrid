import {
  BirthEvent,
  DeathEvent,
  DeathReason,
  FlockEvent,
  MoveEvent,
  TreatmentEvent,
} from '../models/event';
import { AppwriteRowRecord } from '../data/appwrite-record';
import { asNumber, asString, asStringArray } from '../data/mapper-helpers';

export const EVENT_TABLE = 'events';

const asDeathReason = (value: unknown): DeathReason => {
  const reason = asString(value, 'unknown');
  if (
    reason === 'disease' ||
    reason === 'predator' ||
    reason === 'dystocia' ||
    reason === 'slaughter' ||
    reason === 'other'
  ) {
    return reason;
  }
  return 'unknown';
};

const parseExclusionReasons = (value: unknown): Record<string, string> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    );
    return Object.fromEntries(entries);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    try {
      return parseExclusionReasons(JSON.parse(value) as unknown);
    } catch {
      return {};
    }
  }
  return {};
};

export const fromAppwriteEvent = (row: AppwriteRowRecord): FlockEvent => {
  const id = row.$id;
  const date = asString(row['date']);
  const notes = asString(row['notes']);
  const createdAt = asString(row['createdAt']);
  const type = asString(row['type']);
  if (type === 'birth') {
    const event: BirthEvent = {
      id,
      type: 'birth',
      date,
      notes,
      createdAt,
      damId: asString(row['damId']),
      kraalId: asString(row['kraalId']),
      kidIds: asStringArray(row['kidIds']),
    };
    return event;
  }
  if (type === 'death') {
    const event: DeathEvent = {
      id,
      type: 'death',
      date,
      notes,
      createdAt,
      animalId: asString(row['animalId']),
      kraalId: asString(row['kraalId']),
      reason: asDeathReason(row['reason']),
    };
    return event;
  }
  if (type === 'move') {
    const event: MoveEvent = {
      id,
      type: 'move',
      date,
      notes,
      createdAt,
      animalId: asString(row['animalId']),
      fromKraalId: asString(row['fromKraalId']),
      toKraalId: asString(row['toKraalId']),
    };
    return event;
  }
  const event: TreatmentEvent = {
    id,
    type: 'treatment',
    date,
    notes,
    createdAt,
    kraalId: asString(row['kraalId']),
    productId: asString(row['productId']),
    batchId: asString(row['batchId']),
    treatedAnimalIds: asStringArray(row['treatedAnimalIds']),
    excludedAnimalIds: asStringArray(row['excludedAnimalIds']),
    exclusionReasons: parseExclusionReasons(row['exclusionReasons']),
    dosesUsed: asNumber(row['dosesUsed']),
  };
  return event;
};

export const toAppwriteEvent = (event: FlockEvent): Record<string, unknown> => {
  const base = {
    type: event.type,
    date: event.date,
    notes: event.notes,
    createdAt: event.createdAt,
  };
  switch (event.type) {
    case 'birth':
      return { ...base, damId: event.damId, kraalId: event.kraalId, kidIds: event.kidIds };
    case 'death':
      return { ...base, animalId: event.animalId, kraalId: event.kraalId, reason: event.reason };
    case 'move':
      return {
        ...base,
        animalId: event.animalId,
        fromKraalId: event.fromKraalId,
        toKraalId: event.toKraalId,
      };
    case 'treatment':
      return {
        ...base,
        kraalId: event.kraalId,
        productId: event.productId,
        batchId: event.batchId,
        treatedAnimalIds: event.treatedAnimalIds,
        excludedAnimalIds: event.excludedAnimalIds,
        exclusionReasons: JSON.stringify(event.exclusionReasons),
        dosesUsed: event.dosesUsed,
      };
  }
};

export const toAppwriteEventPatch = (changes: Partial<FlockEvent>): Record<string, unknown> => {
  if (changes.type) {
    return toAppwriteEvent(changes as FlockEvent);
  }
  const { id: _id, ...rest } = changes;
  return rest;
};
