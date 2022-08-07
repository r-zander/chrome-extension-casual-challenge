import {Card, CardLegality, CasualCardLegality, ScryfallUUID} from "../common/types";
import {localStorage, StorageKeys} from "../common/storage";
import {SerializableMap} from "../common/SerializableMap";
import {Card as ScryfallCard, Legality} from "scryfall-api";
import {Layout} from "scryfall-api/dist/declarations/dist/src/types/Layout";

// 7 days aka 1 week (mostly)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

export interface ScryfallDataLoader {

}

// TODO think of a correct representation of a "card" on various loading levels
//      probably with some diagram
// TODO include loading bans/budget points via chrome runtime message

export class CardLoader {

    private readonly scryfallDataLoader: ScryfallDataLoader;
    private readonly cardIdsToLoad: ScryfallUUID[] = [];

    constructor(scryfallDataLoader: ScryfallDataLoader) {
        this.scryfallDataLoader = scryfallDataLoader;
    }

    public add(cardId: ScryfallUUID): void {
        this.cardIdsToLoad.push(cardId);
    }

    public load(): Promise<Map<ScryfallUUID, Card>> {
        const loadedCards = new Map<ScryfallUUID, Card>();
        const remainingIds: ScryfallUUID[] = [];
        // let cardCache: Map<ScryfallUUID, Card>;
        // Keep a reference in case we need to clear the cache
        let apiLoadedCards: ScryfallCard[];

        return localStorage.get<Map<ScryfallUUID, CachedCard>>(StorageKeys.CARD_CACHE, new SerializableMap<ScryfallUUID, CachedCard>())
            .then(cardCache => {
                const now = Date.now();

                // Each card id either ends up either in the loadedCards (because
                // it was found fresh in cache) or in the remainingIds to be loaded
                // in the next step.
                this.cardIdsToLoad.forEach((cardId) => {
                    if (!cardCache.has(cardId)) {
                        // Not found in cache --> load
                        remainingIds.push(cardId);
                        return;
                    }

                    const cardObject = cardCache.get(cardId);
                    if ((now - cardObject.cachedAt) < CACHE_DURATION) {
                        loadedCards.set(cardId, cardObject);
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

                console.log('About to load ' + remainingIds.length + ' cards via API', remainingIds);
                if (remainingIds.length > 75) {
                    console.warn('Only first 75 cards will be loaded. Please reload the page to load the rest.');
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
                        fromApi.forEach((cardFromApi: ScryfallCard) => {
                            cardCache.set(cardFromApi.id, new CachedCard(cardFromApi, now));
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
}

class CachedCard {
    public readonly id: ScryfallUUID;
    public readonly name: string;
    public readonly legalities: {
        standard: CardLegality,
        pioneer: CardLegality,
        modern: CardLegality,
        legacy: CardLegality,
        vintage: CardLegality,
        pauper: CardLegality,
    };
    public readonly cachedAt: number;
    public readonly layout: keyof typeof Layout;

    public constructor(cardFromApi: ScryfallCard, cachedAt: number) {
        this.id = cardFromApi.id;
        this.name = cardFromApi.name;
        this.legalities = {
            standard: cardFromApi.legalities.standard,
            pioneer: cardFromApi.legalities.pioneer,
            modern: cardFromApi.legalities.modern,
            legacy: cardFromApi.legalities.legacy,
            vintage: cardFromApi.legalities.vintage,
            pauper: cardFromApi.legalities.pauper,
        };
        this.cachedAt = cachedAt;
        this.layout = cardFromApi.layout;
    }

}
