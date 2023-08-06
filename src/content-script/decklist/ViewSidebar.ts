import {formatBudgetPoints, formatBudgetPointsShare} from "../../common/formatting";
import {MAX_BUDGET_POINTS} from "../../common/constants";
import {DeckStatistics} from "./DeckStatistics";
import {META_BAR_TITLE, statisticHtml, StatisticsAwareMetaBar} from "./StatisticsAwareMetaBar";

const sidebarClasses = {
    PRICE: 'sidebar-prices-price',
    TOTAL_PRICE: 'total-price',
    BUDGET_POINT_SUM: 'budget-point-sum',
    BUDGET_POINT_SHARE: 'budget-point-share',
    BOARD_NAME: 'board-name',
    BOARD_PRICE: 'board-price',
}

let isInit = false;

let loadingIndicator: HTMLElement,
    disabledButton: HTMLElement,
    enabledButton: HTMLElement;

export class ViewSidebar extends StatisticsAwareMetaBar {
    constructor() {
        super(true);
    }

    public override init(): void {
        const sidebarTemplate = document.createElement('template');
        sidebarTemplate.innerHTML = `
<div class="sidebar-toolbox casual-challenge">
    <h2 class="sidebar-header">${META_BAR_TITLE}</h2>
    ${statisticHtml}
    <div class="casual-challenge-checks-loading button-n tiny"><div class="dot-flashing"></div></div>
    <button class="casual-challenge-checks-disabled button-n tiny hidden">Enable checks</button>
    <button class="casual-challenge-checks-enabled button-n primary tiny hidden">Disable checks</button>
</div>`;

        // The sidebar already is set to display 'loading', no need to adjust the mode
        document.querySelector('.sidebar-prices').after(sidebarTemplate.content);

        loadingIndicator = document.querySelector('.casual-challenge-checks-loading');
        disabledButton = document.querySelector('.casual-challenge-checks-disabled');
        enabledButton = document.querySelector('.casual-challenge-checks-enabled');

        isInit = true;
    }

    public addDisabledButtonClickHandler(handler: () => void): void {
        disabledButton.addEventListener('click', handler);
    }

    public addEnabledButtonClickHandler(handler: () => void): void {
        enabledButton.addEventListener('click', handler);
    }

    public hideLoadingIndicator(): void {
        loadingIndicator.classList.add('hidden');
    }

    public displayLoading(): void {
        loadingIndicator.classList.remove('hidden');
        disabledButton.classList.add('hidden');
        enabledButton.classList.add('hidden');
    }

    public displayEnabled(): void {
        loadingIndicator.classList.add('hidden');
        disabledButton.classList.add('hidden');
        enabledButton.classList.remove('hidden');
    }

    public displayDisabled(): void {
        if (!isInit) return;

        loadingIndicator.classList.add('hidden');
        disabledButton.classList.remove('hidden');
        enabledButton.classList.add('hidden');
    }
}
