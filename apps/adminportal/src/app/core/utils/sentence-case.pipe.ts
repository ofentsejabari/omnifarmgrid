import { Pipe, PipeTransform } from '@angular/core';

/** Capitalises the first letter only: "kraal for kids" → "Kraal for kids". */
@Pipe({ name: 'sentence' })
export class SentenceCasePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
