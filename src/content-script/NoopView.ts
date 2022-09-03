import {EnhancedView} from "./EnhancedView";
import { MetaBar} from "./decklist/types";

export class NoopView extends EnhancedView {
    protected async checkDeck(): Promise<void> {
        // Do nothing
    }

    protected createMetaBar(): MetaBar {
        return null;
    }

    public async onInit(): Promise<void> {
        // Do nothing
    }

    protected async shouldEnableChecks(): Promise<boolean> {
        return false;
    }

    protected async storeCheckFlag(): Promise<void> {
        // Do nothing
    }

    protected getElementsToHideSelector(): string {
        return null;
    }

    protected onDisableChecks(): void {
        // Do nothing
    }
}
