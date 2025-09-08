import {Layout} from 'scryfall-api';

export interface SingleBanResponse {
    banStatus: string,
    formats: BanFormats
}

export interface SingleCardResponse {
    budgetPoints: number,
    banStatus: string,
    banFormats: BanFormats
}

export type MultiCardsResponse = Map<string, SingleCardResponse>;

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
        casualChallenge: CasualCardLegality,
    },
    cachedAt: number,
    layout: keyof typeof Layout,
}

export type CardLegality = ('banned' | 'legal' | 'not_legal' | 'restricted' | 'UNKNOWN');
export type CasualCardLegality = (CardLegality | 'extended');

export type ScryfallUUID = string;

export type DeckEntryUUID = string;

export type CardDigest = {
    id: ScryfallUUID,
    name: string,
}

export type BoardEntry = {
    id: DeckEntryUUID,
    count: number,
    card_digest: CardDigest | null,
}

export type MessageType =
    DeckLoadedMessageType
    | DeckEntryMessageType
    | DeckEntryRemovedMessageType;

export type DeckLoadedMessageType = {
    event: 'deck.loaded',
    payload: {
        entries: { [key: string]: BoardEntry[] }
    }
}

export type DeckEntryMessageType = {
    event: 'card.added' | 'card.updated' | 'card.replaced',
    payload: BoardEntry
}

export type DeckEntryRemovedMessageType = {
    event: 'card.removed',
    payload: {
        id: DeckEntryUUID
    }
}
