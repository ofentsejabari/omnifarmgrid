import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { KraalRow } from '../../core/models/kraal';
import {
  SPECIES,
  speciesLabel,
  speciesVocabulary,
} from '../../core/models/species';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { ModalService } from '../../core/ui/modal.service';
import { SpeciesAvatarComponent } from '../../core/ui/species-avatar.component';
import { ToastService } from '../../core/ui/toast.service';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

type KraalDraft = Pick<KraalRow, 'species' | 'name' | 'notes'>;

/** Popup: add a kraal/pen, or rename one. Params: `id` (edit). */
@Component({
  selector: 'fma-kraal-form',
  imports: [FormField, FormRoot, SpeciesAvatarComponent, ...SpartanUiImports],
  templateUrl: './kraal-form.component.html',
  host: { class: 'fma-modal' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KraalFormComponent {
  private readonly kraalStore = inject(KraalStore);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);

  private readonly kraalId =
    inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  protected readonly isEdit = Boolean(this.kraalId);
  protected readonly speciesOptions = SPECIES;
  protected readonly speciesName = speciesLabel;
  protected readonly error = signal('');

  protected readonly kraalModel = signal<KraalDraft>({
    species: inject(SpeciesFilterStore).preferredSpecies(),
    name: '',
    notes: '',
  });
  protected readonly kraalForm = form(
    this.kraalModel,
    (path) => required(path.name),
    { submission: { action: async (field) => this.save(field().value()) } },
  );
  protected readonly words = computed(() =>
    speciesVocabulary(this.kraalModel().species),
  );

  constructor() {
    if (this.isEdit) {
      void this.kraalStore.getById(this.kraalId).then((kraal) => {
        if (kraal) {
          this.kraalForm().reset({
            species: kraal.species,
            name: kraal.name,
            notes: kraal.notes,
          });
        }
      });
    }
  }

  private async save({ species, name, notes }: KraalDraft): Promise<undefined> {
    this.error.set('');
    if (this.isEdit) {
      await this.kraalStore.update({
        $id: this.kraalId,
        species,
        name: name.trim(),
        notes: notes.trim(),
      });
    } else {
      await this.kraalStore.create(name, notes, species);
    }
    const failed = this.kraalStore.error();
    if (failed) {
      this.error.set(failed);
      return undefined;
    }
    this.toast.show(this.isEdit ? 'Changes saved' : `${name.trim()} added`);
    await this.modal.close();
    return undefined;
  }
}
