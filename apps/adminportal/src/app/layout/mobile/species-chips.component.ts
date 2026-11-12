import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { SPECIES, speciesVocabulary } from '../../core/models/species';
import {
  SpeciesFilter,
  SpeciesFilterStore,
} from '../../core/stores/species-filter.store';

const capitalise = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** Swipeable species filter for phones (replaces the dropdown). */
@Component({
  selector: 'app-species-chips',
  imports: [NgIcon],
  template: `
    <div
      class="flex snap-x gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="radiogroup"
      aria-label="Show species"
    >
      @for (chip of chips; track chip.value) {
        <button
          type="button"
          role="radio"
          class="inline-flex h-9 shrink-0 touch-manipulation snap-start items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors"
          [class]="
            filter.selected() === chip.value
              ? 'bg-primary-strong text-primary-strong-foreground border-primary-strong'
              : 'bg-card active:bg-muted'
          "
          [attr.aria-checked]="filter.selected() === chip.value"
          (click)="filter.set(chip.value)"
        >
          @if (chip.icon) {
            <ng-icon [name]="chip.icon" size="18" />
          }
          {{ chip.label }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesChipsComponent {
  protected readonly filter = inject(SpeciesFilterStore);
  protected readonly chips: {
    value: SpeciesFilter;
    label: string;
    icon?: string;
  }[] = [
    { value: 'all', label: 'All' },
    ...SPECIES.map((species) => ({
      value: species,
      label:
        species === 'cow'
          ? 'Cattle'
          : capitalise(speciesVocabulary(species).plural),
      icon: speciesVocabulary(species).icon,
    })),
  ];
}
