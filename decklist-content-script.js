const STORAGE_KEY_ENABLED_DECKS = 'enabledDecks';
const STORAGE_KEY_CARD_CACHE = 'cardCache';
// 7 days aka 1 week (mostly)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

const DECK_MODE_DECKLIST = 'decklist';
const DECK_MODE_VISUAL = 'visual';
const DECK_MODE_UNKNOWN = 'unknown';

let loadingIndicator,
    disabledButton,
    enabledButton;
let deckMode = DECK_MODE_UNKNOWN;
let deckWasChecked = false;

function getDeckId() {
    let pathElements = location.pathname.split('/');
    return pathElements[pathElements.length - 1];
}

async function isCasualChallengeDeck() {
    let enabledDecks = await chrome.storage.sync.get([STORAGE_KEY_ENABLED_DECKS]);
    if (enabledDecks.hasOwnProperty(STORAGE_KEY_ENABLED_DECKS)) {
        enabledDecks = enabledDecks[STORAGE_KEY_ENABLED_DECKS];
    }
    /*
     * Triple state
     * true = deck was white listed
     * false = deck was black listed
     * undefined = deck is unknown
     */
    const enabled = enabledDecks[getDeckId()];
    // Deck was explicitly disabled for deck check
    if (enabled === false) {
        console.log('isCasualChallengeDeck', 'Deck is disabled according to `enabledDecks` storage');
        return false;
    }

    // Check for matching deck titles for auto-enable
    let deckTitle = document.querySelector('.deck-details-title').innerText;
    if (deckTitle.match(/Casual.{0,3}Challenge/i) !== null) {
        console.log('isCasualChallengeDeck', 'Deck Title matches');
        // Synchronously store that this deck should have its deck check enabled
        // to prevent unexpected behavior when the deck name changes
        await storeDeckCheckFlag(true);
        return true;
    }

    console.log('isCasualChallengeDeck', 'Found deck id in `enabledDecks` storage');
    console.log('enabled', enabled);
    return (enabled === true);
}

async function init() {
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

    if (document.querySelectorAll('.deck-list').length !== 0) {
        deckMode = DECK_MODE_DECKLIST;
    } else if (document.querySelectorAll('.card-grid').length !== 0) {
        deckMode = DECK_MODE_VISUAL;
    } else {
        deckMode = DECK_MODE_UNKNOWN;
        // Not displayed as deck list --> no deck check
        displayDisabled();
        return;
    }

    if (!await isCasualChallengeDeck()) {
        displayDisabled();
        return;
    }

    // Deck title contains 'Casual Challenge' so we can start.
    await checkDeck();
}

function addLegalityElement(banlist, cardName, cardItem, bannedTemplate, extendedTemplate, loadingTemplate, cardsToLoad, deckListEntry) {
    if (banlist.bans.hasOwnProperty(cardName)) {
        cardItem.append(bannedTemplate.content.cloneNode(true));
    } else if (banlist.extended.hasOwnProperty(cardName)) {
        cardItem.append(extendedTemplate.content.cloneNode(true));
    } else {
        // We need some more infos about the card, so lets queue it for loading
        cardItem.append(loadingTemplate.content.cloneNode(true));
        cardsToLoad[deckListEntry.dataset.cardId] = deckListEntry;
    }
}

function checkDeck() {
    document.querySelector('.deck').classList.add('casual-challenge-deck');

    if (deckWasChecked) {
        // Just show our elements
        switch (deckMode) {
            case DECK_MODE_DECKLIST:
                document.querySelectorAll('.deck-list-entry > .card-legality').forEach(element => {
                    element.classList.remove('hidden');
                });
                break;
            case DECK_MODE_VISUAL:
                document.querySelectorAll('.card-grid-item-card > .legality-overlay, .card-grid-item-card > .card-grid-item-legality')
                    .forEach(element => {
                        element.classList.remove('hidden');
                    });
                break;
        }

        displayEnabled();
        return Promise.resolve();
    }

    let templateFn;
    switch (deckMode) {
        case DECK_MODE_DECKLIST: {
            templateFn = (cssClass, text, explanation) => `<dl class="card-legality"><dd class="${cssClass}">${text}</dd></dl>`;
            break;
        }
        case DECK_MODE_VISUAL:
            templateFn = (cssClass, text, explanation) => `<div class="legality-overlay ${cssClass}"></div>
<span class="card-grid-item-count card-grid-item-legality ${cssClass}" title="${explanation}">${text}</span>`
            break;
    }

    const loadingTemplate = document.createElement('template');
    const legalTemplate = document.createElement('template');
    const notLegalTemplate = document.createElement('template');
    const bannedTemplate = document.createElement('template');
    const extendedTemplate = document.createElement('template');
    loadingTemplate.innerHTML = templateFn('loading', '<div class="dot-flashing"></div>', '');
    legalTemplate.innerHTML = templateFn('legal', 'Legal', '');
    notLegalTemplate.innerHTML = templateFn('not-legal', 'Not Legal', '');
    bannedTemplate.innerHTML = templateFn('banned', 'Banned', '');
    extendedTemplate.innerHTML = templateFn('extended', 'Extended', '');

    let cardsToLoad = {};

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({action: 'get/banlist'}, (banlist) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }

            resolve(banlist);
        });
    })
        .then((banlist) => {
            console.log('Received Casual Challenge ban list: ', banlist);

            switch (deckMode) {
                case DECK_MODE_DECKLIST:
                    document.querySelectorAll('.deck-list-entry').forEach((deckListEntry) => {
                        let cardName = deckListEntry.querySelector('.deck-list-entry-name').innerText.trim();
                        addLegalityElement(
                            banlist,
                            cardName,
                            deckListEntry,
                            bannedTemplate,
                            extendedTemplate,
                            loadingTemplate,
                            cardsToLoad,
                            deckListEntry);
                    });
                    break;
                case DECK_MODE_VISUAL:
                    document.querySelectorAll('.card-grid-item').forEach((deckListEntry) => {
                        if (deckListEntry.classList.contains('flexbox-spacer')) return;

                        let cardName = deckListEntry.querySelector('.card-grid-item-invisible-label').innerText.trim();
                        const cardItem = deckListEntry.querySelector('.card-grid-item-card');
                        addLegalityElement(
                            banlist,
                            cardName,
                            cardItem,
                            bannedTemplate,
                            extendedTemplate,
                            loadingTemplate,
                            cardsToLoad,
                            deckListEntry);
                    });
                    break;
            }

            let cardIdsToLoad = Object.keys(cardsToLoad);
            if (cardIdsToLoad.length === 0) {
                return Promise.resolve();
            }

            return loadCardsThroughCache(cardIdsToLoad)
                .then(loadedCards => {
                    loadedCards.forEach(cardObject => {
                        const cardId = cardObject.id;
                        const deckListEntry = cardsToLoad[cardId];
                        switch (deckMode) {
                            case DECK_MODE_DECKLIST:
                                deckListEntry.querySelector('.card-legality').remove();

                                if (cardObject.legalities.vintage === 'legal') {
                                    deckListEntry.append(legalTemplate.content.cloneNode(true));
                                } else {
                                    deckListEntry.append(notLegalTemplate.content.cloneNode(true));
                                }
                                break;
                            case DECK_MODE_VISUAL:
                                deckListEntry.querySelector('.legality-overlay').remove();

                                const cardItem = deckListEntry.querySelector('.card-grid-item-card');
                                if (cardObject.legalities.vintage === 'legal') {
                                    cardItem.append(legalTemplate.content.cloneNode(true));
                                } else {
                                    cardItem.append(notLegalTemplate.content.cloneNode(true));
                                }
                                break;
                        }
                    });
                });
        })
        .then(() => {
            displayEnabled();
            deckWasChecked = true;
        });
}

function loadCardsThroughCache(cardIdsToLoad) {
    const loadedCards = [];
    const remainingIds = [];
    let cardCache;

    return chrome.storage.local
        .get(STORAGE_KEY_CARD_CACHE)
        .then(cardCacheFromStorage => {
            let now = Date.now();

            if (!cardCacheFromStorage.hasOwnProperty(STORAGE_KEY_CARD_CACHE)) {
                // AddAll cardIdsToLoad to remainingIds
                Array.prototype.push.apply(remainingIds, cardIdsToLoad);
                // Create new cache object
                cardCache = {};
            } else {
                cardCache = cardCacheFromStorage[STORAGE_KEY_CARD_CACHE];


                // Each card id either ends up either in the loadedCards (because
                // it was found fresh in cache.
                // Or in the remainingIds to be loaded in the next step.
                cardIdsToLoad.forEach(cardId => {
                    if (!cardCache.hasOwnProperty(cardId)) {
                        // Not found in cache --> load
                        remainingIds.push(cardId);
                        return;
                    }

                    let cardObject = cardCache[cardId];
                    console.log('Found card ' + cardId + '. CachedAt = ', cardObject.cachedAt);
                    if ((now - cardObject.cachedAt) < CACHE_DURATION) {
                        loadedCards.push(cardObject);
                    } else {
                        // Stale entry --> remove & reload
                        console.log('Data was stale.');
                        delete cardCache[cardId];
                        remainingIds.push(cardId);
                    }
                });

                console.log('About to load ' + remainingIds.length + ' cards via API', remainingIds);
                if (remainingIds.length === 0) {
                    return Promise.resolve(loadedCards);
                }
            }

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
                    fromApi.forEach(cardObject => {
                        cardObject.cachedAt = now;
                        cardCache[cardObject.id] = cardObject;
                    });

                    return loadedCards.concat(fromApi);
                });
        })
        .then(loadedCards => {
            console.log('Store cache', cardCache);
            // Store modified cache object
            return chrome.storage.local.set({[STORAGE_KEY_CARD_CACHE]: cardCache})
                // Pass loadedCards outside
                .then(() => loadedCards);
        });
}

function displayLoading() {
    console.log('isEnabled', 'loading');
    loadingIndicator.classList.remove('hidden');
    disabledButton.classList.add('hidden');
    enabledButton.classList.add('hidden');
}

function displayEnabled() {
    console.log('isEnabled', true);
    loadingIndicator.classList.add('hidden');
    disabledButton.classList.add('hidden');
    enabledButton.classList.remove('hidden');
}

function displayDisabled() {
    console.log('isEnabled', false);
    loadingIndicator.classList.add('hidden');
    disabledButton.classList.remove('hidden');
    enabledButton.classList.add('hidden');
}

function storeDeckCheckFlag(isEnabled) {
    return chrome.storage.sync
        .get(STORAGE_KEY_ENABLED_DECKS)
        .then(enabledDecks => {
            if (enabledDecks.hasOwnProperty(STORAGE_KEY_ENABLED_DECKS)) {
                enabledDecks = enabledDecks[STORAGE_KEY_ENABLED_DECKS];
            }
            enabledDecks[getDeckId()] = isEnabled;

            return chrome.storage.sync.set(
                {[STORAGE_KEY_ENABLED_DECKS]: enabledDecks},
            );
        });
}

function enableChecks() {
    displayLoading();
    storeDeckCheckFlag(true)
        .then(() => {
            if (deckMode === DECK_MODE_DECKLIST &&
                document.getElementById('with').value !== 'eur') { // showing euros?
                // ... otherwise: switch to correct view
                let queryParameters = new URLSearchParams(location.search);
                queryParameters.set('with', 'eur');
                location.search = queryParameters.toString();
            } else {
                return checkDeck();
            }
        });
}

function disableChecks() {
    displayLoading();
    storeDeckCheckFlag(false)
        .then(() => {
            if (deckWasChecked) {
                // Hide everything we added
                document.querySelector('.deck').classList.remove('casual-challenge-deck');
                switch (deckMode) {
                    case DECK_MODE_DECKLIST:
                        document.querySelectorAll('.deck-list-entry > .card-legality').forEach(element => {
                            element.classList.add('hidden');
                        });
                        break;
                    case DECK_MODE_VISUAL:
                        document.querySelectorAll('.card-grid-item-card > .legality-overlay, .card-grid-item-card > .card-grid-item-legality')
                            .forEach(element => {
                                element.classList.add('hidden');
                            });
                        break;
                }
            }

            displayDisabled();
        });
}

// noinspection JSIgnoredPromiseFromCall
init();
