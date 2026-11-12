import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SPECIES } from '../../core/content/site';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'app-livestock-page',
  imports: [RouterLink, ...SpartanUiImports],
  templateUrl: './livestock.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LivestockPage {
  protected readonly species = SPECIES;
}
