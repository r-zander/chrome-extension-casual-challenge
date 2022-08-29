import '../../../styles/single-card-content.css';
import {formatBudgetPoints, formatBudgetPointsShare} from "../../common/formatting";
import {StorageKeys, syncStorage} from "../../common/storage";
import {CardLoader} from "../CardLoader";
import {Format} from "scryfall-api";
import {PaperLegalities} from "../../common/card-representations";

let displayExtended: boolean = false;

async function init(): Promise<void> {
    const cardIdElement: HTMLElement = document.querySelector('head > meta[name="scryfall:card:id"]');
    const cardId = cardIdElement.getAttribute('content').trim();

    displayExtended = await syncStorage.get(StorageKeys.DISPLAY_EXTENDED, false);

    const cardLoader = new CardLoader();
    const fullCard = await cardLoader.loadSingle(cardId)

    displayLegality(fullCard.banStatus, fullCard.banFormats, fullCard.legalities);
    displayBudgetPoints(fullCard.budgetPoints);
}

function displayBudgetPoints(budgetPoints: number) {
    const printsTables = document.querySelectorAll('.prints > .prints-table');
    const lastPrintTable = printsTables.item(printsTables.length - 1);
    const formattedBP = formatBudgetPoints(budgetPoints);
    const formattedPercentage = formatBudgetPointsShare(budgetPoints);
    const html = `
<table class="prints-table">
    <thead>
        <tr>
            <th>
                <span>Casual Challenge</span>
            </th>
            <th>
                <span>BP</span>
            </th>
            <th>
                <span>%</span>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <span style="cursor: inherit;">Budget Points</span>
            </td>
            <td>
                <span class="currency-eur" style="cursor: inherit;">${formattedBP}</span>
            </td>
            <td>
                <span class="currency-usd" style="cursor: inherit">${formattedPercentage}</span>
            </td>
        </tr>                                                        
    </tbody>
</table>`;

    lastPrintTable.insertAdjacentHTML('afterend', html);
}

function displayLegality(banStatus: string, banFormats: Map<keyof typeof Format, number>, legalities: PaperLegalities): void {
    if (legalities.vintage !== 'legal') {
        appendLegalityElement('not-legal', 'Not Legal',
            'This card is not fully legal in Vintage.');
    } else if (banStatus === 'banned') {
        appendLegalityElement('banned', 'Banned',
            'Played in ' + formatsToString(banFormats) + ' competitive decks');
    } else {
        const bannedInFormats = bannedFormats(legalities);

        if (bannedInFormats.length > 0) {
            appendLegalityElement('banned', 'Banned',
                'Banned in ' + bannedInFormats.join(', ') + '');
        } else if (banStatus === 'extended') {
            if (displayExtended) {
                appendLegalityElement('extended', 'Extended',
                    'Played in ' + formatsToString(banFormats) + ' competitive decks');
            } else {
                // Don't show "Extended" but still provide the user with format usage information
                appendLegalityElement('legal', 'Legal',
                    'Played in ' + formatsToString(banFormats) + ' competitive decks');
            }
        } else {
            appendLegalityElement('legal', 'Legal',
                'There are no bans and the card is legal in Vintage.');
        }
    }
}

/**
 * Only looks at Casual Challenge relevant formats.
 */
function bannedFormats(legalities: PaperLegalities): string[] {
    const bannedInFormats: string[] = [];
    if (legalities.standard === 'banned') {
        bannedInFormats.push('Standard');
    }
    if (legalities.pioneer === 'banned') {
        bannedInFormats.push('Pioneer');
    }
    if (legalities.modern === 'banned') {
        bannedInFormats.push('Modern');
    }
    if (legalities.legacy === 'banned') {
        bannedInFormats.push('Legacy');
    }
    if (legalities.vintage === 'banned') {
        bannedInFormats.push('Vintage');
    }
    if (legalities.pauper === 'banned') {
        bannedInFormats.push('Pauper');
    }

    return bannedInFormats;
}

function formatsToString(formats: Map<keyof typeof Format, number>): string {
    let result = '';
    for (const [format, deckPercentage] of Object.entries(formats)) {
        if (result.length > 0) {
            result += ', '
        }
        result += (deckPercentage * 100).toFixed(0) + '% of ' + format
    }

    return result;
}

function appendLegalityElement(cssClass: string, text: string, explanation: string): void {
    const template = document.createElement('template');
    template.innerHTML =
        `<div class="card-legality-item">
            <dt title="Casual Challenge">Casual Challenge</dt>
            <dd title="${explanation}" class="${cssClass}">${text}</dd>
         </div>`

    const cardLegalityRow = document.querySelector('.card-legality-row:last-child');
    if (cardLegalityRow.children.length === 1) {
        cardLegalityRow.append(template.content);
    } else {
        const newRow = document.createElement('template');
        newRow.innerHTML = '<div class="card-legality-row"></div>'
        newRow.content.firstElementChild.append(template.content);
        cardLegalityRow.after(newRow.content);
    }
}

// noinspection JSIgnoredPromiseFromCall
init();
