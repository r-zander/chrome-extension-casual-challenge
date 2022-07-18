import '../../../styles/decklist-content.css';
import {BanListResponse, Bans, Card, ScryfallUUID} from "../../common/types";
import {localStorage, StorageKeys, syncStorage} from "../../common/storage";
import {deserialize} from "../../common/serialization";
import {SerializableMap} from "../../common/SerializableMap";


// 7 days aka 1 week (mostly)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

const CONTENT_MODE_UNKNOWN = 'unknown';

const CONTENT_MODE_DECK_LIST = 'decklist';
const CONTENT_MODE_DECK_VISUAL = 'visual';
const CONTENT_MODE_SEARCH_IMAGES = 'search_images';

let loadingIndicator: HTMLElement,
    disabledButton: HTMLElement,
    enabledButton: HTMLElement;
let contentMode = CONTENT_MODE_UNKNOWN;
let contentWasChecked = false;

type CheckMode = ('disabled' | 'overlay');

type LoadableCards = Map<ScryfallUUID, HTMLElement[]>;

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
    console.log(enabledDecks);

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
    const sidebarTemplate = document.createElement('template');
    sidebarTemplate.innerHTML = `
    <div class="sidebar-toolbox casual-challenge">
         <h2 class="sidebar-header">Casual Challenge</h2>
         <div class="casual-challenge-checks-loading button-n tiny"><div class="dot-flashing"></div></div>
         <button class="casual-challenge-checks-disabled button-n tiny hidden">Enable checks</button>
         <button class="casual-challenge-checks-enabled button-n primary tiny hidden">Disable checks</button>
    </div>`;

    // The sidebar already is set to display 'loading', no need to adjust the mode
    document.querySelector('.sidebar-prices').after(sidebarTemplate.content);

    loadingIndicator = document.querySelector('.casual-challenge-checks-loading');
    disabledButton = document.querySelector('.casual-challenge-checks-disabled');
    enabledButton = document.querySelector('.casual-challenge-checks-enabled');

    disabledButton.addEventListener('click', () => {
        enableChecks();
    });
    enabledButton.addEventListener('click', () => {
        disableChecks();
    });
}

function initSearchControls(searchCheckMode: CheckMode) {
    const searchControlTemplate = document.createElement('template');
    searchControlTemplate.innerHTML = `
    <div class="search-controls-casual-challenge">
         <div class="casual-challenge-checks-loading button-n tiny"><div class="dot-flashing"></div></div>
         <select id="check" title="Change how cards are checked for Casual Challenge" class="select-n">
            <option ` + (searchCheckMode === 'disabled' ? 'selected="selected" ' : '') + `value="disabled">Disable</option>
            <option ` + (searchCheckMode === 'overlay' ? 'selected="selected" ' : '') + `value="overlay">Overlay</option>
        </select>
         <label for="order">checks</label>
    </div>`;

    document.querySelector('.search-controls-inner > .search-controls-display-options').after(searchControlTemplate.content);

    const checkModeSelect = document.getElementById('check') as HTMLInputElement;
    checkModeSelect.addEventListener('change', () => {
        switch (checkModeSelect.value) {
            case 'disabled':
                disableChecks();
                break;
            case 'overlay':
                enableChecks();
                break;
        }
    })

    loadingIndicator = document.querySelector('.casual-challenge-checks-loading');
    loadingIndicator.classList.add('hidden');
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
            break;
        case CONTENT_MODE_DECK_VISUAL:
            addGlobalClass('mode-deck-visual');
            initSidebar();

            if (!await isCasualChallengeDeck()) {
                displayDisabled();
                return;
            }
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
            break;
        }
        case CONTENT_MODE_UNKNOWN:
            // Not a supported view --> no legality check
            displayDisabled();
            return;
    }

    // Deck title contains 'Casual Challenge' so we can start.
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

function cardNameContainedInList(indexedList: Bans, cardName: string) {
    // console.log('indexedList', indexedList);
    if (indexedList.has(cardName)) {
        return true;
    }

    cardName = cardName.split('//')[0].trim();
    return indexedList.has(cardName);
}

function isBanned(banList: BanListResponse, cardName: string) {
    return cardNameContainedInList(banList.bans, cardName);
}

function isExtendedBanned(banList: BanListResponse, cardName: string) {
    return cardNameContainedInList(banList.extended, cardName);
}

function addLegalityElement(
    banList: BanListResponse,
    cardName: string,
    cardItem: HTMLElement,
    bannedTemplate: HTMLTemplateElement,
    extendedTemplate: HTMLTemplateElement,
    loadingTemplate: HTMLTemplateElement,
    cardsToLoad: LoadableCards,
    deckListEntry: HTMLElement
) {
    if (isBanned(banList, cardName)) {
        cardItem.append(bannedTemplate.content.cloneNode(true));
        cardItem.classList.add('banned');
    } else if (isExtendedBanned(banList, cardName)) {
        cardItem.append(extendedTemplate.content.cloneNode(true));
        cardItem.classList.add('extended');
    } else {
        // We need some more infos about the card, so lets queue it for loading
        cardItem.append(loadingTemplate.content.cloneNode(true));
        cardItem.classList.add('loading');
    }

    // Load every card --> make sure that not-legal and (implicitly) banned are correctly shown
    if (cardsToLoad.has(deckListEntry.dataset.cardId)) {
        cardsToLoad.get(deckListEntry.dataset.cardId).push(deckListEntry);
    } else {
        cardsToLoad.set(deckListEntry.dataset.cardId, [deckListEntry]);
    }
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
    const futureBannedTemplate = document.createElement('template');
    loadingTemplate.innerHTML = templateFn('loading', '', '<div class="dot-flashing"></div>');
    legalTemplate.innerHTML = templateFn('legal', 'Legal');
    notLegalTemplate.innerHTML = templateFn('not-legal', 'Not Legal');
    bannedTemplate.innerHTML = templateFn('banned', 'Banned');
    extendedTemplate.innerHTML = templateFn('extended', 'Extended');
    const futureBannedClass = 'banned';
    futureBannedTemplate.innerHTML = templateFn('banned', 'Banned');

    const cardsToLoad: LoadableCards = new Map<string, HTMLElement[]>();

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({action: 'get/ban/list'}, (banlist) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }

            // TODO deserialize SerializableMap
            // TODO everywhere when interacting with the chrome API

            resolve(banlist);
        });
    })
        .then(deserialize)
        .then((banList: BanListResponse) => {
            console.log('Received Casual Challenge ban list: ', banList);

            switch (contentMode) {
                case CONTENT_MODE_DECK_LIST:
                    document.querySelectorAll('.deck-list-entry').forEach((deckListEntry: HTMLElement) => {
                        const cardName = (deckListEntry.querySelector('.deck-list-entry-name') as HTMLElement).innerText.trim();
                        addLegalityElement(
                            banList,
                            cardName,
                            deckListEntry,
                            bannedTemplate,
                            extendedTemplate,
                            loadingTemplate,
                            cardsToLoad,
                            deckListEntry,
                        );
                    });
                    break;
                case CONTENT_MODE_DECK_VISUAL:
                case CONTENT_MODE_SEARCH_IMAGES:
                    document.querySelectorAll('.card-grid-item').forEach((deckListEntry: HTMLElement) => {
                        if (deckListEntry.classList.contains('flexbox-spacer')) {
                            return;
                        }

                        const cardName = (deckListEntry.querySelector('.card-grid-item-invisible-label') as HTMLElement).innerText.trim();
                        const cardItem = deckListEntry.querySelector('.card-grid-item-card') as HTMLElement;
                        addLegalityElement(
                            banList,
                            cardName,
                            cardItem,
                            bannedTemplate,
                            extendedTemplate,
                            loadingTemplate,
                            cardsToLoad,
                            deckListEntry,
                        );
                    });
                    break;
            }

            if (cardsToLoad.size === 0) {
                return Promise.resolve();
            }
            const cardIdsToLoad = Array.from(cardsToLoad.keys());

            return loadCardsThroughCache(cardIdsToLoad)
                .then(loadedCards => {
                    loadedCards.forEach(cardObject => {
                        const cardId = cardObject.id;
                        const deckListEntry = cardsToLoad.get(cardId);
                        let appendToDeckListEntry: typeof appendToDeckListEntryRow;
                        switch (contentMode) {
                            case CONTENT_MODE_DECK_LIST:
                                appendToDeckListEntry = appendToDeckListEntryRow;
                                break;
                            case CONTENT_MODE_DECK_VISUAL:
                            case CONTENT_MODE_SEARCH_IMAGES:
                                appendToDeckListEntry = appendToDeckListEntryImage;
                                break;
                        }

                        if (Array.isArray(deckListEntry)) {
                            deckListEntry.forEach((entry) => {
                                appendToDeckListEntry(
                                    entry,
                                    cardObject,
                                    legalTemplate,
                                    futureBannedTemplate,
                                    futureBannedClass,
                                    notLegalTemplate,
                                    banList,
                                    bannedTemplate,
                                    extendedTemplate);
                            });
                        } else {
                            appendToDeckListEntry(
                                deckListEntry,
                                cardObject,
                                legalTemplate,
                                futureBannedTemplate,
                                futureBannedClass,
                                notLegalTemplate,
                                banList,
                                bannedTemplate,
                                extendedTemplate);
                        }
                    });
                });
        })
        .then(() => {
            displayEnabled();
            contentWasChecked = true;
        });
}

function appendToDeckListEntryImage(
    deckListEntry: HTMLElement,
    cardObject: Card,
    legalTemplate: HTMLTemplateElement,
    futureBannedTemplate: HTMLTemplateElement,
    futureBannedClass: string,
    notLegalTemplate: HTMLTemplateElement,
    banList: BanListResponse,
    bannedTemplate: HTMLTemplateElement,
    extendedTemplate: HTMLTemplateElement
) {
    deckListEntry.querySelector('.legality-overlay').remove();
    deckListEntry.querySelector('.card-grid-item-legality').remove();
    const cardItem = deckListEntry.querySelector('.card-grid-item-card') as HTMLElement;
    modifyCardItem(cardItem, cardObject, legalTemplate, futureBannedTemplate, futureBannedClass,
        notLegalTemplate, banList, bannedTemplate, extendedTemplate);
}

function appendToDeckListEntryRow(
    deckListEntry: HTMLElement,
    cardObject: Card,
    legalTemplate: HTMLTemplateElement,
    futureBannedTemplate: HTMLTemplateElement,
    futureBannedClass: string,
    notLegalTemplate: HTMLTemplateElement,
    banList: BanListResponse,
    bannedTemplate: HTMLTemplateElement,
    extendedTemplate: HTMLTemplateElement
) {
    deckListEntry.querySelector('.card-legality').remove();
    modifyCardItem(deckListEntry, cardObject, legalTemplate, futureBannedTemplate, futureBannedClass,
        notLegalTemplate, banList, bannedTemplate, extendedTemplate)
}

function modifyCardItem(
    cardItem: HTMLElement,
    cardObject: Card,
    legalTemplate: HTMLTemplateElement,
    futureBannedTemplate: HTMLTemplateElement,
    futureBannedClass: string,
    notLegalTemplate: HTMLTemplateElement,
    banList: BanListResponse,
    bannedTemplate: HTMLTemplateElement,
    extendedTemplate: HTMLTemplateElement
) {
    cardItem.classList.remove('loading');

    if (cardObject.legalities.vintage !== 'legal') {
        cardItem.append(notLegalTemplate.content.cloneNode(true));
        cardItem.classList.add('not-legal');
    } else if (isBanned(banList, cardObject.name)) {
        cardItem.append(bannedTemplate.content.cloneNode(true));
        cardItem.classList.add('banned');
    } else if (isBannedInAnyFormat(cardObject)) {
        cardItem.append(futureBannedTemplate.content.cloneNode(true));
        cardItem.classList.add(futureBannedClass);
    } else if (isExtendedBanned(banList, cardObject.name)) {
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
function isBannedInAnyFormat(cardObject: Card) {
    const legalities = cardObject.legalities;
    return legalities.standard === 'banned' ||
        legalities.pioneer === 'banned' ||
        legalities.modern === 'banned' ||
        legalities.legacy === 'banned' ||
        legalities.vintage === 'banned' ||
        legalities.pauper === 'banned';
}

function loadCardsThroughCache(cardIdsToLoad: ScryfallUUID[]) {
    const loadedCards: Card[] = [];
    const remainingIds: string[] = [];
    let cardCache: Map<ScryfallUUID, Card>;
    // Keep a reference in case we need to clear the cache
    let apiLoadedCards: Card[];

    return localStorage.get<Map<ScryfallUUID, Card>>(StorageKeys.CARD_CACHE)
        .then(cardCacheFromStorage => {
            const now = Date.now();

            if (cardCacheFromStorage === null) {
                // AddAll cardIdsToLoad to remainingIds
                Array.prototype.push.apply(remainingIds, cardIdsToLoad);
                // Create new cache object
                cardCache = new SerializableMap<ScryfallUUID, Card>();
            } else {
                cardCache = cardCacheFromStorage;

                // Each card id either ends up either in the loadedCards (because
                // it was found fresh in cache.
                // Or in the remainingIds to be loaded in the next step.
                cardIdsToLoad.forEach(cardId => {
                    if (!cardCache.has(cardId)) {
                        // Not found in cache --> load
                        remainingIds.push(cardId);
                        return;
                    }

                    const cardObject = cardCache.get(cardId);
                    if ((now - cardObject.cachedAt) < CACHE_DURATION) {
                        loadedCards.push(cardObject);
                    } else {
                        // Stale entry --> remove & reload
                        console.log('Data was stale.');
                        cardCache.delete(cardId);
                        remainingIds.push(cardId);
                    }
                });

                if (remainingIds.length === 0) {
                    return Promise.resolve(loadedCards);
                }
            }

            console.log('About to load ' + remainingIds.length + ' cards via API', remainingIds);
            const identifiersToLoad = remainingIds.map(cardId => {
                return {id: cardId};
            });

            return fetch('https://api.scryfall.com/cards/collection',
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    // TODO support more than 75 cards by paging?
                    body: '{"identifiers": ' + JSON.stringify(identifiersToLoad.slice(0, 75)) + ' }',
                },
            )
                .then(response => response.json())
                // TODO handle not found
                .then(collection => collection.data)
                .then(fromApi => {
                    console.log('Loaded ' + fromApi.length + ' cards via API', fromApi);
                    fromApi.forEach((cardObject: Card) => {
                        cardObject.cachedAt = now;
                        cardCache.set(cardObject.id, cardObject);
                    });

                    apiLoadedCards = fromApi;

                    return loadedCards.concat(fromApi);
                });
        })
        .then(loadedCards => {
            // Store modified cache object
            return localStorage.set(StorageKeys.CARD_CACHE, cardCache)
                // Pass loadedCards outside
                .then(() => {
                    return loadedCards
                })
                .catch((error) => {
                    if (error.toString() === 'Error: QUOTA_BYTES quota exceeded') {
                        console.log('Cleaning out old cards from cache.')
                        // Cache got too big --> delete it, and just store the newest batch of cards
                        return chrome.storage.local.remove(StorageKeys.CARD_CACHE)
                            .then(() => {
                                cardCache = new SerializableMap<ScryfallUUID, Card>();
                                apiLoadedCards.forEach(cardObject => {
                                    cardCache.set(cardObject.id, cardObject);
                                });

                                return localStorage.set(StorageKeys.CARD_CACHE, cardCache)
                            })
                            .then(() => {
                                return loadedCards;
                            })
                    }
                    console.error('Unknown error while writing card cache', error);
                });
        });
}

function displayLoading() {
    console.log('isEnabled', 'loading');

    switch (contentMode) {
        case CONTENT_MODE_SEARCH_IMAGES:
            return;
    }

    loadingIndicator.classList.remove('hidden');
    disabledButton.classList.add('hidden');
    enabledButton.classList.add('hidden');
}

function displayEnabled() {
    console.log('isEnabled', true);

    switch (contentMode) {
        case CONTENT_MODE_SEARCH_IMAGES:
            return;
    }

    loadingIndicator.classList.add('hidden');
    disabledButton.classList.add('hidden');
    enabledButton.classList.remove('hidden');
}

function displayDisabled() {
    console.log('isEnabled', false);

    switch (contentMode) {
        case CONTENT_MODE_SEARCH_IMAGES:
            return;
    }

    if (typeof loadingIndicator !== 'undefined') loadingIndicator.classList.add('hidden');
    if (typeof disabledButton !== 'undefined') disabledButton.classList.remove('hidden');
    if (typeof enabledButton !== 'undefined') enabledButton.classList.add('hidden');
}

function storeCheckFlag(newValue: CheckMode) {
    switch (contentMode) {
        case CONTENT_MODE_DECK_LIST:
        case CONTENT_MODE_DECK_VISUAL:
            return syncStorage.get<Map<string, CheckMode>>(StorageKeys.ENABLED_DECKS)
                .then(enabledDecks => {
                    console.log('storeCheckFlag got enabledDecks', enabledDecks);
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
                    // Intended Fallthrough
                    case CONTENT_MODE_SEARCH_IMAGES:
                        removeGlobalClass('mode-search-images-overlay');
                        addGlobalClass('mode-search-images-disabled');
                        elementsToHideSelector =
                            `.card-grid-item-card > .legality-overlay,
                            .card-grid-item-card > .card-grid-item-legality`;
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
