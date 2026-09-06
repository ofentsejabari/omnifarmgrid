export const SPECIES = ['goat', 'sheep', 'pig'] as const;
export type Species = (typeof SPECIES)[number];

export const ANIMAL_SEXES = ['female', 'male', 'wether'] as const;
export type AnimalSex = (typeof ANIMAL_SEXES)[number];

export const ANIMAL_STATUSES = ['alive', 'sold', 'dead', 'culled', 'missing'] as const;
export type AnimalStatus = (typeof ANIMAL_STATUSES)[number];

export interface SpeciesVocabulary {
  id: Species;
  noun: string;
  plural: string;
  icon: 'speciesGoat' | 'speciesSheep' | 'speciesPig';
  young: string;
  youngPlural: string;
  dam: string;
  sire: string;
  location: string;
  locationPlural: string;
  birth: string;
  birthVerb: string;
}

export const SPECIES_VOCABULARY: Record<Species, SpeciesVocabulary> = {
  goat: {
    id: 'goat',
    noun: 'goat',
    plural: 'goats',
    icon: 'speciesGoat',
    young: 'kid',
    youngPlural: 'kids',
    dam: 'doe',
    sire: 'buck',
    location: 'kraal',
    locationPlural: 'kraals',
    birth: 'kidding',
    birthVerb: 'Record kidding',
  },
  sheep: {
    id: 'sheep',
    noun: 'sheep',
    plural: 'sheep',
    icon: 'speciesSheep',
    young: 'lamb',
    youngPlural: 'lambs',
    dam: 'ewe',
    sire: 'ram',
    location: 'kraal',
    locationPlural: 'kraals',
    birth: 'lambing',
    birthVerb: 'Record lambing',
  },
  pig: {
    id: 'pig',
    noun: 'pig',
    plural: 'pigs',
    icon: 'speciesPig',
    young: 'piglet',
    youngPlural: 'piglets',
    dam: 'sow',
    sire: 'boar',
    location: 'pen',
    locationPlural: 'pens',
    birth: 'farrowing',
    birthVerb: 'Record farrowing',
  },
};

export const speciesVocabulary = (species: Species): SpeciesVocabulary =>
  SPECIES_VOCABULARY[species];

export const speciesLabel = (species: Species): string => {
  switch (species) {
    case 'goat':
      return 'Goat';
    case 'sheep':
      return 'Sheep';
    case 'pig':
      return 'Pig';
  }
};

export const animalSexLabel = (species: Species, sex: AnimalSex): string => {
  if (sex === 'female') {
    return species === 'goat' ? 'Doe' : species === 'sheep' ? 'Ewe' : 'Sow';
  }
  if (sex === 'male') {
    return species === 'goat' ? 'Buck' : species === 'sheep' ? 'Ram' : 'Boar';
  }
  return species === 'pig' ? 'Barrow' : 'Wether';
};

export const BREEDS: Record<Species, readonly string[]> = {
  goat: ['Tswana', 'Boer', 'Kalahari Red', 'Savannah', 'Saanen', 'Toggenburg', 'Alpine', 'Cross'],
  sheep: ['Dorper', 'Damara', 'Meatmaster', 'Merino', 'Blackhead Persian', 'Cross'],
  pig: ['Large White', 'Landrace', 'Duroc', 'Kolbroek', 'Pietrain', 'Cross'],
};

export const speciesBadgeClass = (species: Species): string => {
  switch (species) {
    case 'goat':
      return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80 dark:bg-emerald-900/50 dark:text-emerald-200 dark:ring-emerald-800/60';
    case 'sheep':
      return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-800/60';
    case 'pig':
      return 'bg-rose-50 text-rose-800 ring-1 ring-rose-200/80 dark:bg-rose-900/40 dark:text-rose-200 dark:ring-rose-800/60';
  }
};

export const speciesIconClass = (species: Species): string => {
  switch (species) {
    case 'goat':
      return 'text-emerald-700 dark:text-emerald-300';
    case 'sheep':
      return 'text-amber-700 dark:text-amber-300';
    case 'pig':
      return 'text-rose-600 dark:text-rose-300';
  }
};

export const speciesAccentClass = (species: Species): string => {
  switch (species) {
    case 'goat':
      return 'border-l-[3px] border-l-emerald-500';
    case 'sheep':
      return 'border-l-[3px] border-l-amber-500';
    case 'pig':
      return 'border-l-[3px] border-l-rose-400';
  }
};

export const speciesAvatarClass = (species: Species): string => {
  switch (species) {
    case 'goat':
      return 'bg-emerald-100 ring-1 ring-emerald-200/70 dark:bg-emerald-900/50 dark:ring-emerald-800/50';
    case 'sheep':
      return 'bg-amber-100 ring-1 ring-amber-200/70 dark:bg-amber-900/40 dark:ring-amber-800/50';
    case 'pig':
      return 'bg-rose-100 ring-1 ring-rose-200/70 dark:bg-rose-900/40 dark:ring-rose-800/50';
  }
};

export const animalStatusLabel = (status: AnimalStatus): string => {
  switch (status) {
    case 'alive':
      return 'Alive';
    case 'sold':
      return 'Sold';
    case 'dead':
      return 'Dead';
    case 'culled':
      return 'Culled';
    case 'missing':
      return 'Missing';
  }
};

export const animalStatusClass = (status: AnimalStatus): string => {
  switch (status) {
    case 'alive':
      return 'bg-success/20 text-success-foreground';
    case 'sold':
      return 'bg-info/30 text-info-foreground';
    case 'dead':
      return 'bg-destructive/10 text-destructive';
    case 'culled':
      return 'bg-destructive/10 text-destructive';
    case 'missing':
      return 'bg-warning/40 text-warning-foreground';
  }
};

export const isSpecies = (value: string | undefined | null): value is Species =>
  value === 'goat' || value === 'sheep' || value === 'pig';
