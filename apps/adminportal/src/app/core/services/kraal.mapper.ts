import { isSpecies, Species } from '../models/species';
import { Kraal } from '../models/kraal';
import { AppwriteRowRecord } from '../data/appwrite-record';
import { asString, withoutId } from '../data/mapper-helpers';

export const KRAAL_TABLE = 'kraals';

const asSpecies = (value: unknown): Species => {
  const species = asString(value);
  return isSpecies(species) ? species : 'goat';
};

export const fromAppwriteKraal = (row: AppwriteRowRecord): Kraal => ({
  id: row.$id,
  name: asString(row['name']),
  notes: asString(row['notes']),
  species: asSpecies(row['species']),
  createdAt: asString(row['createdAt']),
  updatedAt: asString(row['updatedAt']),
});

export const toAppwriteKraal = (kraal: Kraal): Record<string, unknown> => withoutId(kraal);

export const toAppwriteKraalPatch = (changes: Partial<Kraal>): Record<string, unknown> =>
  withoutId(changes);
