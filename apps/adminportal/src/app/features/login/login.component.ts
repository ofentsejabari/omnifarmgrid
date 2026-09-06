import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  email,
  form,
  FormField,
  minLength,
  required,
  submit,
} from '@angular/forms/signals';
import { AppwriteException } from 'appwrite';
import { SPECIES, speciesLabel, speciesVocabulary } from '../../core/models/species';
import { AuthStore } from '../../core/stores/auth.store';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';
import { BrandMarkComponent } from '../../layout/brand-mark.component';

interface LoginModel {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, BrandMarkComponent, ...SpartanUiImports],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly error = signal('');
  protected readonly showPassword = signal(false);
  protected readonly species = SPECIES;
  protected readonly vocabulary = speciesVocabulary;
  protected readonly speciesName = speciesLabel;
  protected readonly loginModel = signal<LoginModel>({ email: '', password: '' });
  protected readonly loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required.' });
    email(schemaPath.email, { message: 'Enter a valid email address.' });
    required(schemaPath.password, { message: 'Password is required.' });
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters.' });
  });

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.error.set('');
    await submit(this.loginForm, {
      action: async () => {
        const { email: emailValue, password } = this.loginModel();
        try {
          await this.authStore.login(emailValue.trim(), password);
          await this.router.navigateByUrl(this.returnUrl());
        } catch (error: unknown) {
          this.error.set(this.loginMessage(error));
        }
        return undefined;
      },
    });
  }

  private returnUrl(): string {
    const raw = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/login')) {
      return '/';
    }
    return raw;
  }

  private loginMessage(error: unknown): string {
    if (error instanceof AppwriteException) {
      if (error.code === 401 || error.type === 'user_invalid_credentials') {
        return 'Email or password is wrong.';
      }
      return error.message;
    }
    return 'Could not sign in.';
  }
}
