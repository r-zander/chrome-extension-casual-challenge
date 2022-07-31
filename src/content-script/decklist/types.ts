export type CheckMode = ('disabled' | 'overlay');

export interface MetaBar {
    init(): void;

    hideLoadingIndicator(): void;

    displayLoading(): void;

    displayEnabled(): void;

    displayDisabled(): void;
}
