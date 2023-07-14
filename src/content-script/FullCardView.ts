import {addGlobalClass, EnhancedView} from "./_EnhancedView";
import {CheckMode, MetaBar} from "./decklist/types";
import {NoopMetaBar} from "./noop/NoopMetaBar";

export class FullCardView extends EnhancedView {

  public async onInit() {
    addGlobalClass('mode-full-card');
    return Promise.resolve(undefined);
  }

  protected createMetaBar(): MetaBar {
    return new NoopMetaBar();
  }

  protected shouldEnableChecks(): Promise<boolean> {
    return Promise.resolve(true);
  }

  protected checkDeck(): Promise<void> {
    return Promise.resolve(undefined);
  }

  protected storeCheckFlag(newValue: CheckMode): Promise<void> {
    return Promise.resolve(undefined);
  }

  protected onDisableChecks(): void {
    // Nothing to do here
  }

  protected getElementsToHideSelector(): string {
    return null;
  }

}
