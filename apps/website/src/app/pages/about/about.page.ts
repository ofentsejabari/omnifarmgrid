import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_LOCATION, SPECIES } from '../../core/content/site';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, ...SpartanUiImports],
  templateUrl: './about.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  protected readonly location = SITE_LOCATION;
  protected readonly species = SPECIES;
}
