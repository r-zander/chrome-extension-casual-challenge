import {CardLegality, ScryfallUUID} from "./types";
import {Card, Format} from "scryfall-api";

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
            this.getLayout(cardFromApi)
        );
    }

    private static getLayout(cardFromApi: ScryfallCard): keyof typeof Layout {
        switch (cardFromApi.layout as string) {
            // For double faced cards, use the layout of the front
            case 'transform':
            case 'modal_dfc':
            case 'reversible_card': {// Scryfall doesn't provide the layout for card faces - so lets detect a few interesting layouts ourself
                const typeLine = cardFromApi.card_faces[0].type_line;
                if (typeLine.match(/\bEnchantment\b.*\bSaga\b/) !== null) {
                    return 'saga';
                }
                if (typeLine.match(/\bEnchantment\b.*\bClass\b/) !== null) {
                    return 'class';
                }
                return cardFromApi.layout as keyof typeof Layout;
            }
            default:
                return cardFromApi.layout as keyof typeof Layout;
        }
    }
}

export enum Layout {
    normal,
    split,
    flip,
    transform,
    modal_dfc,
    meld,
    leveler,
    'class',
    saga,
    adventure,
    planar,
    scheme,
    vanguard,
    token,
    double_faced_token,
    emblem,
    augment,
    host,
    art_series,
    reversible_card,
}

export interface StatisticsCard {
    readonly name: string,
    readonly budgetPoints: number;
    readonly banStatus: string;
    readonly legalities: PaperLegalities;
}

export class FullCard extends CachedScryfallCard implements StatisticsCard {
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
