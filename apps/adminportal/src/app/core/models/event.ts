import { Models } from 'appwrite';
import { Species, speciesVocabulary } from './species';

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

type EventBaseRow = Models.Row & {
  date: string;
  notes: string;
  createdAt: string;
};

export type BirthEventRow = EventBaseRow & {
  type: 'birth';
  damId: string;
  kraalId: string;
  kidIds: string[];
};

export type DeathEventRow = EventBaseRow & {
  type: 'death';
  animalId: string;
  kraalId: string;
  reason: DeathReason;
};

export type TreatmentEventRow = EventBaseRow & {
  type: 'treatment';
  kraalId: string;
  productId: string;
  batchId: string;
  treatedAnimalIds: string[];
  excludedAnimalIds: string[];
  exclusionReasons: string;
  dosesUsed: number;
};

export type MoveEventRow = EventBaseRow & {
  type: 'move';
  animalId: string;
  fromKraalId: string;
  toKraalId: string;
};

export type FlockEventRow = BirthEventRow | DeathEventRow | TreatmentEventRow | MoveEventRow;

export type EventWrite =
  | Omit<BirthEventRow, keyof Models.Row>
  | Omit<DeathEventRow, keyof Models.Row>
  | Omit<TreatmentEventRow, keyof Models.Row>
  | Omit<MoveEventRow, keyof Models.Row>;

export const deathReasonLabel = (reason: DeathReason, species?: Species): string => {
  switch (reason) {
    case 'disease':
      return 'Disease';
    case 'predator':
      return 'Predator';
    case 'dystocia': {
      if (!species) {
        return 'Birth trouble';
      }
      const birth = speciesVocabulary(species).birth;
      return `${birth.charAt(0).toUpperCase()}${birth.slice(1)} trouble`;
    }
    case 'slaughter':
      return 'Slaughter';
    case 'unknown':
      return 'Unknown';
    case 'other':
      return 'Other';
  }
};

export const eventTypeLabel = (type: FlockEventRow['type']): string => {
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

export const eventTypeIcon = (type: FlockEventRow['type']): string => {
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
