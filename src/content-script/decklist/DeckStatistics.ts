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
    private totalSection = new SectionStatistics;
    private sections: { [key: string]: SectionStatistics } = {};

     get cardCount(): number {
        return this.totalSection.cardCount;
    }

    get budgetPoints(): number {
        return this.totalSection.budgetPoints;
    }

    get banStatus(): "banned" | "extended" | null {
        return this.totalSection.banStatus;
    }

    public getSection(section: string): SectionStatistics {
         if (Object.prototype.hasOwnProperty.call(this.sections, section)) {
             return this.sections[section];
         }

         throw `No section "${section}" found.`;
    }

    addEntry(card: FullCard, cardCount: number, section: string|null = null) {
         this.totalSection.addEntry(card, cardCount);
         if (section !== null) {
             if (!Object.prototype.hasOwnProperty.call(this.sections, section)) {
                 this.sections[section] = new SectionStatistics();
             }
             this.sections[section].addEntry(card, cardCount);
         }
    }
}

class SectionStatistics {

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
