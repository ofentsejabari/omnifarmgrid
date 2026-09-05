import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CONTACT_INTERESTS,
  ContactInterest,
  SITE_CONTACT_EMAIL,
  SITE_LOCATION,
} from '../../core/content/site';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, ...SpartanUiImports],
  templateUrl: './contact.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly email = SITE_CONTACT_EMAIL;
  protected readonly location = SITE_LOCATION;
  protected readonly interests = CONTACT_INTERESTS;
  protected readonly submitted = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    farmName: [''],
    interest: this.formBuilder.nonNullable.control<ContactInterest | ''>('', Validators.required),
    message: ['', Validators.required],
  });

  protected showError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const interestLabel =
      this.interests.find((item) => item.value === value.interest)?.label ?? value.interest;
    const lines = [
      `Name: ${value.name}`,
      `Email: ${value.email}`,
      `Phone: ${value.phone || '—'}`,
      `Farm: ${value.farmName || '—'}`,
      `Livestock: ${interestLabel}`,
      '',
      value.message,
    ];
    const subject = encodeURIComponent(`AgroHerd access — ${value.farmName || value.name}`);
    const body = encodeURIComponent(lines.join('\n'));
    globalThis.location.href = `mailto:${this.email}?subject=${subject}&body=${body}`;
    this.submitted.set(true);
  }
}
