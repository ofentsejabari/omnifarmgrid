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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  ANIMAL_SEXES,
  AnimalSex,
  BREEDS,
  SPECIES,
  animalSexLabel,
  isSpecies,
  speciesLabel,
  speciesVocabulary,
} from '../../core/models/species';
import { DuplicateTagError } from '../../core/utils/errors';
import { AnimalDraft, AnimalStore } from '../../core/stores/animal.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'fma-animal-form',
  imports: [FormField, FormRoot, RouterLink, ...SpartanUiImports],
  templateUrl: './animal-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalFormComponent {
  protected readonly animalStore = inject(AnimalStore);
  protected readonly kraalStore = inject(KraalStore);
  private readonly speciesFilterStore = inject(SpeciesFilterStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly speciesOptions = SPECIES;
  protected readonly sexes = ANIMAL_SEXES;
  protected readonly vocabulary = speciesVocabulary;
  protected readonly speciesName = speciesLabel;
  protected readonly error = signal('');
  protected readonly loaded = signal(false);
  private readonly animalId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    {
      initialValue: this.route.snapshot.paramMap.get('id') ?? '',
    },
  );
  protected readonly isEdit = computed(() => Boolean(this.animalId()));
  protected readonly animalModel = signal<AnimalDraft>(this.initialDraft());
  protected readonly animalForm = form(
    this.animalModel,
    (schemaPath) => {
      required(schemaPath.tag, { message: 'Ear tag is required.' });
      required(schemaPath.kraalId, { message: 'Place is required.' });
    },
    {
      submission: {
        action: async (field) => {
          this.error.set('');
          const draft = field().value();
          try {
            const id = this.animalId();
            if (id) {
              await this.animalStore.update(id, draft);
              await this.router.navigate(['/flock', id]);
              return;
            }
            const created = await this.animalStore.create(draft);
            await this.router.navigate(['/flock', created.$id]);
          } catch (error: unknown) {
            this.error.set(
              error instanceof DuplicateTagError
                ? error.message
                : `Could not save ${speciesVocabulary(draft.species).noun}.`,
            );
          }
          return undefined;
        },
      },
    },
  );
  protected readonly currentSpecies = computed(() => this.animalModel().species);
  protected readonly breeds = computed(() => BREEDS[this.currentSpecies()]);
  protected readonly matchingKraals = computed(() =>
    this.kraalStore.kraals().filter((kraal) => kraal.species === this.currentSpecies()),
  );

  constructor() {
    effect(() => {
      const species = this.animalModel().species;
      const kraalId = this.animalModel().kraalId;
      untracked(() => {
        const kraal = this.kraalStore.kraals().find((item) => item.$id === kraalId);
        if (kraal && kraal.species !== species) {
          this.animalForm.kraalId().value.set('');
        }
      });
    });
    void this.hydrate();
  }

  protected sexLabel(sex: AnimalSex): string {
    return animalSexLabel(this.currentSpecies(), sex);
  }

  private initialDraft(): AnimalDraft {
    const querySpecies = this.route.snapshot.queryParamMap.get('species');
    const kraalFromQuery = this.route.snapshot.queryParamMap.get('kraalId');
    const kraal = kraalFromQuery
      ? this.kraalStore.kraals().find((item) => item.$id === kraalFromQuery)
      : undefined;
    const species = kraal
      ? kraal.species
      : isSpecies(querySpecies)
        ? querySpecies
        : this.speciesFilterStore.preferredSpecies();
    return {
      species,
      tag: '',
      name: '',
      sex: 'female',
      breed: '',
      dateOfBirth: '',
      birthDateEstimated: false,
      damId: '',
      sireId: '',
      kraalId: kraalFromQuery ?? '',
      notes: '',
    };
  }

  private async hydrate(): Promise<void> {
    const id = this.animalId();
    if (!id) {
      this.loaded.set(true);
      return;
    }
    const animal = await this.animalStore.getById(id);
    if (animal) {
      this.animalForm().reset({
        species: animal.species,
        tag: animal.tag,
        name: animal.name,
        sex: animal.sex,
        breed: animal.breed,
        dateOfBirth: animal.dateOfBirth,
        birthDateEstimated: animal.birthDateEstimated,
        damId: animal.damId,
        sireId: animal.sireId,
        kraalId: animal.kraalId,
        notes: animal.notes,
      });
    }
    this.loaded.set(true);
  }
}
