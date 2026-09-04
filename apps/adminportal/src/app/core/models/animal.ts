import { AnimalSex, AnimalStatus, Species } from './species';

export interface Animal {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export const animalLabel = (animal: Pick<Animal, 'tag' | 'name'>): string => {
  const tag = animal.tag.trim();
  const name = animal.name.trim();
  if (tag && name) {
    return `${tag} · ${name}`;
  }
  return tag || name || 'Untagged';
};
