import { Animal } from '../models/animal';
import { AnimalSex, AnimalStatus, isSpecies, Species } from '../models/species';
import { AppwriteRowRecord } from '../data/appwrite-record';
import { asBoolean, asString, withoutId } from '../data/mapper-helpers';

export const ANIMAL_TABLE = 'animals';

const asSpecies = (value: unknown): Species => {
  const species = asString(value);
  return isSpecies(species) ? species : 'goat';
};

const asSex = (value: unknown): AnimalSex => {
  const sex = asString(value);
  return sex === 'male' || sex === 'wether' ? sex : 'female';
};

const asStatus = (value: unknown): AnimalStatus => {
  const status = asString(value, 'alive');
  if (status === 'sold' || status === 'dead' || status === 'culled' || status === 'missing') {
    return status;
  }
  return 'alive';
};

export const fromAppwriteAnimal = (row: AppwriteRowRecord): Animal => ({
  id: row.$id,
  species: asSpecies(row['species']),
  tag: asString(row['tag']),
  name: asString(row['name']),
  sex: asSex(row['sex']),
  breed: asString(row['breed']),
  dateOfBirth: asString(row['dateOfBirth']),
  birthDateEstimated: asBoolean(row['birthDateEstimated']),
  damId: asString(row['damId']),
  sireId: asString(row['sireId']),
  kraalId: asString(row['kraalId']),
  status: asStatus(row['status']),
  notes: asString(row['notes']),
  createdAt: asString(row['createdAt']),
  updatedAt: asString(row['updatedAt']),
});

export const toAppwriteAnimal = (animal: Animal): Record<string, unknown> => withoutId(animal);

export const toAppwriteAnimalPatch = (changes: Partial<Animal>): Record<string, unknown> =>
  withoutId(changes);
