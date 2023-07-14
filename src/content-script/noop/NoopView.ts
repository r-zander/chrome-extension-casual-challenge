import {EnhancedView} from "../_EnhancedView";
import { MetaBar} from "../decklist/types";
import {NoopMetaBar} from "./NoopMetaBar";

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


