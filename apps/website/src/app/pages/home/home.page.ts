import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FAQS, FEATURES, SPECIES, STEPS } from '../../core/content/site';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ...SpartanUiImports],
  templateUrl: './home.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly species = SPECIES;
  protected readonly features = FEATURES;
  protected readonly steps = STEPS;
  protected readonly faqs = FAQS;
}
