import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { animalLabel } from '../../core/models/animal';
import {
  AnimalSex,
  animalSexLabel,
  speciesAvatarClass,
  speciesVocabulary,
  speciesIconClass,
  Species,
} from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'app-kraal-detail',
  imports: [FormsModule, RouterLink, ...SpartanUiImports],
  templateUrl: './kraal-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KraalDetailComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly kraalStore = inject(KraalStore);
  private readonly animalStore = inject(AnimalStore);

  private readonly kraalId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    {
      initialValue: this.route.snapshot.paramMap.get('id') ?? '',
    },
  );

  protected readonly kraal = computed(() =>
    this.kraalStore.kraals().find((item) => item.$id === this.kraalId()),
  );

  protected readonly animals = computed(() =>
    this.animalStore
      .animals()
      .filter((animal) => animal.kraalId === this.kraalId() && animal.status === 'alive')
      .sort((left, right) => left.tag.localeCompare(right.tag)),
  );

  protected readonly editing = signal(false);
  protected readonly name = signal('');
  protected readonly notes = signal('');
  protected readonly vocabulary = speciesVocabulary;
  protected readonly iconClass = speciesIconClass;
  protected readonly avatarClass = speciesAvatarClass;

  protected label = animalLabel;

  protected sexLabel(species: Species, sex: AnimalSex): string {
    return animalSexLabel(species, sex);
  }

  protected startEdit(): void {
    const kraal = this.kraal();
    if (!kraal) {
      return;
    }
    this.name.set(kraal.name);
    this.notes.set(kraal.notes);
    this.editing.set(true);
  }

  protected async saveEdit(): Promise<void> {
    const kraal = this.kraal();
    if (!kraal || !this.name().trim()) {
      return;
    }
    await this.kraalStore.update({
      $id: kraal.$id,
      name: this.name().trim(),
      notes: this.notes().trim(),
      species: kraal.species,
    });
    this.editing.set(false);
  }
}
