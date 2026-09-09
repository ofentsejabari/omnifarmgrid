import { Models } from 'appwrite';
import { AnimalSex, AnimalStatus, Species } from './species';

export type AnimalRow = Models.Row & {
  species: Species;
  tag: string;
  name: string;
  sex: AnimalSex;
  breed: string;
  dateOfBirth: string;
  birthDateEstimated: boolean;
  damId: string;
  sireId: string;
  kraalId: string;
  status: AnimalStatus;
  notes: string;
};

export type AnimalCreatePayload = Omit<AnimalRow, keyof Models.Row | 'status'>;
export type AnimalUpdatePayload = Pick<AnimalRow, '$id' | 'species' | 'tag' | 'kraalId'> &
  Partial<Omit<AnimalRow, keyof Models.Row | 'species' | 'tag' | 'kraalId'>>;

export const animalLabel = (animal: Pick<AnimalRow, 'tag' | 'name'>): string => {
  const tag = animal.tag.trim();
  const name = animal.name.trim();
  if (tag && name) {
    return `${tag} · ${name}`;
  }
  return tag || name || 'Untagged';
};
