import {addGlobalClass} from "./_EnhancedView";
import {AbstractDeckView} from "./AbstractDeckView";
import {formatBudgetPoints} from "../common/formatting";
import {FullCard} from "../common/card-representations";
import {MetaBar} from "./decklist/types";
import {EditSidebar} from "./decklist/EditSidebar";
import {BoardEntry, DeckEntryMessageType, DeckLoadedMessageType} from "../common/types";

type Entry = {
    entryId: string,
    section: {
        identifier: string,
        title: string
    },
    element: HTMLElement
}

export class EditDeckView extends AbstractDeckView {

    private entries: { [key: string]: Entry } = {};
    private deckListSections: { [key: string]: HTMLElement } = {};

    public async onInit(): Promise<void> {
        const port = chrome.runtime.connect({name: 'ContentScript.EditDeckView'});
        port.onMessage.addListener((message: DeckLoadedMessageType | DeckEntryMessageType) => {
            console.log('Received message through port', message);

            switch (message.event) {
                case 'deck.loaded':
                    Object.values(message.payload.entries).forEach((boardEntries: BoardEntry[]) => {
                        boardEntries
                            .filter((boardEntry: BoardEntry) => boardEntry.card_digest !== null)
                            .forEach((boardEntry: BoardEntry) => {
                                this.cardLoader.register(boardEntry.card_digest.id).then(card => {
                                    if (!Object.prototype.hasOwnProperty.call(this.entries, boardEntry.id)) return;

                                    const deckEntry = this.entries[boardEntry.id];

                                    this.deckStatistics.addEntry(card, boardEntry.count, deckEntry.section.identifier, deckEntry.section.title);
                                    this.modifyCardItem(deckEntry.element, card);

                                    deckEntry.element.querySelector('.deck-list-entry-axial-data > .currency-eur').innerHTML =
                                        formatBudgetPoints(card.budgetPoints * boardEntry.count);
                                });
                            });
                    });
                    break;
                case 'card.added':
                    // TODO
                    break;
                case 'card.updated': {
                    const deckEntryMessage = message as DeckEntryMessageType;
                    this.cardLoader.loadSingle(deckEntryMessage.payload.card_digest.id)
                        .then(card => {
                            const entryId = deckEntryMessage.payload.id;
                            if (!Object.prototype.hasOwnProperty.call(this.entries, entryId)) return;

                            const deckEntry = this.entries[entryId];

                            // TODO change entry
                            // this.deckStatistics.addEntry(card, deckEntryMessage.payload.count, deckEntry.section.identifier, deckEntry.section.title);
                            this.modifyCardItem(deckEntry.element, card);

                            deckEntry.element.querySelector('.deck-list-entry-axial-data > .currency-eur').innerHTML =
                                formatBudgetPoints(card.budgetPoints * deckEntryMessage.payload.count);
                        });
                    break;
                }
            }

            this.cardLoader.start().then(() => {
                this.sidebar.renderDeckStatistics(this.deckStatistics);
                this.renderSectionStatistics(this.deckListSections);
                this.displayEnabled();
                document.querySelectorAll(`.deckbuilder-entry-information.loading .card-legality,
                .deckbuilder-entry-information.loading .deck-list-entry-axial-data`)
                    .forEach(element => {
                        element.parentElement.style.display = 'none';
                    })
                this.contentWasChecked = true;
            });
        });

        addGlobalClass('mode-deck-list');
    }

    protected override createMetaBar(): MetaBar {
        this.sidebar = new EditSidebar();
        this.sidebar.init();

        return this.sidebar;
    }

    protected override findDeckTitle(): string {
        return (document.querySelector('input#name') as HTMLInputElement).value;
    }

    protected override async checkDeck(): Promise<void> {
        console.log('EditDeckView.checkDeck 1');
        await super.checkDeck();

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

                    const deckListSection = addedNode;
                    console.log('EditDeckView on deckListSection', deckListSection);
                    const sectionIdentifier = 'section-' + index;
                    this.deckListSections[sectionIdentifier] = deckListSection;
                    let sectionTitle: string = null;

                    const titleElement = deckListSection.querySelector('.deckbuilder-section-title');
                    if (titleElement !== null) {
                        sectionTitle = titleElement.textContent;
                    }
                    deckListSection.querySelectorAll('.deckbuilder-entry').forEach((deckListEntry: HTMLElement) => {
                        console.log('EditDeckView on deckListEntry', deckListEntry);
                        const entryId = deckListEntry.dataset.entry;


                        const informationElement = deckListEntry.querySelector('.deckbuilder-entry-information');
                        informationElement.insertAdjacentHTML('beforeend',
                            `<span class="deckbuilder-entry-status">
    <span class="deck-list-entry-axial-data">
        <span class="currency-eur"></span>
    </span>
</span>`);
                        informationElement.append(this.loadingTemplate.content.cloneNode(true));
                        informationElement.classList.add('loading');

                        this.entries[entryId] = {
                            entryId: entryId,
                            section: {
                                identifier: sectionIdentifier,
                                title: sectionTitle
                            },
                            element: informationElement as HTMLElement
                        }
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

    private renderSectionStatistics(deckListSections: { [key: string]: HTMLElement }): void {
        // TODO
        // for (const [sectionIdentifier, deckListSection] of Object.entries(deckListSections)) {
        //     const titleElement = deckListSection.querySelector('.deck-list-section-title');
        //     if (titleElement === null) continue;
        //
        //     titleElement.insertAdjacentHTML(
        //         'beforeend',
        //         ' <span class="budget-points">(' +
        //         formatBudgetPoints(this.deckStatistics.getSection(sectionIdentifier).budgetPoints) +
        //         ' BP)</span>'
        //     );
        // }
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
