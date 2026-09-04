import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { animalLabel } from '../../core/models/animal';
import { DEATH_REASONS, DeathReason, deathReasonLabel } from '../../core/models/event';
import { speciesCopy } from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { todayIsoDate } from '../../core/utils/dates';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'fma-death-form',
  imports: [ReactiveFormsModule, RouterLink, ...SpartanUiImports],
  templateUrl: './death-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeathFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly animalStore = inject(AnimalStore);
  private readonly speciesFilterStore = inject(SpeciesFilterStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly reasons = DEATH_REASONS;
  protected readonly label = animalLabel;
  protected readonly copy = speciesCopy;
  protected readonly error = signal('');
  protected readonly form;
  protected readonly animalId;
  protected readonly animals;
  protected readonly selectedAnimal;

  constructor() {
    this.form = this.formBuilder.nonNullable.group({
      animalId: [this.route.snapshot.queryParamMap.get('animalId') ?? '', Validators.required],
      date: [todayIsoDate(), Validators.required],
      reason: this.formBuilder.nonNullable.control<DeathReason>('unknown'),
      notes: [''],
    });
    this.animalId = toSignal(this.form.controls.animalId.valueChanges, {
      initialValue: this.form.controls.animalId.value,
    });
    const kraalId = this.route.snapshot.queryParamMap.get('kraalId');
    this.animals = computed(() =>
      this.animalStore
        .animals()
        .filter(
          (animal) =>
            animal.status === 'alive' &&
            this.speciesFilterStore.matches(animal.species) &&
            (!kraalId || animal.kraalId === kraalId),
        )
        .sort((left, right) => left.tag.localeCompare(right.tag)),
    );
    this.selectedAnimal = computed(() =>
      this.animalStore.animals().find((animal) => animal.id === this.animalId()),
    );
  }

  protected reasonLabel(reason: DeathReason): string {
    return deathReasonLabel(reason, this.selectedAnimal()?.species);
  }

  protected async save(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Select the animal and a date.');
      return;
    }
    const value = this.form.getRawValue();
    try {
      await this.animalStore.recordDeath(value.animalId, value.date, value.reason, value.notes);
      await this.router.navigate(['/flock', value.animalId]);
    } catch {
      this.error.set('Could not record death.');
    }
  }
}
