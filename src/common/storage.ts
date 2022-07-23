import StorageArea = chrome.storage.StorageArea;
import {deserialize, serialize} from "./serialization";

/**
 * Why use this method over chrome.storage.sync/local.get?
 * 1. Single key input
 * 2. No need to unpack the result
 * 3. Has a default fallback value in case a storage key is not found. Defaults to null.
 */
function get<T>(storage: StorageArea, key: string, defaultValue: T = null): Promise<T> {
    return storage.get([key])
        .then(result => {
            if (Object.prototype.hasOwnProperty.call(result, key)) {
                return deserialize(result[key]);
            } else {
                return defaultValue;
            }
        });
}

function set<T>(storage: StorageArea, key: string, value: T): Promise<void> {
    return storage.set({[key]: serialize(value)});
}

interface SimpleStorage {
    get: <T>(key: string, defaultValue?: null | T) => Promise<T>,
    set: <T>(key: string, value: T) => Promise<void>
}

export const syncStorage: SimpleStorage = {
    get: get.bind(this, chrome.storage.sync),
    set: set.bind(this, chrome.storage.sync)
}

export const localStorage: SimpleStorage = {
    get: get.bind(this, chrome.storage.local),
    set: set.bind(this, chrome.storage.local)
}

// TODO each storage key should define if it's
// a) local, session, sync
// b) value type
// c) default value
export const StorageKeys = {
    ENABLED_DECKS: 'enabledDecks',
    SEARCH_CHECK_MODE: 'searchCheckMode',
    CARD_CACHE: 'cardCache',
    DISPLAY_EXTENDED: 'displayExtended'
}

