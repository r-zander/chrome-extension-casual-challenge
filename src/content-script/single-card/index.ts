import '../../../styles/single-card-content.css';
import {BanFormats, Legalities, SingleBanResponse} from "../../common/types";
import {deserialize} from "../../common/serialization";

function init(): void {
    const cardNameElement: HTMLElement = document.querySelector('head > meta[property="og:title"]');
    const cardName = cardNameElement.getAttribute('content').trim();

    chrome.runtime.sendMessage(
        {action: 'get/ban/card', cardName: cardName},
        (banStatus) => {
            if (chrome.runtime.lastError) {
                console.error('Error while fetching ban status.', chrome.runtime.lastError);
                return;
            }

            displayLegality(deserialize(banStatus));
        });
}

function displayLegality(banStatus: SingleBanResponse): void {
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
    } else if (banStatus.banStatus === 'banned') {
        appendLegalityElement('banned', 'Banned',
            'Played in ' + formatsToString(banStatus.formats) + ' competitive decks');
    } else {
        const bannedInFormats = bannedFormats(legalities);
        if (bannedInFormats.length > 0) {
            const now = new Date();
            if (now >= new Date(2022, 5, 1)) {
                appendLegalityElement('banned', 'Banned',
                    'Banned in ' + bannedInFormats.join(', ') + '');
            } else {
                appendLegalityElement('future-banned', 'Future Banned',
                    'From 01. June it will be banned, because it\'s banned in ' + bannedInFormats.join(', ') + '');
            }
        } else if (banStatus.banStatus === 'extended') {
            appendLegalityElement('extended', 'Extended',
                'Played in ' + formatsToString(banStatus.formats) + ' competitive decks');
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
