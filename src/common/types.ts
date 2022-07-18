export interface SingleBanResponse {
    banStatus: string,
    formats: BanFormats
}

export interface BanListResponse {
    bans: Bans,
    extended: Bans
}

export interface BanFormats {
    [key: string]: number
}

export interface Ban {
    name: string,
    formats: BanFormats
}

export type Bans = Map<string, BanFormats>;

export interface Legalities {
    [key: string]: string
}

/**
 * Partial Scryfall card object
 * @see https://scryfall.com/docs/api/cards
 */
export interface Card {
    id: ScryfallUUID,
    name: string,
    legalities: {
        standard: CardLegality,
        pioneer: CardLegality,
        modern: CardLegality,
        legacy: CardLegality,
        vintage: CardLegality,
        pauper: CardLegality,
    },
    cachedAt: number,
}

export type CardLegality = ('banned' | 'legal');

export type ScryfallUUID = string;
