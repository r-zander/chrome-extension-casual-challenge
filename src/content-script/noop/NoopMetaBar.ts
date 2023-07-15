import {MetaBar} from "../decklist/types";

export class NoopMetaBar implements MetaBar {
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
