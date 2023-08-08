import {EnhancedView} from "../enhancedView";
import {NoopMetaBar} from "./noopMetaBar";

export class NoopView extends EnhancedView<NoopMetaBar> {
    protected async enhanceView(): Promise<void> {
        // Do nothing
    }

    protected createMetaBar(): NoopMetaBar {
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


