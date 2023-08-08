export type CheckMode = ('disabled' | 'overlay');
export type GridMode = ('search' | 'sets');

export interface MetaBar {
    init(): void;

    hideLoadingIndicator(): void;

    displayLoading(): void;

    displayEnabled(): void;

    displayDisabled(): void;
}
