import '../../../styles/single-card-content.css';
import {BanFormats, Legalities, SingleCardResponse} from "../../common/types";
import {deserialize} from "../../common/serialization";
import {formatBudgetPoints} from "../../common/formatting";

function init(): void {
    const cardNameElement: HTMLElement = document.querySelector('head > meta[property="og:title"]');
    const cardName = cardNameElement.getAttribute('content').trim();

    chrome.runtime.sendMessage(
        {action: 'get/card/info', cardName: cardName},
        (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error while fetching ban status.', chrome.runtime.lastError);
                return;
            }

            const cardInfo: SingleCardResponse = deserialize(response)

            displayLegality(cardInfo.banStatus, cardInfo.banFormats);
            displayBudgetPoints(cardInfo.budgetPoints);
        });
}

function displayBudgetPoints(budgetPoints: number) {
    const printsTables = document.querySelectorAll('.prints > .prints-table');
    const lastPrintTable = printsTables.item(printsTables.length - 1);
    const formattedBP = formatBudgetPoints(budgetPoints);
    const html = `
<table class="prints-table">
    <thead>
        <tr>
            <th>
                <span>Casual Challenge</span>
            </th>
            <th style="white-space: nowrap;">
                <span>BP</span>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <span style="cursor: inherit;">Budget Points</span>
            </td>
            <td>
                <span style="cursor: inherit; white-space: nowrap">${formattedBP}</span>
            </td>
        </tr>                                                        
    </tbody>
</table>`;

    lastPrintTable.insertAdjacentHTML('afterend', html);
}

function displayLegality(banStatus: string, banFormats: BanFormats): void {
    const legalities: Legalities = {};
    // let vintageLegality;
    document.querySelectorAll('.card-legality-item > dt').forEach((formatElement: HTMLElement) => {
        // if (formatElement.innerText.trim() === 'Vintage') {
        //     vintageLegality = formatElement.nextElementSibling.classList.item(0);
        // }

        legalities[formatElement.innerText.trim()] = formatElement.nextElementSibling.classList.item(0);
    });

    if (legalities['Vintage'] !== 'legal') {
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
            appendLegalityElement('extended', 'Extended',
                'Played in ' + formatsToString(banFormats) + ' competitive decks');
        } else {
            appendLegalityElement('legal', 'Legal',
                'There are no bans and the card is legal in Vintage.');
        }
    }
}

/**
 * Only looks at Casual Challenge relevant formats.
 */
function bannedFormats(legalities: Legalities): string[] {
    const bannedInFormats: string[] = [];
    ['Standard', 'Pioneer', 'Modern', 'Legacy', 'Vintage', 'Pauper'].forEach(format => {
        if (legalities[format] === 'banned') {
            bannedInFormats.push(format);
        }
    });

    return bannedInFormats;
}

function formatsToString(formats: BanFormats): string {
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

init();
