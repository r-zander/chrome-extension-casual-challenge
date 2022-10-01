import {EnhancedView} from "./EnhancedView";
import { MetaBar} from "./decklist/types";

export class NoopView extends EnhancedView {
    protected async checkDeck(): Promise<void> {
        // Do nothing
    }

    protected createMetaBar(): MetaBar {
        return new NoopMetaBar();
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
        return '';
    }

    protected onDisableChecks(): void {
        // Do nothing
    }
}

class NoopMetaBar implements MetaBar {
    init(): void {
        // Do nothing
    }

    displayDisabled(): void {
        // Do nothing
    }

    displayEnabled(): void {
        // Do nothing
    }

    displayLoading(): void {
        // Do nothing
    }

    hideLoadingIndicator(): void {
        // Do nothing
    }
}
