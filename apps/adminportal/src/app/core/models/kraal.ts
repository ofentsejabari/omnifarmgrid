import { Species } from './species';

export interface Kraal {
  id: string;
  name: string;
  notes: string;
  species: Species;
  createdAt: string;
  updatedAt: string;
}
