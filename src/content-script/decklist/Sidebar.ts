import {formatBudgetPoints, formatBudgetPointsShare} from "../../common/formatting";
import {MAX_BUDGET_POINTS} from "../../common/constants";
import {DeckStatistics} from "./DeckStatistics";
import {MetaBar} from "./types";

const sidebarClasses = {
    BUDGET_POINT_SUM: 'budget-point-sum',
    BUDGET_POINT_SHARE: 'budget-point-share',
}

let isInit = false;

let loadingIndicator: HTMLElement,
    disabledButton: HTMLElement,
    enabledButton: HTMLElement;

export class Sidebar implements MetaBar {
    public init(): void {
        const sidebarTemplate = document.createElement('template');
        const maxBP = formatBudgetPoints(MAX_BUDGET_POINTS);
        sidebarTemplate.innerHTML = `
<div class="sidebar-toolbox casual-challenge">
     <h2 class="sidebar-header">Casual Challenge</h2>
     <span class="sidebar-prices-price hidden">
        <span class="currency-eur">Budget Points</span>
        <span class="currency-eur ${sidebarClasses.BUDGET_POINT_SUM}"></span>
     </span>
     <span class="sidebar-prices-price hidden">
        <span class="currency-usd">% of ${maxBP}</span>
        <span class="currency-usd ${sidebarClasses.BUDGET_POINT_SHARE}"></span>
     </span>
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

    public renderDeckStatistics(deckStatistics: DeckStatistics): void {
        const budgetPointSumElement = document.querySelector('.' + sidebarClasses.BUDGET_POINT_SUM);
        budgetPointSumElement.innerHTML = formatBudgetPoints(deckStatistics.budgetPoints);
        budgetPointSumElement.parentElement.classList.remove('hidden');

        const budgetPointShareElement = document.querySelector('.' + sidebarClasses.BUDGET_POINT_SHARE);
        budgetPointShareElement.textContent = formatBudgetPointsShare(deckStatistics.budgetPoints);
        budgetPointShareElement.parentElement.classList.remove('hidden');

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
