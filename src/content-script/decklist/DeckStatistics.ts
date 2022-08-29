import {FullCard} from "../../common/card-representations";

class DeckEntry {
    public readonly cardName: string;
    public readonly count: number;
    public readonly budgetPoints: number;
    public readonly banStatus: string;

    constructor(cardName: string, count: number, budgetPoints: number, banStatus: string) {
        this.cardName = cardName;
        this.count = count;
        this.budgetPoints = budgetPoints;
        this.banStatus = banStatus;
    }
}

export class DeckStatistics {

    private entries: DeckEntry[] = [];
    private _cardCount: number = 0;
    private _budgetPoints: number = 0;
    private _banStatus: (null | 'banned' | 'extended') = null;

    get cardCount(): number {
        return this._cardCount;
    }

    get budgetPoints(): number {
        return this._budgetPoints;
    }

    get banStatus(): "banned" | "extended" | null {
        return this._banStatus;
    }

    addEntry(card: FullCard, cardCount: number) {
        this.entries.push(new DeckEntry(card.name, cardCount, card.budgetPoints, card.banStatus));
        this._cardCount += cardCount;
        this._budgetPoints += (cardCount * card.budgetPoints);
        if (card.banStatus !== null) {
            switch (card.banStatus) {
                case 'banned':
                    this._banStatus = 'banned';
                    break;
                case 'extended':
                    if (this._banStatus === null) {
                        this._banStatus = 'extended';
                    }
                    break;
            }
        }
    }
}
