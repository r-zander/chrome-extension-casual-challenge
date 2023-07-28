import {addGlobalClass} from "./_EnhancedView";
import {AbstractDeckView} from "./AbstractDeckView";
import {formatBudgetPoints} from "../common/formatting";
import {FullCard} from "../common/card-representations";
import {MetaBar} from "./decklist/types";

export class EditDeckView extends AbstractDeckView {
    public async onInit(): Promise<void> {
        const port = chrome.runtime.connect({name: 'ContentScript.EditDeckView'});
        port.onMessage.addListener(message => {
            console.log('Received message through port', message);
        });

        addGlobalClass('mode-deck-list');
    }

    // TODO
    // protected createMetaBar(): MetaBar {
    //      append to .deckbuilder-sidebar
    //          .deckbuilder-section-title-bar
    //          ol
    //              same entries as regular sidebar
    // }


    protected override findDeckTitle(): string {
        return (document.querySelector('input#name') as HTMLInputElement).value;
    }

    protected override async checkDeck(): Promise<void> {
        await super.checkDeck();

        // if (this.contentWasChecked) {
        //     // Just show our elements
        //     document.querySelectorAll('.deck-list-entry > .card-legality').forEach(element => {
        //         element.classList.remove('hidden');
        //     });
        //
        //     this.displayEnabled();
        //     return;
        // }

        const deckListSections: {[key: string]: HTMLElement} = {};
        document.querySelectorAll('.deck-list-section').forEach((deckListSection: HTMLElement, index) => {
            const sectionIdentifier = 'section-' + index;
            deckListSections[sectionIdentifier] = deckListSection;
            let sectionTitle: string = null;

            const titleElement = deckListSection.querySelector('.deck-list-section-title');
            if (titleElement !== null) {
                sectionTitle = titleElement.textContent;
            }
            deckListSection.querySelectorAll('.deck-list-entry').forEach((deckListEntry: HTMLElement) => {
                const cardId = deckListEntry.dataset.cardId;
                const cardCount = parseInt(deckListEntry.querySelector('.deck-list-entry-count').textContent);

                // We need some more infos about the card, so lets queue it for loading
                deckListEntry.append(this.loadingTemplate.content.cloneNode(true));
                deckListEntry.classList.add('loading');

                this.cardLoader.register(cardId).then(card => {
                    this.deckStatistics.addEntry(card, cardCount, sectionIdentifier, sectionTitle);
                    this.appendToDeckListEntryRow(deckListEntry, card,);

                    const formattedBP = formatBudgetPoints(card.budgetPoints * cardCount);
                    deckListEntry.querySelector('.deck-list-entry-axial-data').innerHTML =
                        `<span class="currency-eur">${formattedBP}</span>`
                });
            });
        });

        this.cardLoader.start().then(() => {
            this.sidebar.renderDeckStatistics(this.deckStatistics);
            this.renderSectionStatistics(deckListSections);
            this.displayEnabled();
            this.contentWasChecked = true;
        });
    }

    private renderSectionStatistics(deckListSections: { [key: string]: HTMLElement }): void {
        for (const [sectionIdentifier, deckListSection] of Object.entries(deckListSections)) {
            const titleElement = deckListSection.querySelector('.deck-list-section-title');
            if (titleElement === null) continue;

            titleElement.insertAdjacentHTML(
                'beforeend',
                ' <span class="budget-points">(' +
                formatBudgetPoints(this.deckStatistics.getSection(sectionIdentifier).budgetPoints) +
                ' BP)</span>'
            );
        }
    }

    protected override createTemplate(cssClass: string, text: string, html?: string): string {
        return `<dl class="card-legality">
<dd class="${cssClass}" title="${text}">${text}${html}</dd></dl>`;
    }

    /**
     * Just override `modifyCardItem`
     */
    private appendToDeckListEntryRow(deckListEntry: HTMLElement, card: FullCard) {
        deckListEntry.querySelector('.card-legality').remove();
        this.modifyCardItem(deckListEntry, card);
    }

    protected getElementsToHideSelector(): string {
        return '.deck-list-entry > .card-legality';
    }

}
