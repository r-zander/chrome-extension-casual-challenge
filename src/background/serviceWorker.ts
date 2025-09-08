import {
    Ban,
    BanFormats,
    BanListResponse,
    Bans,
    MultiCardsResponse,
    SingleBanResponse,
    SingleCardResponse
} from '../common/types';
import {StorageKeys} from "../common/storage";
import {SerializableMap} from "../common/serializableMap";
import {isBasicLand} from "../common/casualChallengeLogic";
import {deckBuilder} from "./deckBuilder";
import {ApiClient} from "./apiClient";

let bans: Bans = new SerializableMap<string, BanFormats>();
let extendedBans: Bans = new SerializableMap<string, BanFormats>();
let budgetPoints: Map<string, number> = new Map<string, number>();
let isDataLoaded = false;

const apiClient = ApiClient.getInstance();

console.info('Scryfall - Casual Challenge Checker: Service Worker running!');

async function initializeData(): Promise<void> {
    if (isDataLoaded) {
        return;
    }

    try {
        console.log('Loading data from API...');
        const data = await apiClient.getData();
        
        bans = loadBans(data.bans);
        extendedBans = loadBans(data.extendedBans);
        budgetPoints = loadBudgetPoints(data.cardPrices);
        
        isDataLoaded = true;
        console.log('Data loaded successfully from API');
    } catch (error) {
        console.error('Failed to load data from API:', error);
        // Could implement fallback to static files here if needed
        throw error;
    }
}

async function preloadData(): Promise<void> {
    try {
        console.log('Pre-loading data to warm up cache...');
        await apiClient.getData();
        console.log('Data pre-loaded successfully');
    } catch (error) {
        console.error('Failed to pre-load data:', error);
    }
}


chrome.runtime.onStartup.addListener(() => {
    console.log('Extension startup: pre-loading data...');
    preloadData();
});

chrome.runtime.onInstalled.addListener(
    (details) => {
        if (['0.1.0', '0.2.0', '0.2.1', '0.3.0', '0.4.0', '0.5.0', '0.5.1', '0.5.2', '0.5.3'].includes(details.previousVersion)) {
            // Remove old untyped storage items
            // noinspection JSIgnoredPromiseFromCall
            chrome.storage.sync.remove(StorageKeys.ENABLED_DECKS);
            // noinspection JSIgnoredPromiseFromCall
            chrome.storage.local.remove(StorageKeys.CARD_CACHE);
        }
        
        // Pre-load data on installation or update
        console.log(`Extension ${details.reason}: pre-loading data...`);
        preloadData();
    }
)

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (typeof request.action !== 'string') {
            console.error('Received request without mandatory action property.', request);
            return;
        }

        // Handle async operations
        const handleAsync = async () => {
            await initializeData();
            
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
        };

        handleAsync().catch(console.error);
        return true; // Indicate we'll send response asynchronously
    },
);


deckBuilder.init();

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

function loadBudgetPoints(input: Record<string, number>): Map<string, number> {
    const result = new Map<string, number>();
    for (const [cardName, budgetPoints] of Object.entries(input)) {
        addCardToMap(result, cardName, budgetPoints);
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
