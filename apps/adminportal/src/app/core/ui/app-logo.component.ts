import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let nextId = 0;

/**
 * OmniFarmGrid mark: a map pin with a sprout growing in its window.
 * Same artwork as libs/img/brand/omnifarmgrid/svg/omnifarmgrid-icon.svg.
 */
@Component({
  selector: 'app-logo',
  host: { class: 'inline-flex shrink-0' },
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="12 4 96 116"
      role="img"
      aria-label="OmniFarmGrid"
    >
      <defs>
        <mask
          [attr.id]="maskId"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="120"
          height="120"
        >
          <rect width="120" height="120" fill="#fff" />
          <circle cx="60" cy="48" r="28" fill="#000" />
        </mask>
      </defs>
      <path
        d="M60 116 C60 116 20 76 20 48 A40 40 0 1 1 100 48 C100 76 60 116 60 116 Z"
        [attr.class]="
          inverse() ? 'fill-white' : 'fill-[#064E3B] dark:fill-white'
        "
        [attr.mask]="'url(#' + maskId + ')'"
      />
      <path
        d="M60 69 L60 49"
        [attr.class]="
          inverse()
            ? 'stroke-[#6EE7B7]'
            : 'stroke-[#059669] dark:stroke-[#6EE7B7]'
        "
        stroke-width="5"
        stroke-linecap="round"
      />
      <path
        d="M59 57 C47 58 38 51 37 39 C50 38 58 45 59 57 Z"
        [attr.class]="
          inverse() ? 'fill-[#6EE7B7]' : 'fill-[#059669] dark:fill-[#6EE7B7]'
        "
      />
      <path
        d="M61 51 C62 37 72 29 85 29 C85 43 75 51 61 51 Z"
        [attr.class]="
          inverse() ? 'fill-[#6EE7B7]' : 'fill-[#059669] dark:fill-[#6EE7B7]'
        "
      />
      <path
        d="M46 69 Q60 64 74 69"
        stroke="#F59E0B"
        stroke-width="5"
        stroke-linecap="round"
        fill="none"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLogoComponent {
  readonly size = input(36);
  /** Always use the white pin (on coloured backgrounds). Dark theme switches automatically. */
  readonly inverse = input(false);
  protected readonly maskId = `ofg-logo-win-${nextId++}`;
}
