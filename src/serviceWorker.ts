import {
    Ban,
    BanFormats,
    BanListResponse,
    Bans,
    MessageType,
    MultiCardsResponse,
    SingleBanResponse,
    SingleCardResponse
} from './common/types';
import {StorageKeys} from "./common/storage";
import {SerializableMap} from "./common/SerializableMap";
import CardPrices from "../data/card-prices.json";
import RawBans from "../data/bans.json";
import RawExtendedBans from "../data/extended-bans.json";
import {isBasicLand} from "./common/CasualChallengeLogic";
import Port = chrome.runtime.Port;

const bans = loadBans(RawBans);
const extendedBans = loadBans(RawExtendedBans);
const loadedPriceIndex = 'B';
const budgetPoints: Map<string, number> = loadBudgetPoints(CardPrices, loadedPriceIndex);

console.info('Scryfall - Casual Challenge Checker: Service Worker running!');

chrome.runtime.onInstalled.addListener(
    (details) => {
        if (['0.1.0', '0.2.0', '0.2.1', '0.3.0', '0.4.0', '0.5.0', '0.5.1', '0.5.2', '0.5.3'].includes(details.previousVersion)) {
            // Remove old untyped storage items
            // noinspection JSIgnoredPromiseFromCall
            chrome.storage.sync.remove(StorageKeys.ENABLED_DECKS);
            // noinspection JSIgnoredPromiseFromCall
            chrome.storage.local.remove(StorageKeys.CARD_CACHE);
        }
    }
)

interface DeckBuilderConnection {
    contentPort: Port
    websitePort: Port,
}

const deckBuilderConnections: { [key: number]: DeckBuilderConnection } = {}

function forwardMessageToContentScript(tabId: number, message: MessageType) {
    deckBuilderConnections[tabId].contentPort.postMessage(message);
}

chrome.runtime.onConnectExternal.addListener((port: Port) => {
    console.log('onConnectExternal');
    if (port.name === 'WebsiteScript.EditDeckView') {
        console.log('Connected to website');
        const tabId = port.sender.tab.id;
        console.log('Tab Id', tabId);
        if (Object.prototype.hasOwnProperty.call(deckBuilderConnections, tabId)) {
            console.assert(
                deckBuilderConnections[tabId].websitePort === null,
                'There was already a websitePort bound for tab ' + tabId
            );
            deckBuilderConnections[tabId].websitePort = port;
        } else {
            deckBuilderConnections[tabId] = {
                contentPort: null,
                websitePort: port
            }
        }

        port.onMessage.addListener(message => {
            forwardMessageToContentScript(tabId, message);
        });
    }
});

chrome.runtime.onConnect.addListener((port: Port) => {
    console.log('onConnect');
    if (port.name === 'ContentScript.EditDeckView') {
        console.log('Inject script to website');
        console.log('Sender', port.sender);
        const tabId = port.sender.tab.id;
        if (Object.prototype.hasOwnProperty.call(deckBuilderConnections, tabId)) {
            console.assert(
                deckBuilderConnections[tabId].contentPort === null,
                'There was already a contentPort bound for tab ' + tabId
            );
            deckBuilderConnections[tabId].contentPort = port;
        } else {
            deckBuilderConnections[tabId] = {
                contentPort: port,
                websitePort: null
            }
        }
        chrome.scripting.executeScript({
            // target: {tabId: tab[0].id},
            target: {tabId: tabId},
            // func: script.bind(this, chrome.runtime.id),
            // func: script,
            files: ['website-script.js'],
            world: 'MAIN'
        }).then(() => console.log('injected a function'));
    }
});

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (typeof request.action !== 'string') {
            console.error('Received request without mandatory action property.', request);
            return;
        }
        switch (request.action) {
            case 'get/ban/list':
                sendBanList(sendResponse);
                return;
            case 'get/ban/card':
                sendBanStatus(request.cardName, sendResponse);
                return;
            case 'get/card/info':
                sendCardInfo(request.cardName, sendResponse);
                return;
            case 'get/cards/info':
                sendCardsInfo(request.cardNames, sendResponse);
                return;
            case 'inject':
                return;
            default:
                console.error('Unknown action "' + request.action + '" in request.', request);
                return;
        }
    },
);

function sendBanStatus(cardName: string, sendResponse: (response: SingleBanResponse) => void) {
    if (bans.has(cardName)) {
        sendResponse({banStatus: 'banned', formats: bans.get(cardName)});
    }

    if (extendedBans.has(cardName)) {
        sendResponse({banStatus: 'extended', formats: extendedBans.get(cardName)});
    }

    sendResponse({banStatus: null, formats: null});
}

function sendBanList(sendResponse: (response: BanListResponse) => void) {
    sendResponse(
        {
            bans: bans,
            extended: extendedBans,
        });
}

function sendCardsInfo(cardNames: string[], sendResponse: (response: MultiCardsResponse) => void) {
    const response = new SerializableMap<string, SingleCardResponse>();
    cardNames.forEach(cardName => {
        response.set(cardName, getCardInfo(cardName));
    });
    sendResponse(response);
}

function sendCardInfo(cardName: string, sendResponse: (response: SingleCardResponse) => void) {
    sendResponse(getCardInfo(cardName));
}

function getCardInfo(cardName: string): SingleCardResponse {
    let price: number;
    if (isBasicLand({name: cardName})) {
        // Basic lands are always legal & for free
        return {banStatus: null, banFormats: null, budgetPoints: 0};
    } else if (budgetPoints.has(cardName)) {
        // No partial check for budget points, they always have the full name
        price = budgetPoints.get(cardName);
    } else {
        return {banStatus: 'unknown', banFormats: null, budgetPoints: null};
    }
    const partialName = cardName.split('//')[0].trim();
    if (bans.has(cardName)) {
        return {banStatus: 'banned', banFormats: bans.get(cardName), budgetPoints: price};
    }
    if (bans.has(partialName)) {
        return {banStatus: 'banned', banFormats: bans.get(partialName), budgetPoints: price};
    }

    if (extendedBans.has(cardName)) {
        return {banStatus: 'extended', banFormats: extendedBans.get(cardName), budgetPoints: price};
    }
    if (extendedBans.has(partialName)) {
        return {banStatus: 'extended', banFormats: extendedBans.get(partialName), budgetPoints: price};
    }

    return {banStatus: null, banFormats: null, budgetPoints: price};
}

function addCardToMap<T>(map: Map<string, T>, cardName: string, value: T) {
    if (map.has(cardName)) {
        console.warn('cardName already exists in map.', cardName);
    }

    map.set(cardName, value);

    // Hack: everything shorter is always available as full name
    if (cardName.length <= 20) {
        return;
    }

    const partialName = cardName.split('//')[0].trim();
    if (partialName === cardName ||
        // Hack: Filter out double sided style cards
        cardName === (partialName + ' // ' + partialName)) {
        return;
    }

    if (map.has(partialName)) {
        console.error('partialName already exists in map.', partialName, cardName);
        return;
    }

    map.set(partialName, value);
}

function loadBudgetPoints(input: Record<string, Record<string, number>>, priceIndex: string): Map<string, number> {
    const result = new Map<string, number>();
    for (const [cardName, prices] of Object.entries(input)) {
        addCardToMap(result, cardName, Math.round(prices[priceIndex] * 100));
    }

    return result;
}

function loadBans(rawBans: Ban[]): Bans {
    const bans: Bans = new SerializableMap<string, BanFormats>();
    rawBans.forEach((ban: Ban) => {
        addCardToMap(bans, ban.name, ban.formats);
    });
    return bans;
}
