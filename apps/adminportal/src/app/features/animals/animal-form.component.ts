import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  ANIMAL_SEXES,
  AnimalSex,
  BREEDS,
  SPECIES,
  animalSexLabel,
  isSpecies,
  speciesCopy,
  Species,
} from '../../core/models/species';
import { DuplicateTagError } from '../../core/errors';
import { AnimalDraft, AnimalStore } from '../../core/stores/animal.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'fma-animal-form',
  imports: [ReactiveFormsModule, RouterLink, ...SpartanUiImports],
  templateUrl: './animal-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly animalStore = inject(AnimalStore);
  protected readonly kraalStore = inject(KraalStore);
  private readonly speciesFilterStore = inject(SpeciesFilterStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly speciesOptions = SPECIES;
  protected readonly sexes = ANIMAL_SEXES;
  protected readonly copy = speciesCopy;
  protected readonly error = signal('');
  protected readonly loaded = signal(false);
  private readonly animalId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    {
      initialValue: this.route.snapshot.paramMap.get('id') ?? '',
    },
  );
  protected readonly isEdit = computed(() => Boolean(this.animalId()));
  protected readonly form;
  protected readonly currentSpecies;
  protected readonly breeds;
  protected readonly matchingKraals;

  constructor() {
    const querySpecies = this.route.snapshot.queryParamMap.get('species');
    const initialSpecies = isSpecies(querySpecies)
      ? querySpecies
      : this.speciesFilterStore.preferredSpecies();
    this.form = this.formBuilder.nonNullable.group({
      species: this.formBuilder.nonNullable.control<Species>(initialSpecies),
      tag: ['', Validators.required],
      name: [''],
      sex: this.formBuilder.nonNullable.control<AnimalSex>('female'),
      breed: [''],
      dateOfBirth: [''],
      birthDateEstimated: [false],
      damId: [''],
      sireId: [''],
      kraalId: ['', Validators.required],
      notes: [''],
    });
    this.currentSpecies = toSignal(this.form.controls.species.valueChanges, {
      initialValue: this.form.controls.species.value,
    });
    this.breeds = computed(() => BREEDS[this.currentSpecies()]);
    this.matchingKraals = computed(() =>
      this.kraalStore.kraals().filter((kraal) => kraal.species === this.currentSpecies()),
    );
    this.form.controls.species.valueChanges.pipe(takeUntilDestroyed()).subscribe((species) => {
      const kraalId = this.form.controls.kraalId.value;
      const kraal = this.kraalStore.kraals().find((item) => item.id === kraalId);
      if (kraal && kraal.species !== species) {
        this.form.controls.kraalId.setValue('');
      }
    });
    const kraalFromQuery = this.route.snapshot.queryParamMap.get('kraalId');
    if (kraalFromQuery) {
      this.form.controls.kraalId.setValue(kraalFromQuery);
      const kraal = this.kraalStore.kraals().find((item) => item.id === kraalFromQuery);
      if (kraal) {
        this.form.controls.species.setValue(kraal.species);
      }
    }
    void this.hydrate();
  }

  protected sexLabel(sex: AnimalSex): string {
    return animalSexLabel(this.currentSpecies(), sex);
  }

  private async hydrate(): Promise<void> {
    const id = this.animalId();
    if (!id) {
      this.loaded.set(true);
      return;
    }
    const animal = await this.animalStore.getById(id);
    if (animal) {
      this.form.patchValue({
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

  protected async save(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(`Ear tag and ${speciesCopy(this.currentSpecies()).location} are required.`);
      return;
    }
    const draft: AnimalDraft = this.form.getRawValue();
    try {
      const id = this.animalId();
      if (id) {
        await this.animalStore.update(id, draft);
        await this.router.navigate(['/flock', id]);
        return;
      }
      const created = await this.animalStore.create(draft);
      await this.router.navigate(['/flock', created.id]);
    } catch (error: unknown) {
      this.error.set(
        error instanceof DuplicateTagError
          ? error.message
          : `Could not save ${speciesCopy(draft.species).noun}.`,
      );
    }
  }
}
