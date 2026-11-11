import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { animalLabel } from '../../core/models/animal';
import {
  DEATH_REASONS,
  DeathReason,
  deathReasonLabel,
} from '../../core/models/event';
import { AnimalStore } from '../../core/stores/animal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { todayIsoDate } from '../../core/utils/dates';
import { DateFieldComponent } from '../../core/ui/date-field.component';
import { SelectFieldComponent } from '../../core/ui/select-field.component';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

/** Popup: record a death. Params: `animalId`, `kraalId` (limits the picker). */
@Component({
  selector: 'fma-death-form',
  imports: [
    ReactiveFormsModule,
    SelectFieldComponent,
    DateFieldComponent,
    ...SpartanUiImports,
  ],
  templateUrl: './death-form.component.html',
  host: { class: 'fma-modal' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeathFormComponent {
  private readonly animalStore = inject(AnimalStore);
  private readonly speciesFilter = inject(SpeciesFilterStore);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);

  protected readonly error = signal('');
  protected readonly saving = signal(false);

  private readonly params = inject(ActivatedRoute).snapshot.paramMap;
  private readonly kraalId = this.params.get('kraalId');
  protected readonly form = inject(FormBuilder).nonNullable.group({
    animalId: [this.params.get('animalId') ?? '', Validators.required],
    date: [todayIsoDate(), Validators.required],
    reason: ['unknown' as DeathReason],
    notes: [''],
  });

  private readonly animalId = toSignal(
    this.form.controls.animalId.valueChanges,
    {
      initialValue: this.form.controls.animalId.value,
    },
  );

  protected readonly animals = computed(() =>
    this.animalStore
      .herd()
      .filter(
        (animal) =>
          animal.status === 'alive' &&
          this.speciesFilter.matches(animal.species) &&
          (!this.kraalId || animal.kraalId === this.kraalId),
      )
      .sort((a, b) => a.tag.localeCompare(b.tag)),
  );

  private readonly species = computed(
    () =>
      this.animalStore.herd().find((animal) => animal.$id === this.animalId())
        ?.species,
  );

  protected readonly animalOptions = computed(() =>
    this.animals().map((animal) => ({
      value: animal.$id,
      label: animalLabel(animal),
    })),
  );
  protected readonly reasonOptions = computed(() =>
    DEATH_REASONS.map((reason) => ({
      value: reason,
      label: deathReasonLabel(reason, this.species()),
    })),
  );

  protected async save(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Choose the animal and a date.');
      return;
    }
    const { animalId, date, reason, notes } = this.form.getRawValue();
    this.saving.set(true);
    try {
      await this.animalStore.recordDeath(animalId, date, reason, notes);
      this.toast.show('Death recorded');
      await this.modal.close();
    } catch {
      this.error.set('Could not record the death.');
    } finally {
      this.saving.set(false);
    }
  }
}
