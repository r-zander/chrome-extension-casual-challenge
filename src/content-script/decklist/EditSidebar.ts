import {formatBudgetPoints, formatBudgetPointsShare} from "../../common/formatting";
import {MAX_BUDGET_POINTS} from "../../common/constants";
import {DeckStatistics} from "./DeckStatistics";
import {MetaBar, StatisticsAwareMetaBar} from "./types";

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

export class EditSidebar implements StatisticsAwareMetaBar {
    public init(): void {
        //      append to .deckbuilder-sidebar
        //          .deckbuilder-section-title-bar
        //          ol
        //              same entries as regular sidebar

//         const sidebarTemplate = document.createElement('template');
//         const maxBP = formatBudgetPoints(MAX_BUDGET_POINTS);
//         sidebarTemplate.innerHTML = `
// <div class="sidebar-toolbox casual-challenge">
//      <h2 class="sidebar-header">Casual Challenge</h2>
//      <span class="${sidebarClasses.PRICE} ${sidebarClasses.TOTAL_PRICE} hidden">
//         <span class="currency-eur">Budget Points</span>
//         <span class="currency-eur ${sidebarClasses.BUDGET_POINT_SUM}"></span>
//      </span>
//      <span class="${sidebarClasses.PRICE} ${sidebarClasses.BOARD_PRICE} hidden">
//         <span class="currency-eur ${sidebarClasses.BOARD_NAME}">Board</span>
//         <span class="currency-eur ${sidebarClasses.BUDGET_POINT_SUM}"></span>
//      </span>
//      <span class="${sidebarClasses.PRICE} hidden">
//         <span class="currency-usd">% of ${maxBP}</span>
//         <span class="currency-usd ${sidebarClasses.BUDGET_POINT_SHARE}"></span>
//      </span>
//      <div class="casual-challenge-checks-loading button-n tiny"><div class="dot-flashing"></div></div>
//      <button class="casual-challenge-checks-disabled button-n tiny hidden">Enable checks</button>
//      <button class="casual-challenge-checks-enabled button-n primary tiny hidden">Disable checks</button>
// </div>`;
//
//         // The sidebar already is set to display 'loading', no need to adjust the mode
//         document.querySelector('.sidebar-prices').after(sidebarTemplate.content);
//
//         loadingIndicator = document.querySelector('.casual-challenge-checks-loading');
//         disabledButton = document.querySelector('.casual-challenge-checks-disabled');
//         enabledButton = document.querySelector('.casual-challenge-checks-enabled');

        isInit = true;
    }

    // public addDisabledButtonClickHandler(handler: () => void): void {
    //     disabledButton.addEventListener('click', handler);
    // }
    //
    // public addEnabledButtonClickHandler(handler: () => void): void {
    //     enabledButton.addEventListener('click', handler);
    // }

    public hideLoadingIndicator(): void {
        // loadingIndicator.classList.add('hidden');
    }

    public renderDeckStatistics(deckStatistics: DeckStatistics): void {
        // const totalPriceElement = document.querySelector(`.${sidebarClasses.PRICE}.${sidebarClasses.TOTAL_PRICE}`);
        // const budgetPointSumElement = totalPriceElement.querySelector(`.${sidebarClasses.BUDGET_POINT_SUM}`);
        // budgetPointSumElement.innerHTML = formatBudgetPoints(deckStatistics.budgetPoints);
        // totalPriceElement.classList.remove('hidden');
        //
        // const boardPricesElement = document.querySelector(`.${sidebarClasses.PRICE}.${sidebarClasses.BOARD_PRICE}`);
        // boardPricesElement.remove();
        // boardPricesElement.classList.remove('hidden');
        //
        // const boardEntries = Object.entries(deckStatistics.boards)
        //     .reverse(); // Reverse as entries are added on top of the list, i.e. inverted on dom generation
        // if (boardEntries.length > 1) { // If there is only one board, there is no need to display more details
        //     for (const [boardName, boardStatistics] of boardEntries) {
        //         const newBoardPricesElement = boardPricesElement.cloneNode(true) as HTMLElement;
        //         totalPriceElement.insertAdjacentElement('afterend', newBoardPricesElement);
        //         newBoardPricesElement.querySelector(`.${sidebarClasses.BOARD_NAME}`).textContent = boardName;
        //         newBoardPricesElement.querySelector(`.${sidebarClasses.BUDGET_POINT_SUM}`).innerHTML = formatBudgetPoints(boardStatistics.budgetPoints);
        //     }
        // }
        //
        // const budgetPointShareElement = document.querySelector(`.${sidebarClasses.BUDGET_POINT_SHARE}`);
        // budgetPointShareElement.textContent = formatBudgetPointsShare(deckStatistics.budgetPoints);
        // budgetPointShareElement.parentElement.classList.remove('hidden');
    }

    public displayLoading(): void {
        // loadingIndicator.classList.remove('hidden');
        // disabledButton.classList.add('hidden');
        // enabledButton.classList.add('hidden');
    }

    public displayEnabled(): void {
        // loadingIndicator.classList.add('hidden');
        // disabledButton.classList.add('hidden');
        // enabledButton.classList.remove('hidden');
    }

    public displayDisabled(): void {
        // if (!isInit) return;
        //
        // loadingIndicator.classList.add('hidden');
        // disabledButton.classList.remove('hidden');
        // enabledButton.classList.add('hidden');
    }
}
