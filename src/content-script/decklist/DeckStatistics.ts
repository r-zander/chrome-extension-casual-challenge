import {SingleCardResponse} from "../../common/types";

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

    addEntry(cardName: string, cardInfo: SingleCardResponse, cardCount: number) {
        this.entries.push(new DeckEntry(cardName, cardCount, cardInfo.budgetPoints, cardInfo.banStatus));
        this._cardCount += cardCount;
        this._budgetPoints += (cardCount * cardInfo.budgetPoints);
        if (cardInfo.banStatus !== null) {
            switch (cardInfo.banStatus) {
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
