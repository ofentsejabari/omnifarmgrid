import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { animalLabel } from '../../core/models/animal';
import {
  ANIMAL_SEXES,
  AnimalSex,
  animalSexLabel,
  Species,
  speciesVocabulary,
} from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { todayIsoDate } from '../../core/utils/dates';
import { DuplicateTagError } from '../../core/utils/errors';
import { DateFieldComponent } from '../../core/ui/date-field.component';
import { SelectFieldComponent } from '../../core/ui/select-field.component';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

/** Popup: record a birth. Params: `damId`, `kraalId`. */
@Component({
  selector: 'fma-birth-form',
  imports: [
    ReactiveFormsModule,
    SelectFieldComponent,
    DateFieldComponent,
    ...SpartanUiImports,
  ],
  templateUrl: './birth-form.component.html',
  host: { class: 'fma-modal' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BirthFormComponent {
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly animalStore = inject(AnimalStore);
  private readonly kraalStore = inject(KraalStore);
  private readonly speciesFilter = inject(SpeciesFilterStore);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);

  protected readonly vocabulary = speciesVocabulary;
  protected readonly error = signal('');
  protected readonly saving = signal(false);

  private readonly params = inject(ActivatedRoute).snapshot.paramMap;
  protected readonly form = this.formBuilder.group({
    damId: [this.params.get('damId') ?? '', Validators.required],
    kraalId: [this.params.get('kraalId') ?? '', Validators.required],
    date: [todayIsoDate(), Validators.required],
    notes: [''],
    kids: this.formBuilder.array([this.kidGroup()]),
  });

  private readonly damId = toSignal(this.form.controls.damId.valueChanges, {
    initialValue: this.form.controls.damId.value,
  });

  protected readonly dams = computed(() =>
    this.animalStore
      .herd()
      .filter(
        (animal) =>
          animal.status === 'alive' &&
          animal.sex === 'female' &&
          this.speciesFilter.matches(animal.species),
      )
      .sort((a, b) => a.tag.localeCompare(b.tag)),
  );

  protected readonly species = computed<Species>(
    () =>
      this.animalStore.herd().find((animal) => animal.$id === this.damId())
        ?.species ?? this.speciesFilter.preferredSpecies(),
  );

  protected readonly damOptions = computed(() =>
    this.dams().map((dam) => ({ value: dam.$id, label: animalLabel(dam) })),
  );
  protected readonly kraalOptions = computed(() =>
    this.kraalStore
      .kraals()
      .filter((kraal) => kraal.species === this.species())
      .map((kraal) => ({ value: kraal.$id, label: kraal.name })),
  );
  protected readonly sexOptions = computed(() =>
    ANIMAL_SEXES.map((sex) => ({
      value: sex,
      label: animalSexLabel(this.species(), sex),
    })),
  );

  constructor() {
    // Newborns go to the mother's kraal unless the farmer picks another one.
    this.form.controls.damId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((id) => void this.useDamKraal(id));
    void this.useDamKraal(this.form.controls.damId.value);
  }

  protected get kids() {
    return this.form.controls.kids;
  }

  protected addKid(): void {
    this.kids.push(this.kidGroup());
  }

  protected removeKid(index: number): void {
    if (this.kids.length > 1) {
      this.kids.removeAt(index);
    }
  }

  protected async save(): Promise<void> {
    const words = speciesVocabulary(this.species());
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(
        `Choose the mother and ${words.location}, and give every ${words.young} an ear tag.`,
      );
      return;
    }
    const { damId, kraalId, date, notes, kids } = this.form.getRawValue();
    this.saving.set(true);
    try {
      await this.animalStore.recordBirth(damId, kraalId, date, kids, notes);
      this.toast.show(
        `${words.birth.charAt(0).toUpperCase()}${words.birth.slice(1)} recorded`,
      );
      await this.modal.close();
    } catch (error: unknown) {
      this.error.set(
        error instanceof DuplicateTagError
          ? error.message
          : `Could not record the ${words.birth}.`,
      );
    } finally {
      this.saving.set(false);
    }
  }

  private async useDamKraal(damId: string): Promise<void> {
    if (!damId) {
      return;
    }
    const dam =
      this.animalStore.herd().find((animal) => animal.$id === damId) ??
      (await this.animalStore.getById(damId));
    if (!dam) {
      return;
    }
    const current = this.kraalStore
      .kraals()
      .find((kraal) => kraal.$id === this.form.controls.kraalId.value);
    if (current?.species !== dam.species) {
      this.form.controls.kraalId.setValue(dam.kraalId);
    }
  }

  private kidGroup() {
    return this.formBuilder.group({
      tag: ['', Validators.required],
      name: [''],
      sex: this.formBuilder.control<AnimalSex>('female'),
    });
  }
}
