import { computed, inject, Injectable } from '@angular/core';
import { SpeciesFilterStore } from '../core/stores/species-filter.store';
import { ModalName, ModalService } from '../core/ui/modal.service';
import { speciesVocabulary } from '../core/models/species';

export interface RecordAction {
  modal: ModalName;
  icon: string;
  label: string;
  hint: string;
  run: () => void;
}

/** The four things a farmer records day to day, shared by the sidebar and the Record menu. */
@Injectable({ providedIn: 'root' })
export class RecordActions {
  private readonly modal = inject(ModalService);
  private readonly speciesFilter = inject(SpeciesFilterStore);

  readonly all = computed<RecordAction[]>(() => {
    const selected = this.speciesFilter.selected();
    const birth =
      selected === 'all'
        ? 'Record a birth'
        : speciesVocabulary(selected).birthVerb;
    const make = (
      modal: ModalName,
      icon: string,
      label: string,
      hint: string,
    ): RecordAction => ({
      modal,
      icon,
      label,
      hint,
      run: () => void this.modal.open(modal),
    });
    return [
      make('birth', 'lucideBaby', birth, 'Mother and newborns'),
      make(
        'animal',
        'lucidePlus',
        'Add an animal',
        'Bought in or not yet recorded',
      ),
      make(
        'vaccinate',
        'lucideSyringe',
        'Vaccinate a kraal',
        'Treat everyone, skip a few',
      ),
      make(
        'death',
        'lucideHeartOff',
        'Record a death',
        'Lost, slaughtered or culled',
      ),
    ];
  });
}
