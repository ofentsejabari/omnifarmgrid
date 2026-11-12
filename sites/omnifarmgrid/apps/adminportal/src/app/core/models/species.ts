export const SPECIES = ['goat', 'sheep', 'pig', 'cow'] as const;
export type Species = (typeof SPECIES)[number];

export const ANIMAL_SEXES = ['female', 'male', 'wether'] as const;
export type AnimalSex = (typeof ANIMAL_SEXES)[number];

export const ANIMAL_STATUSES = [
  'alive',
  'sold',
  'dead',
  'culled',
  'missing',
] as const;
export type AnimalStatus = (typeof ANIMAL_STATUSES)[number];

export interface SpeciesVocabulary {
  id: Species;
  noun: string;
  plural: string;
  icon: 'speciesGoat' | 'speciesSheep' | 'speciesPig' | 'speciesCow';
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
  cow: {
    id: 'cow',
    noun: 'cow',
    plural: 'cattle',
    icon: 'speciesCow',
    young: 'calf',
    youngPlural: 'calves',
    dam: 'cow',
    sire: 'bull',
    location: 'kraal',
    locationPlural: 'kraals',
    birth: 'calving',
    birthVerb: 'Record calving',
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
    case 'cow':
      return 'Cow';
  }
};

export const animalSexLabel = (species: Species, sex: AnimalSex): string => {
  if (sex === 'female') {
    switch (species) {
      case 'goat':
        return 'Doe';
      case 'sheep':
        return 'Ewe';
      case 'pig':
        return 'Sow';
      case 'cow':
        return 'Cow';
    }
  }
  if (sex === 'male') {
    switch (species) {
      case 'goat':
        return 'Buck';
      case 'sheep':
        return 'Ram';
      case 'pig':
        return 'Boar';
      case 'cow':
        return 'Bull';
    }
  }
  switch (species) {
    case 'pig':
      return 'Barrow';
    case 'cow':
      return 'Steer';
    default:
      return 'Wether';
  }
};

export const BREEDS: Record<Species, readonly string[]> = {
  goat: [
    'Tswana',
    'Boer',
    'Kalahari Red',
    'Savannah',
    'Saanen',
    'Toggenburg',
    'Alpine',
    'Cross',
  ],
  sheep: [
    'Dorper',
    'Damara',
    'Meatmaster',
    'Merino',
    'Blackhead Persian',
    'Cross',
  ],
  pig: ['Large White', 'Landrace', 'Duroc', 'Kolbroek', 'Pietrain', 'Cross'],
  cow: [
    'Tswana',
    'Brahman',
    'Bonsmara',
    'Simmental',
    'Afrikaner',
    'Nguni',
    'Angus',
    'Cross',
  ],
};

/** Tinted tile behind a species icon. Hues match the dashboard chart colours. */
export const speciesAvatarClass = (species: Species): string => {
  switch (species) {
    case 'goat':
      return 'bg-emerald-50 text-emerald-700';
    case 'sheep':
      return 'bg-amber-50 text-amber-700';
    case 'pig':
      return 'bg-pink-50 text-pink-700';
    case 'cow':
      return 'bg-blue-50 text-blue-700';
  }
};

/** Series colour for charts (CSS custom properties defined in theme.css). */
export const speciesChartColor = (species: Species): string =>
  `var(--chart-${species})`;

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
      return 'bg-success text-success-foreground';
    case 'sold':
      return 'bg-info text-info-foreground';
    case 'dead':
    case 'culled':
      return 'bg-destructive/10 text-destructive';
    case 'missing':
      return 'bg-warning text-warning-foreground';
  }
};

export const isSpecies = (value: string | undefined | null): value is Species =>
  value === 'goat' || value === 'sheep' || value === 'pig' || value === 'cow';
