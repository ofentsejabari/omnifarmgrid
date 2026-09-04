import { speciesCopy, Species } from './models/species';

export class DuplicateTagError extends Error {
  constructor(tag: string, species: Species) {
    super(`Ear tag ${tag} is already on a living ${speciesCopy(species).noun}.`);
    this.name = 'DuplicateTagError';
  }
}

export class KraalInUseError extends Error {
  constructor() {
    super('This kraal still has animals. Move or remove them first.');
    this.name = 'KraalInUseError';
  }
}

export class InsufficientStockError extends Error {
  constructor() {
    super('Not enough usable doses in that batch.');
    this.name = 'InsufficientStockError';
  }
}
