import {DeckStatistics} from "./DeckStatistics";

export type CheckMode = ('disabled' | 'overlay');
export type GridMode = ('search' | 'sets');

export interface MetaBar {
    init(): void;

    hideLoadingIndicator(): void;

    displayLoading(): void;

    displayEnabled(): void;

    displayDisabled(): void;
}

// export const META_BAR_TITLE = 'Casual Challenge';
//
// export const sidebarClasses = {
//     PRICE: 'sidebar-prices-price',
//     TOTAL_PRICE: 'total-price',
//     BUDGET_POINT_SUM: 'budget-point-sum',
//     BUDGET_POINT_SHARE: 'budget-point-share',
//     BOARD_NAME: 'board-name',
//     BOARD_PRICE: 'board-price',
// }

// export interface StatisticsAwareMetaBar extends MetaBar {
//
//     renderDeckStatistics(deckStatistics: DeckStatistics): void;
// }
