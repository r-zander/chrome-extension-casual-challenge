// setTimeout(
//     () => {
//         alert("Hi :)");
//     },
//     1000
// )
const STORAGE_KEY_ENABLED_DECKS = 'enabledDecks';

let disabledButton;
let enabledButton;

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
<!--        TODO show loading button before toggleCheck is called  -->
         <button class="casual-challenge-checks-disabled button-n tiny">Enable checks</button>
         <button class="casual-challenge-checks-enabled button-n primary tiny hidden">Disable checks</button>
    </div>`;

    document.querySelector('.sidebar-prices').after(sidebarTemplate.content);

    disabledButton = document.querySelector('.casual-challenge-checks-disabled');
    enabledButton = document.querySelector('.casual-challenge-checks-enabled');

    disabledButton.addEventListener('click', () => {
        enableChecks();
    });
    enabledButton.addEventListener('click', () => {
        // TODO actually manage disable
        chrome.storage.sync.remove(STORAGE_KEY_ENABLED_DECKS);
        location.reload();
        // toggleCheck(false);
    });

    if (document.querySelectorAll('.deck-list').length === 0) {
        toggleCheck(false);
        return;
    }

    if (!await isCasualChallengeDeck()) {
        toggleCheck(false);
        return;
    }

    // Deck title contains 'Casual Challenge' so we can start.
    checkDeck();
}

function checkDeck() {
    toggleCheck(true);

    const loadingTemplate = document.createElement('template');
    loadingTemplate.innerHTML = '<dl class="card-legality"><dd class="loading"><div class="dot-flashing"></div></dd></dl>';
    const legalTemplate = document.createElement('template');
    legalTemplate.innerHTML = '<dl class="card-legality"><dd class="legal">Legal</dd></dl>';
    const notLegalTemplate = document.createElement('template');
    notLegalTemplate.innerHTML = '<dl class="card-legality"><dd class="not-legal">Not Legal</dd></dl>';
    const bannedTemplate = document.createElement('template');
    bannedTemplate.innerHTML = '<dl class="card-legality"><dd class="banned">Banned</dd></dl>';
    const extendedTemplate = document.createElement('template');
    extendedTemplate.innerHTML = '<dl class="card-legality"><dd class="extended">Extended</dd></dl>';
// const restrictedTemplate = document.createElement('template');
// restrictedTemplate.innerHTML = '<dl class="card-legality"><dd class="restricted">Restrict.</dd></dl>';

    let cardsToLoad = {};

    chrome.runtime.sendMessage({action: 'get/banlist'}, function (banlist) {
        console.log('Received Casual Challenge ban list: ', banlist);

        document.querySelectorAll('.deck-list-entry').forEach((deckListEntry) => {
            let cardName = deckListEntry.querySelector('.deck-list-entry-name').innerText.trim();
            if (banlist.bans.hasOwnProperty(cardName)) {
                deckListEntry.append(bannedTemplate.content.cloneNode(true));
            } else if (banlist.extended.hasOwnProperty(cardName)) {
                deckListEntry.append(extendedTemplate.content.cloneNode(true));
            } else {
                // We need some more infos about the card, so lets queue it for loading
                deckListEntry.append(loadingTemplate.content.cloneNode(true));
                cardsToLoad[deckListEntry.dataset.cardId] = deckListEntry;
            }
        });

        let cardIdsToLoad = Object.keys(cardsToLoad);
        if (cardIdsToLoad.length > 0) {
            cardIdsToLoad = cardIdsToLoad.map(cardId => {
                return {id: cardId};
            });
            // Load card data
            // TODO support more than 75 cards by paging?
            fetch('https://api.scryfall.com/cards/collection',
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body:
                        '{"identifiers": ' + JSON.stringify(cardIdsToLoad.slice(0, 75)) + ' }'
                })
                .then(response => response.json())
                .then(collection => {
                    collection.data.forEach(cardObject => {
                        const cardId = cardObject.id;
                        const deckListEntry = cardsToLoad[cardId];
                        deckListEntry.querySelector('.card-legality').remove();

                        if (cardObject.legalities.vintage === 'legal') {
                            deckListEntry.append(legalTemplate.content.cloneNode(true));
                        } else {
                            deckListEntry.append(notLegalTemplate.content.cloneNode(true));
                        }
                    });
                    // TODO handle not found
                });
        }
    });
}

function toggleCheck(isEnabled) {
    console.log('isEnabled', isEnabled);
    if (isEnabled) {
        disabledButton.classList.add('hidden');
        enabledButton.classList.remove('hidden');
    } else {
        disabledButton.classList.remove('hidden');
        enabledButton.classList.add('hidden');
    }
}

function enableChecks() {
    // TODO manage re-enable (was disabled --> enabled --> disabled --> enabled again)
    chrome.storage.sync.get(STORAGE_KEY_ENABLED_DECKS)
        .then(enabledDecks => {
            if (enabledDecks.hasOwnProperty(STORAGE_KEY_ENABLED_DECKS)) {
                enabledDecks = enabledDecks[STORAGE_KEY_ENABLED_DECKS];
            }
            enabledDecks[getDeckId()] = true;

            return chrome.storage.sync.set(
                {[STORAGE_KEY_ENABLED_DECKS]: enabledDecks}
            );
        })
        .then(() => {
            if (document.querySelectorAll('.deck-list').length === 0 || // In list mode?
                document.getElementById('with').value !== 'eur') { // showing euros?
                // ... otherwise: switch to correct view
                let queryParameters = new URLSearchParams(location.search);
                queryParameters.set('as', 'list');
                queryParameters.set('with', 'eur');
                location.search = queryParameters.toString();
            } else {
                checkDeck();
            }
        });
}

// noinspection JSIgnoredPromiseFromCall
init();
