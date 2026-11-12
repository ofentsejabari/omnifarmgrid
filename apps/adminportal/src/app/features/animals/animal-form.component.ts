import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { AnimalCreatePayload } from '../../core/models/animal';
import {
  ANIMAL_SEXES,
  animalSexLabel,
  BREEDS,
  isSpecies,
  SPECIES,
  speciesLabel,
  speciesVocabulary,
} from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { ModalService } from '../../core/ui/modal.service';
import { SpeciesAvatarComponent } from '../../core/ui/species-avatar.component';
import { ToastService } from '../../core/ui/toast.service';
import { DuplicateTagError } from '../../core/utils/errors';
import { DateFieldComponent } from '../../core/ui/date-field.component';
import { SelectFieldComponent } from '../../core/ui/select-field.component';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

/** Popup: add or edit an animal. Params: `id` (edit), `kraalId`, `species`. */
@Component({
  selector: 'fma-animal-form',
  imports: [
    FormField,
    FormRoot,
    SpeciesAvatarComponent,
    SelectFieldComponent,
    DateFieldComponent,
    ...SpartanUiImports,
  ],
  templateUrl: './animal-form.component.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalFormComponent {
  private readonly animalStore = inject(AnimalStore);
  private readonly kraalStore = inject(KraalStore);
  private readonly speciesFilter = inject(SpeciesFilterStore);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);

  private readonly params = inject(ActivatedRoute).snapshot.paramMap;
  private readonly animalId = this.params.get('id') ?? '';
  protected readonly isEdit = Boolean(this.animalId);

  protected readonly speciesOptions = SPECIES;
  protected readonly speciesName = speciesLabel;
  protected readonly error = signal('');
  protected readonly loaded = signal(false);

  protected readonly animalModel = signal<AnimalCreatePayload>(
    this.blankDraft(),
  );
  protected readonly animalForm = form(
    this.animalModel,
    (path) => {
      required(path.tag);
      required(path.kraalId);
    },
    { submission: { action: async (field) => this.save(field().value()) } },
  );

  protected readonly currentSpecies = computed(
    () => this.animalModel().species,
  );
  protected readonly words = computed(() =>
    speciesVocabulary(this.currentSpecies()),
  );
  protected readonly breeds = computed(() => BREEDS[this.currentSpecies()]);
  protected readonly kraalOptions = computed(() =>
    this.kraalStore
      .kraals()
      .filter((kraal) => kraal.species === this.currentSpecies())
      .map((kraal) => ({ value: kraal.$id, label: kraal.name })),
  );
  protected readonly sexOptions = computed(() =>
    ANIMAL_SEXES.map((sex) => ({
      value: sex,
      label: animalSexLabel(this.currentSpecies(), sex),
    })),
  );

  constructor() {
    // Changing species clears a kraal that belongs to another species.
    effect(() => {
      const { species, kraalId } = this.animalModel();
      untracked(() => {
        const kraal = this.kraalStore
          .kraals()
          .find((item) => item.$id === kraalId);
        if (kraal && kraal.species !== species) {
          this.animalForm.kraalId().value.set('');
        }
      });
    });
    void this.load();
  }

  private async save(draft: AnimalCreatePayload): Promise<undefined> {
    this.error.set('');
    try {
      if (this.isEdit) {
        await this.animalStore.update(this.animalId, draft);
        this.toast.show('Changes saved');
        await this.modal.close();
      } else {
        const created = await this.animalStore.create(draft);
        this.toast.show(`${speciesLabel(draft.species)} added`);
        await this.modal.closeAndNavigate(['/animals', created.$id]);
      }
    } catch (error: unknown) {
      this.error.set(
        error instanceof DuplicateTagError
          ? error.message
          : `Could not save this ${speciesVocabulary(draft.species).noun}.`,
      );
    }
    return undefined;
  }

  private blankDraft(): AnimalCreatePayload {
    const species = this.params.get('species');
    const kraal = this.kraalStore
      .kraals()
      .find((item) => item.$id === this.params.get('kraalId'));
    return {
      species:
        kraal?.species ??
        (isSpecies(species) ? species : this.speciesFilter.preferredSpecies()),
      tag: '',
      name: '',
      sex: 'female',
      breed: '',
      dateOfBirth: '',
      birthDateEstimated: false,
      damId: '',
      sireId: '',
      kraalId: kraal?.$id ?? '',
      notes: '',
    };
  }

  private async load(): Promise<void> {
    if (this.isEdit) {
      const animal = await this.animalStore.getById(this.animalId);
      if (animal) {
        const {
          species,
          tag,
          name,
          sex,
          breed,
          dateOfBirth,
          birthDateEstimated,
          damId,
          sireId,
          kraalId,
          notes,
        } = animal;
        this.animalForm().reset({
          species,
          tag,
          name,
          sex,
          breed,
          dateOfBirth,
          birthDateEstimated,
          damId,
          sireId,
          kraalId,
          notes,
        });
      } else {
        this.error.set('This animal could not be found.');
      }
    }
    this.loaded.set(true);
  }
}
