import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-brand-mark',
  imports: [NgIcon],
  templateUrl: './brand-mark.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandMarkComponent {
  readonly variant = input<'default' | 'onPrimary'>('default');
  readonly layout = input<'row' | 'stack'>('row');
  readonly tagline = input('Farm records · goats, sheep, pigs, cattle');

  protected readonly wrapClass = computed(() =>
    this.layout() === 'stack'
      ? 'flex flex-col items-center gap-3 text-center'
      : 'flex min-w-0 items-center gap-3',
  );

  protected readonly iconWrapClass = computed(() => {
    const size = this.layout() === 'stack' ? 'size-14 rounded-2xl' : 'size-11 rounded-xl';
    const tone =
      this.variant() === 'onPrimary'
        ? 'bg-white/15 text-primary-foreground ring-white/25 shadow-lg'
        : 'bg-primary/10 text-primary ring-primary/25 shadow-sm';
    return `flex shrink-0 items-center justify-center ring-1 ${size} ${tone}`;
  });

  protected readonly iconSize = computed(() => (this.layout() === 'stack' ? '32' : '28'));

  protected readonly omniClass = computed(() =>
    this.variant() === 'onPrimary' ? 'font-bold text-lime-200' : 'font-bold text-primary',
  );

  protected readonly herdClass = computed(() =>
    this.variant() === 'onPrimary' ? 'font-semibold text-amber-200' : 'font-semibold text-amber-700',
  );

  protected readonly gridClass = computed(() => {
    const tone =
      this.variant() === 'onPrimary' ? 'text-primary-foreground/75' : 'text-muted-foreground';
    return `${tone} ms-0.5 align-super text-[0.55em] font-semibold tracking-wide`;
  });

  protected readonly taglineClass = computed(() =>
    this.variant() === 'onPrimary'
      ? 'text-sm text-primary-foreground/75'
      : 'text-muted-foreground truncate text-xs leading-tight',
  );

  protected readonly titleSizeClass = computed(() =>
    this.layout() === 'stack' ? 'text-lg' : 'text-base',
  );
}
