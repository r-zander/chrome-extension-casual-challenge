import {StatisticsCard} from "../../../common/cardRepresentations";

export class DeckStatistics {
    private readonly _displayExtended: boolean;
    private readonly totalSection;
    private sections: { [key: string]: SectionStatistics } = {};
    private readonly _boards: { [key: string]: SectionStatistics };

    private _cachedLegalityDetails: { [key in LegalityDetail]: boolean } = null;

    constructor(displayExtended: boolean) {
        this._displayExtended = displayExtended;
        this.totalSection = new SectionStatistics(displayExtended);
        this._boards = {
            'Mainboard': new SectionStatistics(this._displayExtended),
            'Sideboard': new SectionStatistics(this._displayExtended),
        };
    }

    get isOverallLegal(): boolean {
        for (const legalityDetailString in LegalityDetail) {
            const legalityDetail = LegalityDetail[legalityDetailString as LegalityDetailStrings];

            if (!this.legalityDetails[legalityDetail]) {
                return false;
            }
        }

        return true;
    }

    get legalityDetails(): {[key in LegalityDetail]: boolean} {
        if (this._cachedLegalityDetails === null) {
            this._cachedLegalityDetails = this.determineLegalityDetails();
        }
        return this._cachedLegalityDetails;
    }

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
            this.sections[section] = new SectionStatistics(this._displayExtended);
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
                this.sections[section] = new SectionStatistics(this._displayExtended);
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
                    budgetPoints: removedEntry.budgetPoints,
                    legalities: removedEntry.legalities,
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
                this._boards[board] = new SectionStatistics(this._displayExtended);
            }
            return this._boards[board];
        } else {
            return this._boards['Mainboard'];
        }
    }

    private determineLegalityDetails(): { [key in LegalityDetail]: boolean } {
        const mainboard = this._boards['Mainboard'];
        const sideboard = this._boards['Sideboard'];

        return {
            [LegalityDetail.MainboardSize]: mainboard.cardCount >= 60,
            [LegalityDetail.SideboardSize]: sideboard.cardCount <= 15,
            [LegalityDetail.BudgetPoints]: (mainboard.budgetPoints + sideboard.budgetPoints) <= MAX_BUDGET_POINTS,
            [LegalityDetail.CardLegality]: mainboard.areAllCardsLegal && sideboard.areAllCardsLegal,
        };
    }
}

class SectionStatistics {
    private readonly _displayExtended: boolean;
    private _entries: { [key: string]: DeckEntry } = {};
    private _banStatus: (null | 'banned' | 'extended') = null;

    constructor(displayExtended: boolean) {
        this._displayExtended = displayExtended;
    }

    get cardCount(): number {
        return Object.values(this._entries)
            .map(entry => entry.count)
            .reduce((sum, entryCount) => sum + entryCount, 0);
    }

    get budgetPoints(): number {
        return Object.values(this._entries)
            .map(entry => entry.budgetPoints * entry.count)
            .reduce((sum, budgetPoints) => sum + budgetPoints, 0);
    }

    get areAllCardsLegal(): boolean {
        return Object.values(this._entries)
            .every(value => value.banStatus === 'legal');
    }

    get banStatus(): "banned" | "extended" | null {
        return this._banStatus;
    }

    addEntry(card: StatisticsCard, cardCount: number) {
        if (Object.prototype.hasOwnProperty.call(this._entries, card.name)) {
            this._entries[card.name].add(cardCount);
        } else {
            console.assert(cardCount > 0, 'Unexpected card count <= 0');
            this._entries[card.name] = new DeckEntry(card.name, cardCount, card.budgetPoints, this.getCardLegality(card), card.legalities);
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

    getCardLegality(card: StatisticsCard): string {
        if (isBasicLand(card)) {
            return 'legal';
        }

        if (card.legalities.vintage === 'not_legal'
            || card.budgetPoints === null
            || card.budgetPoints === 0
        ) {
            return 'not-legal';
        }

        if (card.banStatus === 'banned'
            || card.legalities.vintage === 'restricted'
            || isBannedInAnyFormat(card)
        ) {
            return 'banned';
        }

        if (this._displayExtended && card.banStatus === 'extended') {
            return 'extended';
        }

        return 'legal';
    }

    updateEntry(card: StatisticsCard, cardCount: number) {
        if (!Object.prototype.hasOwnProperty.call(this._entries, card.name)) {
            console.warn('SectionStatistics: Tried to update non-existent card.', card);
            return;
        }

        this._entries[card.name].update(cardCount);

        // No need to update the banStatus as it's the same based on the card
    }

    /**
     * @param name
     * @return the removed DeckEntry
     */
    removeEntry(name: string): DeckEntry {
        if (!Object.prototype.hasOwnProperty.call(this._entries, name)) {
            console.warn('SectionStatistics: Tried to remove non-existent card.', name);
            return;
        }

        const entry = this._entries[name];
        delete this._entries[name];
        return entry;
    }
}

class DeckEntry {
    private readonly _cardName: string;
    private _count: number;
    private readonly _budgetPoints: number;
    private readonly _banStatus: string;
    private readonly _legalities: PaperLegalities;

    constructor(cardName: string, count: number, budgetPoints: number, banStatus: string, legalities: PaperLegalities) {
        this._cardName = cardName;
        this._count = count;
        this._budgetPoints = budgetPoints;
        this._banStatus = banStatus;
        this._legalities = legalities;
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

    get legalities(): PaperLegalities {
        return this._legalities;
    }

    add(count: number) {
        this._count += count;
    }

    update(count: number) {
        this._count = count;
    }
}
