import { Species } from './species';

export const DEATH_REASONS = [
  'disease',
  'predator',
  'dystocia',
  'slaughter',
  'unknown',
  'other',
] as const;
export type DeathReason = (typeof DEATH_REASONS)[number];

export const EXCLUSION_REASONS = [
  'too young',
  'sick',
  'recently done',
  'pregnant',
  'other',
] as const;

interface EventBase {
  id: string;
  date: string;
  notes: string;
  createdAt: string;
}

export interface BirthEvent extends EventBase {
  type: 'birth';
  damId: string;
  kraalId: string;
  kidIds: string[];
}

export interface DeathEvent extends EventBase {
  type: 'death';
  animalId: string;
  kraalId: string;
  reason: DeathReason;
}

export interface TreatmentEvent extends EventBase {
  type: 'treatment';
  kraalId: string;
  productId: string;
  batchId: string;
  treatedAnimalIds: string[];
  excludedAnimalIds: string[];
  exclusionReasons: Record<string, string>;
  dosesUsed: number;
}

export interface MoveEvent extends EventBase {
  type: 'move';
  animalId: string;
  fromKraalId: string;
  toKraalId: string;
}

export type FlockEvent = BirthEvent | DeathEvent | TreatmentEvent | MoveEvent;

export const deathReasonLabel = (reason: DeathReason, species?: Species): string => {
  switch (reason) {
    case 'disease':
      return 'Disease';
    case 'predator':
      return 'Predator';
    case 'dystocia':
      if (species === 'sheep') {
        return 'Lambing trouble';
      }
      if (species === 'pig') {
        return 'Farrowing trouble';
      }
      return 'Kidding trouble';
    case 'slaughter':
      return 'Slaughter';
    case 'unknown':
      return 'Unknown';
    case 'other':
      return 'Other';
  }
};

export const eventTypeLabel = (type: FlockEvent['type']): string => {
  switch (type) {
    case 'birth':
      return 'Birth';
    case 'death':
      return 'Death';
    case 'treatment':
      return 'Vaccination';
    case 'move':
      return 'Move';
  }
};

export const eventTypeIcon = (type: FlockEvent['type']): string => {
  switch (type) {
    case 'birth':
      return 'lucideBaby';
    case 'death':
      return 'lucideHeartOff';
    case 'treatment':
      return 'lucideSyringe';
    case 'move':
      return 'lucideMoveHorizontal';
  }
};
