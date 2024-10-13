import {formatBudgetPoints, formatBudgetPointsShare} from "../../../common/formatting";
import {MAX_BUDGET_POINTS} from "../../../common/casualChallengeLogic";
import {DeckStatistics, LegalityDetail, LegalityDetailStrings} from './deckStatistics';
import {MetaBar} from "../metaBar";

const sidebarClasses = {
    LEGALITY: 'sidebar-prices-price', // provided by Scryfall itself - used to keep layout
    OVERALL_LEGALITY: 'overall-legality',
    LEGALITY_STATUS: 'legality-status',
    DETAIL_LEGALITY: 'detail-legality',

    PRICE: 'sidebar-prices-price', // provided by Scryfall itself - used to keep layout
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

<span class="${sidebarClasses.LEGALITY} ${sidebarClasses.OVERALL_LEGALITY} hidden">
    <span class="">Is the deck legal?</span>
    <span class="${sidebarClasses.LEGALITY_STATUS} sidebar-prices-wildcards"></span>
</span>
<span class="${sidebarClasses.LEGALITY} ${sidebarClasses.DETAIL_LEGALITY} hidden"
      data-legality-detail="${LegalityDetail.MainboardSize}">
    <span class="">&geq;&thinsp;60 cards mainboard</span>
    <span class="${sidebarClasses.LEGALITY_STATUS} sidebar-prices-wildcards"></span>
</span>
<span class="${sidebarClasses.LEGALITY} ${sidebarClasses.DETAIL_LEGALITY} hidden"
      data-legality-detail="${LegalityDetail.SideboardSize}">
    <span class="">&leq;&thinsp;15 cards sideboard</span>
    <span class="${sidebarClasses.LEGALITY_STATUS} sidebar-prices-wildcards"></span>
</span>
<span class="${sidebarClasses.LEGALITY} ${sidebarClasses.DETAIL_LEGALITY} hidden"
      data-legality-detail="${LegalityDetail.BudgetPoints}">
    <span class="">&leq;&thinsp;${maxBP} budget points</span>
    <span class="${sidebarClasses.LEGALITY_STATUS} sidebar-prices-wildcards"></span>
</span>
<span class="${sidebarClasses.LEGALITY} ${sidebarClasses.DETAIL_LEGALITY} hidden"
      data-legality-detail="${LegalityDetail.CardLegality}">
    <span class="">Only legal cards included</span>
    <span class="${sidebarClasses.LEGALITY_STATUS} sidebar-prices-wildcards"></span>
</span>
`

const legalBadgeHtml = `<span class="currency-wildcard legal">Yes</span>`
const notLegalBadgeHtml = `<span class="currency-wildcard not-legal">No</span>`

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
        const overallLegalityElement = document.querySelector(`.${sidebarClasses.LEGALITY}.${sidebarClasses.OVERALL_LEGALITY}`);
        const overallLegalityStatusElement = overallLegalityElement.querySelector(`.${sidebarClasses.LEGALITY_STATUS}`);
        overallLegalityStatusElement.innerHTML = deckStatistics.isOverallLegal ? legalBadgeHtml : notLegalBadgeHtml;
        overallLegalityElement.classList.remove('hidden');

        for (const legalityDetailString in LegalityDetail) {
            const legalityDetail = LegalityDetail[legalityDetailString as LegalityDetailStrings];

            const legalityElement = document.querySelector(`.${sidebarClasses.LEGALITY}.${sidebarClasses.DETAIL_LEGALITY}[data-legality-detail="${legalityDetail}"]`);
            const legalityStatusElement = legalityElement.querySelector(`.${sidebarClasses.LEGALITY_STATUS}`);
            legalityStatusElement.innerHTML = deckStatistics.legalityDetails[legalityDetail] ? legalBadgeHtml : notLegalBadgeHtml;
            legalityElement.classList.remove('hidden');
        }

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
