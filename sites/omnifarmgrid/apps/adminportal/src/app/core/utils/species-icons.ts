/**
 * Livestock icons for ng-icons: friendly two-tone heads on a 24×24 grid.
 * Outlines and eyes use `currentColor`; faces are a light tint of it, so the icon follows the
 * text colour it sits in (see speciesAvatarClass). Stroke width follows ng-icon's `strokeWidth`.
 */
const svg = (body: string): string =>
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="var(--ng-icon__stroke-width, 1.6)" stroke-linecap="round" stroke-linejoin="round">' +
  body +
  '</svg>';

/** Goat: swept-back horns, long face, little beard. */
export const speciesGoat = svg(
  '<path d="M8.6 6.6C7.4 4 5.6 2.8 3.5 3c1.6 1 2.4 2.6 2.8 4.6" />' +
    '<path d="M15.4 6.6C16.6 4 18.4 2.8 20.5 3c-1.6 1-2.4 2.6-2.8 4.6"/>' +
    '<path fill="currentColor" fill-opacity=".18" d="M7.9 9.6 3.6 9.2c.4 2 2.2 3.1 4.6 2.6Z"/>' +
    '<path fill="currentColor" fill-opacity=".18" d="M16.1 9.6l4.3-.4c-.4 2-2.2 3.1-4.6 2.6Z"/>' +
    '<path fill="currentColor" fill-opacity=".18" d="M8 7.5c1-.6 2.4-.9 4-.9s3 .3 4 .9c.7 2.2.6 4.6-.2 6.8L14.3 18c-.6 1.1-1.3 1.6-2.3 1.6s-1.7-.5-2.3-1.6l-1.5-3.7C7.4 12.1 7.3 9.7 8 7.5Z"/>' +
    '<path d="M11 19.4c-.2 1.2.2 2.1 1 2.1s1.2-.9 1-2.1"/>' +
    '<path d="M10.6 16.6c.9.5 1.9.5 2.8 0"/>' +
    '<circle fill="currentColor" fill-opacity=".35" stroke="none" cx="9.3" cy="13.6" r=".85"/>' +
    '<circle fill="currentColor" fill-opacity=".35" stroke="none" cx="14.7" cy="13.6" r=".85"/>' +
    '<circle fill="currentColor" stroke="none" cx="10" cy="11.2" r=".9"/>' +
    '<circle fill="currentColor" stroke="none" cx="14" cy="11.2" r=".9"/>',
);

/** Sheep: woolly crown, floppy ears, narrow face. */
export const speciesSheep = svg(
  '<path fill="currentColor" fill-opacity=".18" d="M7 9.3c-1.6-.4-2.4-1.8-1.9-3.2.4-1.2 1.6-1.8 2.8-1.6.4-1.4 1.6-2.2 2.9-2.2.5 0 .9.1 1.2.3.3-.2.7-.3 1.2-.3 1.3 0 2.5.8 2.9 2.2 1.2-.2 2.4.4 2.8 1.6.5 1.4-.3 2.8-1.9 3.2"/>' +
    '<path fill="currentColor" fill-opacity=".18" d="M7.4 9.6 3.4 10.4c.3 1.6 1.9 2.5 3.9 2.1Z"/>' +
    '<path fill="currentColor" fill-opacity=".18" d="M16.6 9.6l4 .8c-.3 1.6-1.9 2.5-3.9 2.1Z"/>' +
    '<path fill="currentColor" fill-opacity=".18" d="M7.6 9.2c-.4 4 .6 7.8 2.6 10.2.5.6 1.1.9 1.8.9s1.3-.3 1.8-.9c2-2.4 3-6.2 2.6-10.2-1.2-.6-2.7-.9-4.4-.9s-3.2.3-4.4.9Z"/>' +
    '<circle fill="currentColor" stroke="none" cx="10.3" cy="12.6" r=".9"/>' +
    '<circle fill="currentColor" stroke="none" cx="13.7" cy="12.6" r=".9"/>' +
    '<path d="M11 17.3c.6.4 1.4.4 2 0"/>' +
    '<circle fill="currentColor" fill-opacity=".35" stroke="none" cx="9.4" cy="14.6" r=".9"/>' +
    '<circle fill="currentColor" fill-opacity=".35" stroke="none" cx="14.6" cy="14.6" r=".9"/>',
);

/** Pig: round face, pricked ears, big snout. */
export const speciesPig = svg(
  '<path fill="currentColor" fill-opacity=".18" d="M7.2 7.1 4.6 3.7l-.6 5.1"/>' +
    '<path fill="currentColor" fill-opacity=".18" d="M16.8 7.1l2.6-3.4.6 5.1"/>' +
    '<circle fill="currentColor" fill-opacity=".18" cx="12" cy="12.8" r="7.4"/>' +
    '<ellipse fill="#fff" fill-opacity=".9" cx="12" cy="15.2" rx="3.3" ry="2.3"/>' +
    '<circle fill="currentColor" stroke="none" cx="10.8" cy="15.2" r=".65"/>' +
    '<circle fill="currentColor" stroke="none" cx="13.2" cy="15.2" r=".65"/>' +
    '<circle fill="currentColor" stroke="none" cx="9.2" cy="11" r=".9"/>' +
    '<circle fill="currentColor" stroke="none" cx="14.8" cy="11" r=".9"/>' +
    '<circle fill="currentColor" fill-opacity=".35" stroke="none" cx="7.6" cy="13.6" r="1.1"/>' +
    '<circle fill="currentColor" fill-opacity=".35" stroke="none" cx="16.4" cy="13.6" r="1.1"/>',
);

/** Cattle: curved horns, broad face, patch, muzzle. */
export const speciesCow = svg(
  '<path d="M7.6 7.4C5.4 7.6 3.8 6.1 3.6 3.6"/>' +
    '<path d="M16.4 7.4c2.2.2 3.8-1.3 4-3.8"/>' +
    '<path fill="currentColor" fill-opacity=".18" d="M7.4 9.2 3.4 10c.4 1.8 2 2.6 4.1 2.2Z"/>' +
    '<path fill="currentColor" fill-opacity=".18" d="M16.6 9.2l4 .8c-.4 1.8-2 2.6-4.1 2.2Z"/>' +
    '<path fill="currentColor" fill-opacity=".18" d="M7.6 7.2h8.8c.8 2.6.7 5.4-.2 7.9H7.8c-.9-2.5-1-5.3-.2-7.9Z"/>' +
    '<path fill="currentColor" fill-opacity=".45" stroke="none" d="M12.6 7.2h3.8c.4 1.4.6 2.8.5 4.2-1.4.3-2.9-.2-3.7-1.4-.4-.8-.6-1.8-.6-2.8Z"/>' +
    '<rect fill="#fff" fill-opacity=".9" x="7.1" y="14.6" width="9.8" height="6.4" rx="3.2"/>' +
    '<circle fill="currentColor" stroke="none" cx="10.3" cy="17.8" r=".7"/>' +
    '<circle fill="currentColor" stroke="none" cx="13.7" cy="17.8" r=".7"/>' +
    '<circle fill="currentColor" stroke="none" cx="9.9" cy="11.3" r=".9"/>' +
    '<circle fill="currentColor" stroke="none" cx="14.1" cy="11.3" r=".9"/>',
);
