import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BACKUP_VERSION, FmaBackup } from '../../core/models/backup';
import { BackupStore } from '../../core/stores/backup.store';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'fma-more-page',
  imports: [...SpartanUiImports],
  templateUrl: './more-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MorePageComponent {
  private readonly backupStore = inject(BackupStore);

  protected readonly message = signal('');
  protected readonly error = signal('');

  protected async exportBackup(): Promise<void> {
    this.error.set('');
    const backup = await this.backupStore.exportBackup();
    this.backupStore.downloadJson(backup);
    this.message.set('Backup file downloaded. Keep a copy off this phone.');
  }

  protected async onFile(event: Event): Promise<void> {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    await this.importFile(input.files);
    input.value = '';
  }

  protected async importFile(fileList: FileList | null): Promise<void> {
    this.error.set('');
    this.message.set('');
    const file = fileList?.item(0);
    if (!file) {
      return;
    }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const backup = this.asBackup(parsed);
      await this.backupStore.importBackup(backup);
      this.message.set('Backup restored to Appwrite.');
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : 'Could not restore that file.');
    }
  }

  private asBackup(value: unknown): FmaBackup {
    if (typeof value !== 'object' || value === null) {
      throw new Error('That file is not a valid FMA backup.');
    }
    const candidate = value as Partial<FmaBackup>;
    if (candidate.version !== BACKUP_VERSION || !Array.isArray(candidate.animals)) {
      throw new Error('This backup file is not compatible with this app version.');
    }
    return candidate as FmaBackup;
  }
}
