import { NgIcon } from '@ng-icons/core';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';

export const SpartanUiImports = [
  NgIcon,
  ...HlmAccordionImports,
  ...HlmAlertImports,
  ...HlmBadgeImports,
  ...HlmButtonImports,
  ...HlmCardImports,
  ...HlmFieldImports,
  ...HlmInputImports,
  ...HlmTextareaImports,
] as const;
