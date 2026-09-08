import { TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { animalLabel } from '../../core/models/animal';
import { KraalRow } from '../../core/models/kraal';
import {
  AnimalSex,
  animalSexLabel,
  speciesAccentClass,
  speciesAvatarClass,
  speciesBadgeClass,
  speciesVocabulary,
  speciesIconClass,
  Species,
} from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'app-kraal-detail',
  imports: [FormField, FormRoot, RouterLink, TitleCasePipe, ...SpartanUiImports],
  templateUrl: './kraal-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KraalDetailComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly kraalStore = inject(KraalStore);
  private readonly animalStore = inject(AnimalStore);

  protected readonly vocabulary = speciesVocabulary;
  protected readonly accentClass = speciesAccentClass;
  protected readonly badgeClass = speciesBadgeClass;
  protected readonly iconClass = speciesIconClass;
  protected readonly avatarClass = speciesAvatarClass;

  private readonly kraalId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    {
      initialValue: this.route.snapshot.paramMap.get('id') ?? '',
    },
  );

  protected readonly kraal = this.kraalStore.kraal;

  protected readonly animals = computed(() =>
    this.animalStore
      .animals()
      .filter((animal) => animal.kraalId === this.kraalId() && animal.status === 'alive')
      .sort((left, right) => left.tag.localeCompare(right.tag)),
  );

  protected readonly editing = signal(false);
  protected readonly kraalModel = signal<Pick<KraalRow, 'name' | 'notes'>>({
    name: '',
    notes: '',
  });
  protected readonly kraalForm = form(
    this.kraalModel,
    (schemaPath) => {
      required(schemaPath.name, { message: 'Give this place a name.' });
    },
    {
      submission: {
        action: async (field) => {
          const kraal = this.kraal();
          if (!kraal) {
            return;
          }
          const { name, notes } = field().value();
          await this.kraalStore.update({
            $id: kraal.$id,
            name: name.trim(),
            notes: notes.trim(),
            species: kraal.species,
          });
          if (!this.kraalStore.error()) {
            this.editing.set(false);
          }
          return undefined;
        },
      },
    },
  );

  protected label = animalLabel;

  constructor() {
    effect(() => {
      const id = this.kraalId();
      untracked(() => {
        void this.kraalStore.getById(id);
      });
    });
  }

  protected sexLabel(species: Species, sex: AnimalSex): string {
    return animalSexLabel(species, sex);
  }

  protected startEdit(): void {
    const kraal = this.kraal();
    if (!kraal) {
      return;
    }
    this.kraalStore.clearError();
    this.kraalForm().reset({
      name: kraal.name,
      notes: kraal.notes,
    });
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }
}
