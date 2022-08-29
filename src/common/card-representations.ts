import {CardLegality, ScryfallUUID} from "./types";
import {Card, Format} from "scryfall-api";
import {Layout} from "scryfall-api/dist/declarations/dist/src/types/Layout";

export class CasualChallengeCard {
    public readonly budgetPoints: number;
    public readonly banStatus: string;
    public readonly banFormats: Map<keyof typeof Format, number>;

    public constructor(
        budgetPoints: number,
        banStatus: string,
        banFormats: Map<keyof typeof Format, number>
    ) {
        this.budgetPoints = budgetPoints;
        this.banStatus = banStatus;
        this.banFormats = banFormats;
    }
}

export type ScryfallCard = Card;

export type PaperLegalities = {
    standard: CardLegality,
    pioneer: CardLegality,
    modern: CardLegality,
    legacy: CardLegality,
    vintage: CardLegality,
    pauper: CardLegality,
};

export class CachedScryfallCard {
    public readonly id: ScryfallUUID;
    public readonly name: string;
    public readonly legalities: PaperLegalities;
    public readonly cachedAt: number;
    public readonly layout: keyof typeof Layout;

    protected constructor(
        id: ScryfallUUID,
        name: string,
        legalities: PaperLegalities,
        cachedAt: number,
        layout: keyof typeof Layout
    ) {
        this.id = id;
        this.name = name;
        this.legalities = legalities;
        this.cachedAt = cachedAt;
        this.layout = layout;
    }

    public static fromScryfallCard(cardFromApi: ScryfallCard, cachedAt: number): CachedScryfallCard {
        return new CachedScryfallCard(
            cardFromApi.id,
            cardFromApi.name,
            {
                standard: cardFromApi.legalities.standard,
                pioneer: cardFromApi.legalities.pioneer,
                modern: cardFromApi.legalities.modern,
                legacy: cardFromApi.legalities.legacy,
                vintage: cardFromApi.legalities.vintage,
                pauper: cardFromApi.legalities.pauper,
            },
            cachedAt,
            cardFromApi.layout
        );
    }
}

export class FullCard extends CachedScryfallCard {
    public readonly budgetPoints: number;
    public readonly banStatus: string;
    public readonly banFormats: Map<keyof typeof Format, number>;

    public constructor(cachedCard: CachedScryfallCard, ccCard: CasualChallengeCard) {
        super(
            cachedCard.id,
            cachedCard.name,
            cachedCard.legalities,
            cachedCard.cachedAt,
            cachedCard.layout
        );

        this.budgetPoints = ccCard.budgetPoints;
        this.banStatus = ccCard.banStatus;
        this.banFormats = ccCard.banFormats;
    }
}
