import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import {
  Species,
  speciesAvatarClass,
  speciesVocabulary,
} from '../models/species';

/** Rounded tile with the species icon, used in every list and header. */
@Component({
  selector: 'app-species-avatar',
  imports: [NgIcon],
  host: { class: 'contents' },
  template: `
    <span [class]="classes()" aria-hidden="true">
      <ng-icon [name]="icon()" [size]="iconSize()" />
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesAvatarComponent {
  readonly species = input.required<Species>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly icon = computed(
    () => speciesVocabulary(this.species()).icon,
  );
  protected readonly iconSize = computed(
    () => ({ sm: '20', md: '24', lg: '34' })[this.size()],
  );
  protected readonly classes = computed(() => {
    const box = {
      sm: 'size-8 rounded-lg',
      md: 'size-10 rounded-xl',
      lg: 'size-14 rounded-2xl',
    }[this.size()];
    return `flex shrink-0 items-center justify-center ${box} ${speciesAvatarClass(this.species())}`;
  });
}
