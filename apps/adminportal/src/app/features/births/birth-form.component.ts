import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { animalLabel } from '../../core/models/animal';
import {
  ANIMAL_SEXES,
  AnimalSex,
  animalSexLabel,
  speciesVocabulary,
  Species,
} from '../../core/models/species';
import { DuplicateTagError } from '../../core/utils/errors';
import { AnimalStore, KidDraft } from '../../core/stores/animal.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { todayIsoDate } from '../../core/utils/dates';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

interface KidFormValue {
  tag: string;
  name: string;
  sex: AnimalSex;
}

@Component({
  selector: 'fma-birth-form',
  imports: [ReactiveFormsModule, RouterLink, ...SpartanUiImports],
  templateUrl: './birth-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BirthFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly animalStore = inject(AnimalStore);
  protected readonly kraalStore = inject(KraalStore);
  private readonly speciesFilterStore = inject(SpeciesFilterStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly sexes = ANIMAL_SEXES;
  protected readonly label = animalLabel;
  protected readonly vocabulary = speciesVocabulary;
  protected readonly error = signal('');
  protected readonly form;
  protected readonly damId;
  protected readonly dams;
  protected readonly matchingKraals;
  protected readonly selectedDam;
  protected readonly birthSpecies;

  constructor() {
    this.form = this.formBuilder.nonNullable.group({
      damId: [this.route.snapshot.queryParamMap.get('damId') ?? '', Validators.required],
      kraalId: [this.route.snapshot.queryParamMap.get('kraalId') ?? '', Validators.required],
      date: [todayIsoDate(), Validators.required],
      notes: [''],
      kids: this.formBuilder.array([this.kidGroup()]),
    });
    this.damId = toSignal(this.form.controls.damId.valueChanges, {
      initialValue: this.form.controls.damId.value,
    });
    this.dams = computed(() =>
      this.animalStore
        .animals()
        .filter(
          (animal) =>
            animal.status === 'alive' &&
            animal.sex === 'female' &&
            this.speciesFilterStore.matches(animal.species),
        )
        .sort((left, right) => left.tag.localeCompare(right.tag)),
    );
    this.selectedDam = computed(() =>
      this.animalStore.animals().find((animal) => animal.$id === this.damId()),
    );
    this.birthSpecies = computed<Species>(
      () => this.selectedDam()?.species ?? this.speciesFilterStore.preferredSpecies(),
    );
    this.matchingKraals = computed(() => {
      const species = this.birthSpecies();
      return this.kraalStore.kraals().filter((kraal) => kraal.species === species);
    });
    this.form.controls.damId.valueChanges.pipe(takeUntilDestroyed()).subscribe((damId) => {
      void this.applyDamKraal(damId);
    });
    const damId = this.form.controls.damId.value;
    if (damId) {
      void this.applyDamKraal(damId);
    }
  }

  protected get kids(): FormArray<FormGroup> {
    return this.form.controls.kids;
  }

  protected sexLabel(sex: AnimalSex): string {
    return animalSexLabel(this.birthSpecies(), sex);
  }

  protected addKid(): void {
    this.kids.push(this.kidGroup());
  }

  protected removeKid(index: number): void {
    if (this.kids.length === 1) {
      return;
    }
    this.kids.removeAt(index);
  }

  private async applyDamKraal(damId: string): Promise<void> {
    const dam = await this.animalStore.getById(damId);
    if (!dam) {
      return;
    }
    const kraal = this.kraalStore.kraals().find((item) => item.$id === this.form.controls.kraalId.value);
    if (!this.form.controls.kraalId.value || kraal?.species !== dam.species) {
      this.form.controls.kraalId.setValue(dam.kraalId);
    }
  }

  private kidGroup(): FormGroup {
    return this.formBuilder.nonNullable.group({
      tag: ['', Validators.required],
      name: [''],
      sex: this.formBuilder.nonNullable.control<AnimalSex>('female'),
    });
  }

  protected async save(): Promise<void> {
    this.error.set('');
    const young = speciesVocabulary(this.birthSpecies()).young;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(
        `Dam, ${speciesVocabulary(this.birthSpecies()).location}, date, and ${young} ear tags are required.`,
      );
      return;
    }
    const value = this.form.getRawValue();
    const kids: KidDraft[] = (value.kids as KidFormValue[]).map((kid) => ({
      tag: kid.tag,
      name: kid.name,
      sex: kid.sex,
    }));
    try {
      await this.animalStore.recordBirth(value.damId, value.kraalId, value.date, kids, value.notes);
      await this.router.navigate(['/kraals', value.kraalId]);
    } catch (error: unknown) {
      this.error.set(
        error instanceof DuplicateTagError
          ? error.message
          : `Could not record ${speciesVocabulary(this.birthSpecies()).birth}.`,
      );
    }
  }
}
