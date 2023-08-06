import {formatBudgetPoints, formatBudgetPointsShare} from "../../common/formatting";
import {MAX_BUDGET_POINTS} from "../../common/constants";
import {DeckStatistics} from "./DeckStatistics";
import {MetaBar} from "./types";

const sidebarClasses = {
    PRICE: 'sidebar-prices-price',
    TOTAL_PRICE: 'total-price',
    BUDGET_POINT_SUM: 'budget-point-sum',
    BUDGET_POINT_SHARE: 'budget-point-share',
    BOARD_NAME: 'board-name',
    BOARD_PRICE: 'board-price',
}
export const META_BAR_TITLE = 'Casual Challenge';

const maxBP = formatBudgetPoints(MAX_BUDGET_POINTS);

export const statisticHtml = `
<span class="${sidebarClasses.PRICE} ${sidebarClasses.TOTAL_PRICE} hidden">
    <span class="currency-eur">Budget Points</span>
    <span class="currency-eur ${sidebarClasses.BUDGET_POINT_SUM}"></span>
</span>
<span class="${sidebarClasses.PRICE} ${sidebarClasses.BOARD_PRICE} hidden">
    <span class="currency-eur ${sidebarClasses.BOARD_NAME}">Board</span>
    <span class="currency-eur ${sidebarClasses.BUDGET_POINT_SUM}"></span>
</span>
<span class="${sidebarClasses.PRICE} hidden">
    <span class="currency-usd">% of ${maxBP}</span>
    <span class="currency-usd ${sidebarClasses.BUDGET_POINT_SHARE}"></span>
</span>
`

export abstract class StatisticsAwareMetaBar implements MetaBar {
    private readonly renderBoardEntries: boolean;

    constructor(renderBoardEntries: boolean) {
        this.renderBoardEntries = renderBoardEntries;
    }

    abstract init(): void ;

    abstract hideLoadingIndicator(): void ;

    abstract displayLoading(): void;

    abstract displayEnabled(): void;

    abstract displayDisabled(): void;

    public renderDeckStatistics(deckStatistics: DeckStatistics): void {
        const totalPriceElement = document.querySelector(`.${sidebarClasses.PRICE}.${sidebarClasses.TOTAL_PRICE}`);
        const budgetPointSumElement = totalPriceElement.querySelector(`.${sidebarClasses.BUDGET_POINT_SUM}`);
        budgetPointSumElement.innerHTML = formatBudgetPoints(deckStatistics.budgetPoints);
        totalPriceElement.classList.remove('hidden');

        if (this.renderBoardEntries) {
            const boardPricesElement = document.querySelector(`.${sidebarClasses.PRICE}.${sidebarClasses.BOARD_PRICE}`);
            boardPricesElement.remove();
            boardPricesElement.classList.remove('hidden');

            const boardEntries = Object.entries(deckStatistics.boards)
                .reverse(); // Reverse as entries are added on top of the list, i.e. inverted on dom generation
            if (boardEntries.length > 1) { // If there is only one board, there is no need to display more details
                for (const [boardName, boardStatistics] of boardEntries) {
                    const newBoardPricesElement = boardPricesElement.cloneNode(true) as HTMLElement;
                    totalPriceElement.insertAdjacentElement('afterend', newBoardPricesElement);
                    newBoardPricesElement.querySelector(`.${sidebarClasses.BOARD_NAME}`).textContent = boardName;
                    newBoardPricesElement.querySelector(`.${sidebarClasses.BUDGET_POINT_SUM}`).innerHTML = formatBudgetPoints(boardStatistics.budgetPoints);
                }
            }
        }

        const budgetPointShareElement = document.querySelector(`.${sidebarClasses.BUDGET_POINT_SHARE}`);
        budgetPointShareElement.textContent = formatBudgetPointsShare(deckStatistics.budgetPoints);
        budgetPointShareElement.parentElement.classList.remove('hidden');
    }
}
