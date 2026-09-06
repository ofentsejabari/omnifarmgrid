export const SITE_NAME = 'AgroHerd';
export const SITE_CONTACT_EMAIL = 'hello@agroherd.co.bw';
export const SITE_LOCATION = 'Botswana';

export const NAV_LINKS = [
  { path: '/', label: 'Home', exact: true },
  { path: '/livestock', label: 'Livestock', exact: false },
  { path: '/features', label: 'Features', exact: false },
  { path: '/about', label: 'About', exact: false },
  { path: '/contact', label: 'Contact', exact: false },
] as const;

export type SpeciesId = 'goat' | 'sheep' | 'pig';

export type SpeciesIcon = 'speciesGoat' | 'speciesSheep' | 'speciesPig';

export interface SpeciesContent {
  id: SpeciesId;
  fragment: string;
  name: string;
  plural: string;
  icon: SpeciesIcon;
  headline: string;
  summary: string;
  young: string;
  youngPlural: string;
  dam: string;
  sire: string;
  location: string;
  locationPlural: string;
  birth: string;
  accentClass: string;
  avatarClass: string;
  iconClass: string;
  breeds: readonly string[];
  records: readonly string[];
}

export const SPECIES: readonly SpeciesContent[] = [
  {
    id: 'goat',
    fragment: 'goats',
    name: 'Goat',
    plural: 'goats',
    icon: 'speciesGoat',
    headline: 'Goats — Tswana flocks, Boer meat, and every kid in between',
    summary:
      'Keep ear tags, dams, and kraals straight so kidding, treatments, and sales are never a guess.',
    young: 'kid',
    youngPlural: 'kids',
    dam: 'doe',
    sire: 'buck',
    location: 'kraal',
    locationPlural: 'kraals',
    birth: 'kidding',
    accentClass: 'border-l-[3px] border-l-emerald-500',
    avatarClass: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80',
    iconClass: 'text-emerald-700',
    breeds: ['Tswana', 'Boer', 'Kalahari Red', 'Savannah', 'Saanen', 'Toggenburg', 'Alpine', 'Cross'],
    records: [
      'Does, bucks, and wethers with ear tags and optional names',
      'Kidding linked to the dam and the kraal the kids go into',
      'Treat a whole kraal, then uncheck the few you skip',
    ],
  },
  {
    id: 'sheep',
    fragment: 'sheep',
    name: 'Sheep',
    plural: 'sheep',
    icon: 'speciesSheep',
    headline: 'Sheep — Dorper, Damara, and the ewes that carry the flock',
    summary:
      'Lambing, kraals, and treatments in one place, with the language farmers actually use.',
    young: 'lamb',
    youngPlural: 'lambs',
    dam: 'ewe',
    sire: 'ram',
    location: 'kraal',
    locationPlural: 'kraals',
    birth: 'lambing',
    accentClass: 'border-l-[3px] border-l-amber-500',
    avatarClass: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200/80',
    iconClass: 'text-amber-700',
    breeds: ['Dorper', 'Damara', 'Meatmaster', 'Merino', 'Blackhead Persian', 'Cross'],
    records: [
      'Ewes, rams, and wethers with breed and date of birth',
      'Lambing recorded against the ewe and the kraal',
      'Dewormers and dips tracked against the flock, not a notebook',
    ],
  },
  {
    id: 'pig',
    fragment: 'pigs',
    name: 'Pig',
    plural: 'pigs',
    icon: 'speciesPig',
    headline: 'Pigs — sows, boars, and piglets in pens that stay organised',
    summary:
      'Farrowing, pen moves, and vaccine stock for pig keepers who cannot afford lost records.',
    young: 'piglet',
    youngPlural: 'piglets',
    dam: 'sow',
    sire: 'boar',
    location: 'pen',
    locationPlural: 'pens',
    birth: 'farrowing',
    accentClass: 'border-l-[3px] border-l-rose-400',
    avatarClass: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200/80',
    iconClass: 'text-rose-600',
    breeds: ['Large White', 'Landrace', 'Duroc', 'Kolbroek', 'Pietrain', 'Cross'],
    records: [
      'Sows, boars, and barrows with pen location',
      'Farrowing recorded with the sow and each piglet',
      'Vaccinate a pen, then note exceptions on the same screen',
    ],
  },
];

export type FeatureIcon =
  | 'lucidePawPrint'
  | 'lucideFence'
  | 'lucideBaby'
  | 'lucideSyringe'
  | 'lucidePackage'
  | 'lucideWifiOff'
  | 'lucideClipboardList'
  | 'lucideDownload';

export interface FeatureContent {
  icon: FeatureIcon;
  title: string;
  body: string;
}

export const FEATURES: readonly FeatureContent[] = [
  {
    icon: 'lucidePawPrint',
    title: 'Animal records',
    body: 'Ear tags, sex, breed, parents, and notes for every goat, sheep, and pig on the farm.',
  },
  {
    icon: 'lucideFence',
    title: 'Kraals and pens',
    body: 'Group animals by place. Goats and sheep live in kraals; pigs live in pens.',
  },
  {
    icon: 'lucideBaby',
    title: 'Births that match the species',
    body: 'Kidding, lambing, and farrowing — record the dam and each young animal in one step.',
  },
  {
    icon: 'lucideSyringe',
    title: 'Treat a whole kraal',
    body: 'Vaccinate or deworm a kraal or pen, then uncheck the animals you skip.',
  },
  {
    icon: 'lucidePackage',
    title: 'Medicine stock',
    body: 'Vaccines, dewormers, and dips with batches, expiry dates, and low-stock warnings.',
  },
  {
    icon: 'lucideWifiOff',
    title: 'Works without signal',
    body: 'Keep recording on the farm. Records sync when you are back online.',
  },
  {
    icon: 'lucideClipboardList',
    title: 'Deaths and sales',
    body: 'Close the loop when an animal dies, is culled, sold, or goes missing.',
  },
  {
    icon: 'lucideDownload',
    title: 'Backup you control',
    body: 'Export a JSON backup of the herd and restore it when you need a copy.',
  },
];

export const STEPS = [
  {
    step: '1',
    title: 'Add kraals and pens',
    body: 'Start with the places animals live, one species at a time.',
  },
  {
    step: '2',
    title: 'Record the flock',
    body: 'Ear tags, dams, and sires. Names are optional; tags are not.',
  },
  {
    step: '3',
    title: 'Log what happens',
    body: 'Births, treatments, stock, and losses — the same day they happen.',
  },
] as const;

export const FAQS = [
  {
    q: 'Which animals does AgroHerd cover?',
    a: 'Goats, sheep, and pigs. The app uses the right words for each: kids and kraals for goats, lambs for sheep, piglets and pens for pigs.',
  },
  {
    q: 'Is this built for Botswana farms?',
    a: 'Yes. Breed lists include Tswana and Boer goats, Dorper and Damara sheep, and Large White and Kolbroek pigs. The workflow is kraals, pens, and ear tags — not imported dairy software.',
  },
  {
    q: 'Does it work without internet?',
    a: 'You can keep records on the device when there is no signal. When you are online, records sync through Appwrite.',
  },
  {
    q: 'Can I keep more than one species?',
    a: 'Yes. Filter the home screen by goat, sheep, pig, or all three. Each kraal or pen belongs to one species.',
  },
  {
    q: 'How do I get access?',
    a: 'Tell us about your farm on the contact page. We will set you up with Farm Manager and walk through the first kraal together.',
  },
] as const;

export type ContactInterest = 'goats' | 'sheep' | 'pigs' | 'mixed';

export const CONTACT_INTERESTS: readonly { value: ContactInterest; label: string }[] = [
  { value: 'goats', label: 'Goats' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'pigs', label: 'Pigs' },
  { value: 'mixed', label: 'Goats, sheep and pigs' },
];
