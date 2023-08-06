import {uuidPattern} from "./common/validator";
import {
    DeckEntryMessageType,
    DeckEntryRemovedMessageType,
    DeckEntryReplacedMessageType, DeckEntryUUID,
    DeckLoadedMessageType
} from "./common/types";

console.log('Hello from the website!');

// TODO somehow inject per Extension/AddOn
const port = chrome.runtime.connect('iflbbacoehadmpmngkkmfmlanadjihjm', {
    name: 'WebsiteScript.EditDeckView'
});

port.onDisconnect.addListener(() => {
    console.log('WebsiteScript: port disconnected.');
});

function matchesPath(url: URL, regex: string): boolean {
    return url.pathname.match(new RegExp(regex)) !== null;
}

function initAjaxInterceptors(): void {
    console.log('initAjaxInterceptors');
    // Add a response interceptor
    Axios.interceptors.response.use(function (response) {
        const url = new URL(response.config.url);
        const method = response.config.method.toUpperCase();

//      GET https://api.scryfall.com/decks/9628efae-930c-4297-8756-4d95a34484b9?sf=true
        if (method === 'GET' &&
            matchesPath(url, `^/decks/${uuidPattern}$`)
        ) {
            // It's the initial deck request
            port.postMessage({event: 'deck.loaded', payload: response.data} as DeckLoadedMessageType);

//      POST https://api.scryfall.com/decks/9628efae-930c-4297-8756-4d95a34484b9/entry
        } else if (method === 'POST' &&
            matchesPath(url, `^/decks/${uuidPattern}/entry$`)
        ) {
            if (response.data.found === true && response.data.card_digest !== null) {
                port.postMessage({event: 'card.added', payload: response.data} as DeckEntryMessageType);
            }

//      POST https://api.scryfall.com/decks/9628efae-930c-4297-8756-4d95a34484b9/card
        } else if (method === 'POST' &&
            matchesPath(url, `^/decks/${uuidPattern}/card$`)
        ) {
            if (response.data.found === true && response.data.card_digest !== null) {
                port.postMessage({event: 'card.added', payload: response.data} as DeckEntryMessageType);
            }

//      POST https://api.scryfall.com/decks/9628efae-930c-4297-8756-4d95a34484b9/entry/2c7a53d7-b14c-4985-b65f-0241ff11b135
        } else if (method === 'POST' &&
            matchesPath(url, `^/decks/${uuidPattern}/entry/${uuidPattern}$`)
        ) {
            // change entry (both number and card)
            if (response.data.found === true && response.data.card_digest !== null) {
                port.postMessage({event: 'card.updated', payload: response.data} as DeckEntryMessageType);
            }

//      POST https://api.scryfall.com/decks/9628efae-930c-4297-8756-4d95a34484b9/entry/2c7a53d7-b14c-4985-b65f-0241ff11b135/replaced
        } else if (method === 'POST' &&
            matchesPath(url, `^/decks/${uuidPattern}/entry/${uuidPattern}/replace$`)
        ) {
            // replaced entry
            if (response.data.found === true && response.data.card_digest !== null) {
                port.postMessage({event: 'card.replaced', payload: response.data} as DeckEntryReplacedMessageType);
            }

//      POST https://api.scryfall.com/decks/9628efae-930c-4297-8756-4d95a34484b9/entry/2c7a53d7-b14c-4985-b65f-0241ff11b135
        } else if (method === 'DELETE' &&
            matchesPath(url, `^/decks/${uuidPattern}/entry/${uuidPattern}$`)
        ) {
            // removed entry
            // Last path element = deck entry UUID
            const entryId: DeckEntryUUID = url.pathname.split('/').pop();
            port.postMessage({event: 'card.removed', payload: {id: entryId}} as DeckEntryRemovedMessageType);
        }

        // Just return the unmodified response
        return response;
    });
}


if (typeof Axios !== 'function') {
    const interval = setInterval(() => {
        if (typeof Axios === 'function') {
            initAjaxInterceptors();
            clearInterval(interval);
        }
    }, 10);
} else {
    initAjaxInterceptors();
}
