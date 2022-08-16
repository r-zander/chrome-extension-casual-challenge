import {ScryfallUUID} from "../common/types";
import {localStorage, StorageKeys} from "../common/storage";
import {SerializableMap} from "../common/SerializableMap";
import {CachedScryfallCard, CasualChallengeCard, FullCard, ScryfallCard} from "../common/card-representations";
import {deserialize} from "../common/serialization";

// 7 days aka 1 week (mostly)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

// export interface ScryfallDataLoader {
//
// }

export class CardLoader {

    // private readonly scryfallDataLoader: ScryfallDataLoader;
    private readonly loadingPromise: Promise<Map<ScryfallUUID, CachedScryfallCard>>;
    private casualChallengeCardPromise: Promise<Map<ScryfallUUID, CasualChallengeCard>>
    private loadingResolve: (data: Map<ScryfallUUID, CachedScryfallCard>) => void;
    private readonly cardIdsToLoad: ScryfallUUID[] = [];
    private cachedCards: Map<ScryfallUUID, CachedScryfallCard>;

    constructor(/*scryfallDataLoader: ScryfallDataLoader*/) {
        // this.scryfallDataLoader = scryfallDataLoader;
        this.loadingPromise = new Promise<Map<ScryfallUUID, CachedScryfallCard>>((resolve) => {
            this.loadingResolve = resolve;
        });
    }

    public register(cardId: ScryfallUUID): Promise<FullCard> {
        this.cardIdsToLoad.push(cardId);

        let loadedCard: CachedScryfallCard;
        return this.loadingPromise
            .then((loadedCards: Map<ScryfallUUID, CachedScryfallCard>) => {
                if (!loadedCards.has(cardId)) {
                    console.error('Loaded cards', loadedCards);
                    throw new Error('Unable to find cardId "' + cardId + '" in loaded cards.');
                }

                return loadedCards.get(cardId);
            })
            .then((cachedCard: CachedScryfallCard) => {
                loadedCard = cachedCard;

                return this.casualChallengeCardPromise;
            })
            .then((casualChallengeCards: Map<ScryfallUUID, CasualChallengeCard>) => {
                if (!casualChallengeCards.has(loadedCard.name)) {
                    console.error('Casual Challenge cards', casualChallengeCards);
                    throw new Error('Unable to find "' + loadedCard.name + '" in Casual Challenge cards.');
                }

                return casualChallengeCards.get(loadedCard.name);
            })
            .then((ccCard: CasualChallengeCard) => {
                return new FullCard(loadedCard, ccCard);
            });
    }

    public start(): void {
        let loadingResult: CacheLoadingResult;
        this.loadViaCache()
            .then((cacheLoadingResult: CacheLoadingResult) => {
                loadingResult = cacheLoadingResult;
                if (cacheLoadingResult.notFound.length === 0) {
                    return [];
                }

                return this.loadViaScryfallAPI(cacheLoadingResult.notFound);
            })
            .then((apiLoadingResult: ScryfallCard[]) => {
                const now = Date.now();
                const cardsToCache = new Map<ScryfallUUID, CachedScryfallCard>();

                apiLoadingResult.forEach(cardFromApi => {
                    const cachedScryfallCard = CachedScryfallCard.fromScryfallCard(cardFromApi, now);
                    loadingResult.found.set(cardFromApi.id, cachedScryfallCard);
                    cardsToCache.set(cardFromApi.id, cachedScryfallCard);
                    loadingResult.notFound.splice(loadingResult.notFound.indexOf(cardFromApi.id), 1);
                });


                return this.writeToCache(cardsToCache, loadingResult.found);
            })
            .then(() => {
                if (loadingResult.notFound.length > 0) {
                    console.warn('Not everything has been loaded.', loadingResult.notFound);
                }

                this.loadingResolve(loadingResult.found);

                return loadingResult.found;
            })
            .then((loadedCards: Map<ScryfallUUID, CachedScryfallCard>) => {

                const cardNames: string[] = [];

                loadedCards.forEach((loadedCard) => {
                    cardNames.push(loadedCard.name);
                });

                this.casualChallengeCardPromise = new Promise<Map<ScryfallUUID, CasualChallengeCard>>((resolve, reject) => {
                    chrome.runtime.sendMessage({action: 'get/cards/info', cardNames}, (cardsInfo) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                            return;
                        }

                        resolve(cardsInfo);
                    });
                })
                    .then(deserialize<unknown, Map<ScryfallUUID, CasualChallengeCard>>);
                return this.casualChallengeCardPromise;
            });
    }

    private loadViaCache(): Promise<CacheLoadingResult> {
        return localStorage.get<Map<ScryfallUUID, CachedScryfallCard>>(StorageKeys.CARD_CACHE, new SerializableMap<ScryfallUUID, CachedScryfallCard>())
            .then(cardCache => {
                const remainingIds: ScryfallUUID[] = [];
                const loadedCards = new Map<ScryfallUUID, CachedScryfallCard>();
                const now = Date.now();

                // Each card id either ends up either in the loadedCards (because
                // it was found fresh in cache) or in the remainingIds to be loaded
                // in the next step.
                this.cardIdsToLoad.forEach((cardId: ScryfallUUID) => {
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

                this.cachedCards = cardCache;

                return {
                    found: loadedCards,
                    notFound: remainingIds
                };
            });
    }

    private loadViaScryfallAPI(cardIds: ScryfallUUID[]): Promise<ScryfallCard[]> {
        console.log('About to load ' + cardIds.length + ' cards via API', cardIds);
        if (cardIds.length > 75) {
            console.warn('Only first 75 cards will be loaded. Please reload the page to load the rest.');
        }
        const identifiersToLoad = cardIds.map(cardId => {
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
            .then((fromApi: ScryfallCard[]) => {
                console.log('Loaded ' + fromApi.length + ' cards via API', fromApi);
                return fromApi;
            });
    }

    private writeToCache(
        cardsToCache: Map<ScryfallUUID, CachedScryfallCard>,
        loadedCards: Map<ScryfallUUID, CachedScryfallCard>
    ): Promise<void> {
        for (const [cardId, cacheReadyCard] of Array.from(cardsToCache)) {
            this.cachedCards.set(cardId, cacheReadyCard);
        }

        // Store modified cache object
        return localStorage.set(StorageKeys.CARD_CACHE, this.cachedCards)
            .catch((error) => {
                if (error.toString() === 'Error: QUOTA_BYTES quota exceeded') {
                    console.log('Cleaning out old cards from cache.')
                    // Cache got too big --> delete it, and just store the newest batch of cards
                    return chrome.storage.local.remove(StorageKeys.CARD_CACHE)
                        .then(() => {
                            this.cachedCards = new SerializableMap<ScryfallUUID, CachedScryfallCard>();
                            for (const [cardId, cacheReadyCard] of Array.from(loadedCards)) {
                                this.cachedCards.set(cardId, cacheReadyCard);
                            }

                            return localStorage.set(StorageKeys.CARD_CACHE, this.cachedCards)
                        })
                }
                console.error('Unknown error while writing card cache', error);
            });
    }
}

interface CacheLoadingResult {
    found: Map<ScryfallUUID, CachedScryfallCard>;
    notFound: ScryfallUUID[];
}


