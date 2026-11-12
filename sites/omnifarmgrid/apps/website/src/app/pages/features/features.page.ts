import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FEATURES } from '../../core/content/site';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'app-features-page',
  imports: [RouterLink, ...SpartanUiImports],
  templateUrl: './features.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesPage {
  protected readonly features = FEATURES;

  protected readonly extras = [
    {
      icon: 'lucideHeartPulse' as const,
      title: 'Health without a separate app',
      body: 'Treatments sit next to the animal and the kraal. You see who was done and who was skipped.',
    },
    {
      icon: 'lucideNotebookPen' as const,
      title: 'Notes that stay with the animal',
      body: 'A lame doe, a sow that farrows hot, a ram you might sell — write it once, find it later.',
    },
    {
      icon: 'lucideShield' as const,
      title: 'Your copy of the herd',
      body: 'Export a backup whenever you like. Restore it if a device is lost or replaced.',
    },
  ];
}
