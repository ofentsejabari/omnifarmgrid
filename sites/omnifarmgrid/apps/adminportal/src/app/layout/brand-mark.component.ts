import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppLogoComponent } from '../core/ui/app-logo.component';

/** Logo + wordmark. `stack` centres it above the tagline (sign-in page on phones). */
@Component({
  selector: 'app-brand-mark',
  imports: [AppLogoComponent],
  templateUrl: './brand-mark.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandMarkComponent {
  readonly layout = input<'row' | 'stack'>('row');
  readonly tone = input<'default' | 'inverse'>('default');
  readonly tagline = input('Farm records for goats, sheep, pigs and cattle');
}
