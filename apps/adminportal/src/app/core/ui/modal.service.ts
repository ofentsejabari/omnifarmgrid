import { inject, Injectable } from '@angular/core';
import { Router, UrlSegment, UrlSegmentGroup } from '@angular/router';

/** Names of the routes registered on the `modal` outlet (see app.routes.ts). */
export type ModalName =
  | 'animal'
  | 'kraal'
  | 'birth'
  | 'death'
  | 'vaccinate'
  | 'product'
  | 'receive';

export type ModalParams = Record<string, string | null | undefined>;

export const MODAL_OUTLET = 'modal';

/**
 * Opens forms as popups on top of the current page.
 *
 * A modal is a route on the named `modal` outlet, so it has a URL
 * (`/animals(modal:birth;damId=a1)`), survives a refresh and closes with the
 * back button. Parameters travel as matrix params on the modal segment and
 * disappear when the modal closes.
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly router = inject(Router);

  open(name: ModalName, params: ModalParams = {}): Promise<boolean> {
    const tree = this.router.parseUrl(this.router.url);
    const matrix = Object.fromEntries(
      Object.entries(params).filter((entry): entry is [string, string] =>
        Boolean(entry[1]),
      ),
    );
    tree.root.children[MODAL_OUTLET] = new UrlSegmentGroup(
      [new UrlSegment(name, matrix)],
      {},
    );
    return this.router.navigateByUrl(tree);
  }

  close(): Promise<boolean> {
    const tree = this.router.parseUrl(this.router.url);
    delete tree.root.children[MODAL_OUTLET];
    return this.router.navigateByUrl(tree);
  }

  /** Close the modal and go to another page in one navigation. */
  closeAndNavigate(commands: readonly unknown[]): Promise<boolean> {
    return this.router.navigate(commands as unknown[]);
  }
}
