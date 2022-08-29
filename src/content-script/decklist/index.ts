import '../../../styles/decklist-content.css';
import {StorageKeys, syncStorage} from "../../common/storage";
import {SerializableMap} from "../../common/SerializableMap";
import {DeckStatistics} from "./DeckStatistics";
import {formatBudgetPoints} from "../../common/formatting";
import {Sidebar} from "./Sidebar";
import {SearchControls} from "./SearchControls";
import {CheckMode, MetaBar} from "./types";
import {CardLoader} from "../CardLoader";
import {FullCard} from "../../common/card-representations";


const CONTENT_MODE_UNKNOWN = 'unknown';
const CONTENT_MODE_DECK_LIST = 'decklist';
const CONTENT_MODE_DECK_VISUAL = 'visual';
const CONTENT_MODE_SEARCH_IMAGES = 'search_images';

let contentMode = CONTENT_MODE_UNKNOWN;
let displayExtended: boolean = false;
let contentWasChecked = false;
let deckStatistics: DeckStatistics;
let metaBar: MetaBar;
let sidebar: Sidebar;
let searchControls: SearchControls;

// TODO refactor into interface and 1 implementation per content mode

function getDeckId() {
    const pathElements = location.pathname.split('/');
    return pathElements[pathElements.length - 1];
}

async function isCasualChallengeDeck() {
    switch (contentMode) {
        case CONTENT_MODE_SEARCH_IMAGES:
            return true;
    }

    const enabledDecks = await syncStorage.get<Map<string, CheckMode>>(StorageKeys.ENABLED_DECKS);

    // Deck was explicitly disabled for deck check
    if (enabledDecks !== null && (enabledDecks.get(getDeckId()) === 'disabled')) {
        console.log('isCasualChallengeDeck', 'Deck is disabled according to `enabledDecks` storage');
        return false;
    }

    // Check for matching deck titles for auto-enable
    const deckTitle = (document.querySelector('.deck-details-title') as HTMLElement).innerText;
    if (deckTitle.match(/Casual.{0,3}Challenge/i) !== null ||
        deckTitle.includes('CC') !== null /* Case-sensitive */) {
        console.log('isCasualChallengeDeck', 'Deck Title matches');
        // Synchronously store that this deck should have its deck check enabled
        // to prevent unexpected behavior when the deck name changes
        await storeCheckFlag('overlay');
        return true;
    }

    if (enabledDecks === null) {
        console.log('isCasualChallengeDeck', 'Unknown deck, just proceed without checks.');
        return false;
    } else {
        console.log('isCasualChallengeDeck', 'Found deck id in `enabledDecks` storage');
        return true;
    }
}

function initSidebar() {
    sidebar = new Sidebar();
    sidebar.init();

    sidebar.addDisabledButtonClickHandler(enableChecks);
    sidebar.addEnabledButtonClickHandler(disableChecks);

    metaBar = sidebar;
}

function initSearchControls(searchCheckMode: CheckMode) {
    searchControls = new SearchControls(searchCheckMode);
    searchControls.init();

    searchControls.setOnDisabledHandler(disableChecks);
    searchControls.setOnOverlayHandler(enableChecks);

    searchControls.hideLoadingIndicator();

    metaBar = searchControls;
}

function addGlobalClass(cssClass: string) {
    document.querySelector('#main').classList.add(cssClass);
}

function removeGlobalClass(cssClass: string) {
    document.querySelector('#main').classList.remove(cssClass);
}

async function init() {
    contentMode = detectContentMode();

    switch (contentMode) {
        case CONTENT_MODE_DECK_LIST:
            addGlobalClass('mode-deck-list');
            initSidebar();

            if (!await isCasualChallengeDeck()) {
                displayDisabled();
                return;
            }

            deckStatistics = new DeckStatistics();

            break;
        case CONTENT_MODE_DECK_VISUAL:
            addGlobalClass('mode-deck-visual');
            initSidebar();

            if (!await isCasualChallengeDeck()) {
                displayDisabled();
                return;
            }

            deckStatistics = new DeckStatistics();

            break;
        case CONTENT_MODE_SEARCH_IMAGES: {
            const searchCheckMode = await syncStorage.get<CheckMode>(StorageKeys.SEARCH_CHECK_MODE, 'disabled');

            initSearchControls(searchCheckMode);

            switch (searchCheckMode) {
                case 'overlay':
                    addGlobalClass('mode-search-images-overlay');
                    break;
                case 'disabled':
                    addGlobalClass('mode-search-images-disabled');
                    displayDisabled();
                    return;
            }

            deckStatistics = new DeckStatistics();

            break;
        }
        case CONTENT_MODE_UNKNOWN:
            // Not a supported view --> no legality check
            displayDisabled();
            return;
    }

    // TODO automatically adjust display when the value changes
    displayExtended = await syncStorage.get(StorageKeys.DISPLAY_EXTENDED, false);

    await checkDeck();
}

function detectContentMode() {
    if (location.pathname === '/search') {
        const modeSelector = document.querySelector('select#as') as HTMLInputElement;
        if (modeSelector !== null) {
            switch (modeSelector.value) {
                case 'grid':
                    return CONTENT_MODE_SEARCH_IMAGES;
            }
        }

        return CONTENT_MODE_UNKNOWN;
    }

    if (location.pathname.match(/\/decks\//)) {
        if (document.querySelectorAll('.deck-list').length !== 0) {
            return CONTENT_MODE_DECK_LIST;
        } else if (document.querySelectorAll('.card-grid').length !== 0) {
            return CONTENT_MODE_DECK_VISUAL;
        } else {
            return CONTENT_MODE_UNKNOWN;
        }
    }

    return CONTENT_MODE_UNKNOWN;
}

function checkDeck() {
    switch (contentMode) {
        case CONTENT_MODE_DECK_LIST:
        case CONTENT_MODE_DECK_VISUAL:
            document.querySelector('.deck').classList.add('casual-challenge-deck');
            break;
    }

    if (contentWasChecked) {
        // Just show our elements
        switch (contentMode) {
            case CONTENT_MODE_DECK_LIST:
                document.querySelectorAll('.deck-list-entry > .card-legality').forEach(element => {
                    element.classList.remove('hidden');
                });
                break;
            case CONTENT_MODE_DECK_VISUAL:
                document.querySelectorAll('.card-grid-item-card > .legality-overlay, .card-grid-item-card > .card-grid-item-legality')
                    .forEach(element => {
                        element.classList.remove('hidden');
                    });
                break;
            case CONTENT_MODE_SEARCH_IMAGES:
                removeGlobalClass('mode-search-images-disabled');
                addGlobalClass('mode-search-images-overlay');
                document.querySelectorAll('.card-grid-item-card > .legality-overlay, .card-grid-item-card > .card-grid-item-legality')
                    .forEach(element => {
                        element.classList.remove('hidden');
                    });
                break;
        }

        displayEnabled();
        return Promise.resolve();
    }

    let templateFn: (cssClass: string, text: string, html?: string) => string;
    switch (contentMode) {
        case CONTENT_MODE_DECK_LIST: {
            templateFn = (cssClass, text, html = '') => `<dl class="card-legality">
<dd class="${cssClass}" title="${text}">${text}${html}</dd></dl>`;
            break;
        }
        case CONTENT_MODE_DECK_VISUAL:
        case CONTENT_MODE_SEARCH_IMAGES:
            templateFn = (cssClass, text, html = '') => `<div class="legality-overlay ${cssClass}"></div>
<span class="card-grid-item-count card-grid-item-legality ${cssClass}">${text}${html}</span>`;
            break;
    }

    const loadingTemplate = document.createElement('template');
    const legalTemplate = document.createElement('template');
    const notLegalTemplate = document.createElement('template');
    const bannedTemplate = document.createElement('template');
    const extendedTemplate = document.createElement('template');
    loadingTemplate.innerHTML = templateFn('loading', '', '<div class="dot-flashing"></div>');
    legalTemplate.innerHTML = templateFn('legal', 'Legal');
    notLegalTemplate.innerHTML = templateFn('not-legal', 'Not Legal');
    bannedTemplate.innerHTML = templateFn('banned', 'Banned');
    extendedTemplate.innerHTML = templateFn('extended', 'Extended');

    const cardLoader = new CardLoader();

    switch (contentMode) {
        case CONTENT_MODE_DECK_LIST:
            document.querySelectorAll('.deck-list-entry').forEach((deckListEntry: HTMLElement) => {
                const cardId = deckListEntry.dataset.cardId;
                const cardCount = parseInt(deckListEntry.querySelector('.deck-list-entry-count').textContent);

                // We need some more infos about the card, so lets queue it for loading
                deckListEntry.append(loadingTemplate.content.cloneNode(true));
                deckListEntry.classList.add('loading');

                cardLoader.register(cardId).then(card => {
                    deckStatistics.addEntry(card, cardCount);
                    appendToDeckListEntryRow(
                        deckListEntry,
                        card,
                        legalTemplate,
                        notLegalTemplate,
                        bannedTemplate,
                        extendedTemplate
                    );

                    const formattedBP = formatBudgetPoints(card.budgetPoints * cardCount);
                    deckListEntry.querySelector('.deck-list-entry-axial-data').innerHTML =
                        `<span class="currency-eur">${formattedBP}</span>`
                });
            });

            sidebar.renderDeckStatistics(deckStatistics);

            break;
        case CONTENT_MODE_DECK_VISUAL:
            document.querySelectorAll('.card-grid-item').forEach((deckListEntry: HTMLElement) => {
                if (deckListEntry.classList.contains('flexbox-spacer')) {
                    return;
                }
                const cardId = deckListEntry.dataset.cardId;
                const cardItem = deckListEntry.querySelector('.card-grid-item-card') as HTMLElement;
                const cardCountText = deckListEntry.querySelector('.card-grid-item-count').textContent;
                const cardCount = parseInt(cardCountText.replace(/[^\d]/g, ''));

                cardItem.append(loadingTemplate.content.cloneNode(true));
                cardItem.classList.add('loading');

                cardLoader.register(cardId).then(card => {
                    deckStatistics.addEntry(card, cardCount);
                    appendToDeckListEntryImage(
                        deckListEntry,
                        card,
                        legalTemplate,
                        notLegalTemplate,
                        bannedTemplate,
                        extendedTemplate
                    );

                    const formattedBP = formatBudgetPoints(card.budgetPoints * cardCount);
                    cardItem.insertAdjacentHTML('beforeend',
                        `<span class="card-grid-item-count card-grid-item-budget-points">${formattedBP} BP</span>`);
                });
            });

            sidebar.renderDeckStatistics(deckStatistics);
            break;
        case CONTENT_MODE_SEARCH_IMAGES:
            document.querySelectorAll('.card-grid-item').forEach((deckListEntry: HTMLElement) => {
                if (deckListEntry.classList.contains('flexbox-spacer')) {
                    return;
                }

                const cardId = deckListEntry.dataset.cardId;
                const cardItem = deckListEntry.querySelector('.card-grid-item-card') as HTMLElement;

                cardItem.append(loadingTemplate.content.cloneNode(true));
                cardItem.classList.add('loading');

                cardLoader.register(cardId).then(card => {
                    appendToDeckListEntryImage(
                        deckListEntry,
                        card,
                        legalTemplate,
                        notLegalTemplate,
                        bannedTemplate,
                        extendedTemplate
                    );
                    const formattedBP = formatBudgetPoints(card.budgetPoints);
                    cardItem.insertAdjacentHTML('beforeend',
                        `<span class="card-grid-item-count card-grid-item-budget-points">${formattedBP} BP</span>`)
                });
            });

            break;
    }

    cardLoader.start().then(() => {
        displayEnabled();
        contentWasChecked = true;
    });
}

function appendToDeckListEntryImage(
    deckListEntry: HTMLElement,
    card: FullCard,
    legalTemplate: HTMLTemplateElement,
    notLegalTemplate: HTMLTemplateElement,
    bannedTemplate: HTMLTemplateElement,
    extendedTemplate: HTMLTemplateElement
) {
    deckListEntry.querySelector('.legality-overlay').remove();
    deckListEntry.querySelector('.card-grid-item-legality').remove();
    const cardItem = deckListEntry.querySelector('.card-grid-item-card') as HTMLElement;
    modifyCardItem(cardItem, card, legalTemplate, notLegalTemplate, bannedTemplate, extendedTemplate);
}

function appendToDeckListEntryRow(
    deckListEntry: HTMLElement,
    card: FullCard,
    legalTemplate: HTMLTemplateElement,
    notLegalTemplate: HTMLTemplateElement,
    bannedTemplate: HTMLTemplateElement,
    extendedTemplate: HTMLTemplateElement
) {
    deckListEntry.querySelector('.card-legality').remove();
    modifyCardItem(deckListEntry, card, legalTemplate, notLegalTemplate, bannedTemplate, extendedTemplate);
}

function modifyCardItem(
    cardItem: HTMLElement,
    card: FullCard,
    legalTemplate: HTMLTemplateElement,
    notLegalTemplate: HTMLTemplateElement,
    bannedTemplate: HTMLTemplateElement,
    extendedTemplate: HTMLTemplateElement
) {
    cardItem.classList.remove('loading');

    if (card.legalities.vintage !== 'legal') {
        cardItem.append(notLegalTemplate.content.cloneNode(true));
        cardItem.classList.add('not-legal');
    } else if (card.banStatus === 'banned' || isBannedInAnyFormat(card)) {
        cardItem.append(bannedTemplate.content.cloneNode(true));
        cardItem.classList.add('banned');
    } else if (displayExtended && card.banStatus === 'extended') {
        cardItem.append(extendedTemplate.content.cloneNode(true));
        cardItem.classList.add('extended');
    } else {
        cardItem.append(legalTemplate.content.cloneNode(true));
        cardItem.classList.add('legal');
    }
}

/**
 * Only looks at Casual Challenge relevant formats.
 */
function isBannedInAnyFormat(card: FullCard) {
    const legalities = card.legalities;
    return legalities.standard === 'banned' ||
        legalities.pioneer === 'banned' ||
        legalities.modern === 'banned' ||
        legalities.legacy === 'banned' ||
        legalities.vintage === 'banned' ||
        legalities.pauper === 'banned';
}

function displayLoading() {
    console.log('isEnabled', 'loading');

    switch (contentMode) {
        case CONTENT_MODE_SEARCH_IMAGES:
            return;
    }

    metaBar.displayLoading();
}

function displayEnabled() {
    console.log('isEnabled', true);

    switch (contentMode) {
        case CONTENT_MODE_SEARCH_IMAGES:
            return;
    }

    metaBar.displayEnabled();
}

function displayDisabled() {
    console.log('isEnabled', false);

    switch (contentMode) {
        case CONTENT_MODE_SEARCH_IMAGES:
            return;
    }

    metaBar.displayDisabled();
}

function storeCheckFlag(newValue: CheckMode) {
    switch (contentMode) {
        case CONTENT_MODE_DECK_LIST:
        case CONTENT_MODE_DECK_VISUAL:
            return syncStorage.get<Map<string, CheckMode>>(StorageKeys.ENABLED_DECKS)
                .then(enabledDecks => {
                    if (enabledDecks === null) {
                        enabledDecks = new SerializableMap<string, CheckMode>();
                    }
                    enabledDecks.set(getDeckId(), newValue);

                    return syncStorage.set(StorageKeys.ENABLED_DECKS, enabledDecks);
                });
        case CONTENT_MODE_SEARCH_IMAGES:
            return syncStorage.set(StorageKeys.SEARCH_CHECK_MODE, newValue);
        default:
            // Not a deck --> nothing to do
            return Promise.resolve();
    }
}

function enableChecks() {
    displayLoading();
    storeCheckFlag('overlay')
        .then(() => {
            if (contentMode === CONTENT_MODE_DECK_LIST &&
                (document.getElementById('with') as HTMLInputElement).value !== 'eur') { // showing euros?
                // ... otherwise: switch to correct view
                const queryParameters = new URLSearchParams(location.search);
                queryParameters.set('with', 'eur');
                location.search = queryParameters.toString();
            } else {
                return checkDeck();
            }
        });
}

function disableChecks() {
    displayLoading();
    storeCheckFlag('disabled')
        .then(() => {
            if (contentWasChecked) {
                // Hide everything we added
                let elementsToHideSelector = null;
                switch (contentMode) {
                    case CONTENT_MODE_DECK_LIST:
                        document.querySelector('.deck').classList.remove('casual-challenge-deck');
                        elementsToHideSelector = '.deck-list-entry > .card-legality';
                        break;
                    case CONTENT_MODE_DECK_VISUAL:
                        document.querySelector('.deck').classList.remove('casual-challenge-deck');
                        elementsToHideSelector =
                            `.card-grid-item-card > .legality-overlay,
                            .card-grid-item-card > .card-grid-item-legality`;
                        break;
                    case CONTENT_MODE_SEARCH_IMAGES:
                        removeGlobalClass('mode-search-images-overlay');
                        addGlobalClass('mode-search-images-disabled');
                        elementsToHideSelector =
                            `.card-grid-item-card > .legality-overlay,
                            .card-grid-item-card > .card-grid-item-legality,
                            .card-grid-item-card > .card-grid-item-budget-points`;
                        break;
                }

                if (elementsToHideSelector !== null) {
                    document.querySelectorAll(elementsToHideSelector).forEach(element => {
                        element.classList.add('hidden');
                    });
                }
            }

            displayDisabled();
        });
}

// noinspection JSIgnoredPromiseFromCall
init();
