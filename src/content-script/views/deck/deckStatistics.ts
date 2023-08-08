import {StatisticsCard} from "../../../common/cardRepresentations";

export class DeckStatistics {
    private totalSection = new SectionStatistics;
    private sections: { [key: string]: SectionStatistics } = {};
    private _boards: { [key: string]: SectionStatistics } = {'Mainboard': new SectionStatistics()};

    get cardCount(): number {
        return this.totalSection.cardCount;
    }

    get budgetPoints(): number {
        return this.totalSection.budgetPoints;
    }

    get banStatus(): 'banned' | 'extended' | null {
        return this.totalSection.banStatus;
    }

    public getSection(section: string): SectionStatistics {
        if (!Object.prototype.hasOwnProperty.call(this.sections, section)) {
            this.sections[section] = new SectionStatistics();
        }

        return this.sections[section];
    }

    get boards(): { [key: string]: SectionStatistics } {
        return this._boards;
    }

    addEntry(card: StatisticsCard, cardCount: number, section: string | null = null, sectionTitle: string | null = null) {
        this.totalSection.addEntry(card, cardCount);
        if (section !== null) {
            if (!Object.prototype.hasOwnProperty.call(this.sections, section)) {
                this.sections[section] = new SectionStatistics();
            }
            this.sections[section].addEntry(card, cardCount);
        }

        this.findBoard(sectionTitle).addEntry(card, cardCount);
    }

    updateEntry(card: StatisticsCard, cardCount: number, section: string | null = null, sectionTitle: string | null = null) {
        this.totalSection.updateEntry(card, cardCount);
        if (section !== null) {
            if (Object.prototype.hasOwnProperty.call(this.sections, section)) {
                this.sections[section].updateEntry(card, cardCount);
            } else {
                console.warn('DeckStatistics: Tried to update card in non-existent section.', section, card);
            }
        }

        this.findBoard(sectionTitle).updateEntry(card, cardCount);
    }

    removeEntry(name: string, section: string | null = null, sectionTitle: string | null = null) {
        if (section !== null) {
            if (Object.prototype.hasOwnProperty.call(this.sections, section)) {
                const removedEntry = this.sections[section].removeEntry(name);
                this.totalSection.addEntry({
                    name: removedEntry.cardName,
                    banStatus: removedEntry.banStatus,
                    budgetPoints: removedEntry.budgetPoints
                }, -removedEntry.count);
            } else {
                console.warn('DeckStatistics: Tried to remove card from non-existent section.', section, name);
            }
        } else {
            this.totalSection.removeEntry(name);
        }

        this.findBoard(sectionTitle).removeEntry(name);
    }

    private findBoard(sectionTitle: string | null) {
        if (sectionTitle !== null && sectionTitle.includes('board')) {
            let board = sectionTitle.trim();
            board = board.replace(/\s*\(\d+\)$/, '');
            // Manual fixes
            switch (board) {
                case 'Sideboard Companions':
                    board = 'Sideboard';
                    break;
            }
            if (!Object.prototype.hasOwnProperty.call(this._boards, board)) {
                this._boards[board] = new SectionStatistics();
            }
            return this._boards[board];
        } else {
            return this._boards['Mainboard'];
        }
    }
}

class SectionStatistics {

    private entries: { [key: string]: DeckEntry } = {};
    private _banStatus: (null | 'banned' | 'extended') = null;

    get cardCount(): number {
        return Object.values(this.entries)
            .map(entry => entry.count)
            .reduce((sum, entryCount) => sum + entryCount, 0);
    }

    get budgetPoints(): number {
        return Object.values(this.entries)
            .map(entry => entry.budgetPoints * entry.count)
            .reduce((sum, budgetPoints) => sum + budgetPoints, 0);
    }

    get banStatus(): "banned" | "extended" | null {
        return this._banStatus;
    }

    addEntry(card: StatisticsCard, cardCount: number) {
        if (Object.prototype.hasOwnProperty.call(this.entries, card.name)) {
            this.entries[card.name].add(cardCount);
        } else {
            console.assert(cardCount > 0, 'Unexpected card count <= 0');
            this.entries[card.name] = new DeckEntry(card.name, cardCount, card.budgetPoints, card.banStatus);
        }

        if (card.banStatus === null) {
            return;
        }

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

    updateEntry(card: StatisticsCard, cardCount: number) {
        if (!Object.prototype.hasOwnProperty.call(this.entries, card.name)) {
            console.warn('SectionStatistics: Tried to update non-existent card.', card);
            return;
        }

        this.entries[card.name].update(cardCount);

        // No need to update the banStatus as its the same based on the card
    }

    /**
     * @param name
     * @return the removed DeckEntry
     */
    removeEntry(name: string): DeckEntry {
        if (!Object.prototype.hasOwnProperty.call(this.entries, name)) {
            console.warn('SectionStatistics: Tried to remove non-existent card.', name);
            return;
        }

        const entry = this.entries[name];
        delete this.entries[name];
        return entry;
    }
}

class DeckEntry {
    private readonly _cardName: string;
    private _count: number;
    private readonly _budgetPoints: number;
    private readonly _banStatus: string;

    constructor(cardName: string, count: number, budgetPoints: number, banStatus: string) {
        this._cardName = cardName;
        this._count = count;
        this._budgetPoints = budgetPoints;
        this._banStatus = banStatus;
    }

    get cardName(): string {
        return this._cardName;
    }

    get count(): number {
        return this._count;
    }

    get budgetPoints(): number {
        return this._budgetPoints;
    }

    get banStatus(): string {
        return this._banStatus;
    }

    add(count: number) {
        this._count += count;
    }

    update(count: number) {
        this._count = count;
    }
}
