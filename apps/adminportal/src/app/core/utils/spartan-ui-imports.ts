import { NgIcon } from '@ng-icons/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { SentenceCasePipe } from './sentence-case.pipe';

/** Shared building blocks for every screen. Selects are native (`.fma-select`) so they work inside popups. */
export const SpartanUiImports = [
  NgIcon,
  SentenceCasePipe,
  ...HlmAlertImports,
  ...HlmBadgeImports,
  ...HlmButtonImports,
  ...HlmCheckboxImports,
  ...HlmFieldImports,
  ...HlmInputImports,
  ...HlmTextareaImports,
] as const;
