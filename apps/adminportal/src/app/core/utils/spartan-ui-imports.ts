import { NgIcon } from '@ng-icons/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';

/** Common Spartan Helm pieces used across FMA screens. */
export const SpartanUiImports = [
  NgIcon,
  ...HlmAlertImports,
  ...HlmBadgeImports,
  ...HlmButtonImports,
  ...HlmCardImports,
  ...HlmCheckboxImports,
  ...HlmFieldImports,
  ...HlmInputImports,
  ...HlmNativeSelectImports,
  ...HlmTextareaImports,
] as const;
