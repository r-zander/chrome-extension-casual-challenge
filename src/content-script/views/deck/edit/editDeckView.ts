import {addGlobalClass} from "../../enhancedView";
import {AbstractDeckView} from "../abstractDeckView";
import {formatBudgetPoints} from "../../../../common/formatting";
import {FullCard} from "../../../../common/cardRepresentations";
import {EditSidebar} from "./editSidebar";
import {
    BoardEntry,
    CardDigest,
    DeckEntryMessageType,
    DeckEntryRemovedMessageType,
    DeckEntryUUID,
    DeckLoadedMessageType,
    MessageType
} from "../../../../common/types";
import {CardLoader} from "../../../cardLoader";

type Entry = {
    entryId: string,
    section: {
        identifier: string,
        title: string
    },
    element: HTMLElement,
    cardDigest?: CardDigest,
}

export class EditDeckView extends AbstractDeckView<EditSidebar> {

    private entries: { [key: DeckEntryUUID]: Entry } = {};
    private deckListSections: { [key: string]: HTMLElement } = {};

    public async onInit(): Promise<void> {
        const port = chrome.runtime.connect({name: 'ContentScript.EditDeckView'});
        port.onMessage.addListener((message: MessageType) => {
            switch (message.event) {
                case 'deck.loaded':
                    this.handleDeckLoaded(message as DeckLoadedMessageType);
                    break;
                case 'card.added':
                    this.handleCardAdded(message as DeckEntryMessageType);
                    break;
                case 'card.removed':
                    this.handleCardRemoved(message as DeckEntryRemovedMessageType);
                    break;
                case 'card.updated':
                    this.handleCardUpdated(message as DeckEntryMessageType);
                    break;
                case 'card.replaced':
                    this.handleCardReplaced(message as DeckEntryMessageType);
                    break;
            }
        });

        // Only add class after we successfully opened a connection to prevent
        // the layout from changing if the deck builder was not actually enhanced.
        addGlobalClass('mode-deck-list');
    }

    private handleDeckLoaded(message: DeckLoadedMessageType) {
        Object.values(message.payload.entries).forEach((boardEntries: BoardEntry[]) => {
            boardEntries
                .filter((boardEntry: BoardEntry) => boardEntry.card_digest !== null)
                .forEach((boardEntry: BoardEntry) => {
                    this.cardLoader.register(boardEntry.card_digest.id).then(card => {
                        if (!Object.prototype.hasOwnProperty.call(this.entries, boardEntry.id)) return;

                        const deckEntry = this.entries[boardEntry.id];
                        this.applyLoadedValues(deckEntry, boardEntry, card);
                    });
                });
        });

        this.cardLoader.start().then(() => {
            this.metaBar.renderDeckStatistics(this.deckStatistics);
            this.renderSectionStatistics();
            this.displayEnabled();
            document.querySelectorAll(`.deckbuilder-entry-information.loading .card-legality,
            .deckbuilder-entry-information.loading .deck-list-entry-axial-data`)
                .forEach(element => {
                    element.parentElement.style.display = 'none';
                })
            this.contentWasChecked = true;
        });
    }

    private handleCardAdded(deckEntryMessage: DeckEntryMessageType) {
        new CardLoader().loadSingle(deckEntryMessage.payload.card_digest.id)
            .then(card => {
                const entryId = deckEntryMessage.payload.id;
                // Step 1 - Find and enhance deck list entry
                const deckListEntry = document.querySelector(`[data-entry="${entryId}"]`) as HTMLElement;
                if (deckListEntry === null) {
                    console.warn('Card Added - unable to find deck list entry.', entryId);
                    return;
                }

                const sectionElement = deckListEntry.closest('.deckbuilder-section') as HTMLElement;
                // O(n) reverse sectionIdentifier lookup
                let sectionIdentifier: string = null;
                for (const [keySectionIdentifier, valueSectionElement] of Object.entries(this.deckListSections)) {
                    if (sectionElement === valueSectionElement) {
                        sectionIdentifier = keySectionIdentifier;
                        break;
                    }
                }

                if (sectionIdentifier === null) {
                    console.warn('Card Added - unable to find section identifier.', entryId, sectionElement);
                }

                const titleElement = sectionElement.querySelector('.deckbuilder-section-title');
                let sectionTitle: string = null;
                if (titleElement !== null) {
                    sectionTitle = titleElement.textContent;
                }

                const deckEntry = this.enhanceDeckListEntry(deckListEntry, entryId, sectionIdentifier, sectionTitle);

                // Step 2 - Apply loaded card values
                this.applyLoadedValues(deckEntry, deckEntryMessage.payload, card);

                this.metaBar.renderDeckStatistics(this.deckStatistics);
                this.renderSectionStatistics();
            });
    }

    private handleCardUpdated(deckEntryMessage: DeckEntryMessageType) {
        new CardLoader().loadSingle(deckEntryMessage.payload.card_digest.id)
            .then(card => {
                const entryId = deckEntryMessage.payload.id;
                // if (!Object.prototype.hasOwnProperty.call(this.entries, entryId)) return;

                const deckEntry = this.entries[entryId];

                this.deckStatistics.updateEntry(card, deckEntryMessage.payload.count, deckEntry.section.identifier, deckEntry.section.title);
                this.modifyCardItem(deckEntry.element, card);

                deckEntry.element.querySelector('.deck-list-entry-axial-data > .currency-eur').innerHTML =
                    formatBudgetPoints(card.budgetPoints * deckEntryMessage.payload.count);

                this.metaBar.renderDeckStatistics(this.deckStatistics);
                this.renderSectionStatistics();
            });
    }

    private handleCardReplaced(deckEntryMessage: DeckEntryMessageType) {
        new CardLoader().loadSingle(deckEntryMessage.payload.card_digest.id)
            .then(card => {
                const entryId = deckEntryMessage.payload.id;
                // if (!Object.prototype.hasOwnProperty.call(this.entries, entryId)) return;

                const deckEntry = this.entries[entryId];

                if (deckEntry.cardDigest !== undefined) {
                    this.deckStatistics.removeEntry(deckEntry.cardDigest.name, deckEntry.section.identifier, deckEntry.section.title);
                }
                this.applyLoadedValues(deckEntry, deckEntryMessage.payload, card);

                this.metaBar.renderDeckStatistics(this.deckStatistics);
                this.renderSectionStatistics();
            });
    }

    private handleCardRemoved(message: DeckEntryRemovedMessageType) {
        const entryId = message.payload.id;
        if (!Object.prototype.hasOwnProperty.call(this.entries, entryId)) return;

        const deckEntry = this.entries[entryId];
        this.deckStatistics.removeEntry(deckEntry.cardDigest.name, deckEntry.section.identifier, deckEntry.section.title);

        this.metaBar.renderDeckStatistics(this.deckStatistics);
        this.renderSectionStatistics();
    }

    private applyLoadedValues(deckEntry: Entry, boardEntry: BoardEntry, card: FullCard) {
        deckEntry.cardDigest = boardEntry.card_digest;

        this.deckStatistics.addEntry(card, boardEntry.count, deckEntry.section.identifier, deckEntry.section.title);
        this.modifyCardItem(deckEntry.element, card);

        deckEntry.element.querySelector('.deck-list-entry-axial-data > .currency-eur').innerHTML =
            formatBudgetPoints(card.budgetPoints * boardEntry.count);
    }

    protected override createMetaBar(): EditSidebar {
        const sidebar = new EditSidebar();
        sidebar.init();

        return sidebar;
    }

    protected override findDeckTitle(): string {
        return (document.querySelector('input#name') as HTMLInputElement).value;
    }

    protected override async enhanceView(): Promise<void> {
        await super.enhanceView();

        const deckElement = document.getElementById('deckbuilder');
        if (deckElement !== null) {
            deckElement.classList.add('casual-challenge-deck');
        }

        // if (this.contentWasChecked) {
        //     // Just show our elements
        //     document.querySelectorAll('.deck-list-entry > .card-legality').forEach(element => {
        //         element.classList.remove('hidden');
        //     });
        //
        //     this.displayEnabled();
        //     return;
        // }

        const mutationObserver = new MutationObserver((mutationList, observer) => {
            for (let index = 0; index < mutationList.length; index++) {
                mutationList[index].addedNodes.forEach((addedNode: HTMLElement) => {
                    if (!addedNode.classList.contains('deckbuilder-section')) return;

                    const sectionElement = addedNode;
                    const sectionIdentifier = 'section-' + index;
                    this.deckListSections[sectionIdentifier] = sectionElement;
                    let sectionTitle: string = null;

                    const titleElement = sectionElement.querySelector('.deckbuilder-section-title');
                    sectionTitle = titleElement.textContent;
                    titleElement.insertAdjacentHTML('afterend',
                        `<span class="deckbuilder-section-budget-points deckbuilder-section-count"></span>`);

                    sectionElement.querySelectorAll('.deckbuilder-entry').forEach((deckListEntry: HTMLElement) => {
                        const entryId = deckListEntry.dataset.entry;
                        this.enhanceDeckListEntry(deckListEntry, entryId, sectionIdentifier, sectionTitle);
                    });
                });
            }

            // Found changes, can stop listing
            observer.disconnect();
        });

        mutationObserver.observe(document.querySelector('.deckbuilder-columns'), {
            childList: true,
            subtree: true
        });
    }

    private enhanceDeckListEntry(deckListEntry: HTMLElement, entryId: string, sectionIdentifier: string, sectionTitle: string): Entry {
        const informationElement = deckListEntry.querySelector('.deckbuilder-entry-information');
        informationElement.insertAdjacentHTML('beforeend', `
<span class="deckbuilder-entry-status">
    <span class="deck-list-entry-axial-data">
        <span class="currency-eur"></span>
    </span>
</span>`);
        informationElement.append(this.loadingTemplate.content.cloneNode(true));
        informationElement.classList.add('loading');

        const entry = {
            entryId: entryId,
            section: {
                identifier: sectionIdentifier,
                title: sectionTitle
            },
            element: informationElement as HTMLElement
        };
        this.entries[entryId] = entry;

        return entry;
    }

    private renderSectionStatistics(): void {
        for (const [sectionIdentifier, deckListSection] of Object.entries(this.deckListSections)) {
            const bpElement = deckListSection.querySelector('.deckbuilder-section-budget-points');
            bpElement.innerHTML = formatBudgetPoints(this.deckStatistics.getSection(sectionIdentifier).budgetPoints) + ' BP';
        }
    }

    protected override createTemplate(cssClass: string, text: string, html: string = ''): string {
        return `<span class="deckbuilder-entry-status">
    <dl class="card-legality">
        <dd class="${cssClass}" title="${text}">${text}${html}</dd>
    </dl>
</span>`;
    }

    protected override modifyCardItem(element: HTMLElement, card: FullCard) {
        element.querySelector('.card-legality').parentElement.remove();
        super.modifyCardItem(element, card);
    }

    protected getElementsToHideSelector(): string {
        return '.deckbuilder-entry > .card-legality';
    }
}
