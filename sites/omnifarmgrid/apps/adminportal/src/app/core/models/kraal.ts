import { Models } from 'appwrite';
import { Species } from './species';

export type KraalRow = Models.Row & {
  name: string;
  notes: string;
  species: Species;
};

export interface KraalPage {
  page: number;
  limit: number;
  offset: number;
  total: number;
}
