import {addGlobalClass} from "./EnhancedView";
import {AbstractDeckView} from "./AbstractDeckView";
import {CardLoader} from "./CardLoader";
import {formatBudgetPoints} from "../common/formatting";
import {FullCard} from "../common/card-representations";

export class ListDeckView extends AbstractDeckView {
    public async onInit(): Promise<void> {
        addGlobalClass('mode-deck-list');
    }

    protected async checkDeck(): Promise<void> {
        await super.checkDeck();

        if (this.contentWasChecked) {
            // Just show our elements
            document.querySelectorAll('.deck-list-entry > .card-legality').forEach(element => {
                element.classList.remove('hidden');
            });

            this.displayEnabled();
            return;
        }

        const templateFn: (cssClass: string, text: string, html?: string) => string =
            (cssClass, text, html = '') => `<dl class="card-legality">
<dd class="${cssClass}" title="${text}">${text}${html}</dd></dl>`;

        const loadingTemplate = document.createElement('template');
        const legalTemplate = document.createElement('template');
        const notLegalTemplate = document.createElement('template');
        const bannedTemplate = document.createElement('template');
        const extendedTemplate = document.createElement('template');
        loadingTemplate.innerHTML = templateFn('loading', '', '<div class="dot-flashing"></div>');
        legalTemplate.innerHTML = templateFn('legal', 'Legal');
        notLegalTemplate.innerHTML = templateFn('not-legal', 'Not Legal');
        bannedTemplate.innerHTML = templateFn('banned', 'Banned');
        extendedTemplate.innerHTML = templateFn('extended', 'Extended');

        const cardLoader = new CardLoader();

        document.querySelectorAll('.deck-list-entry').forEach((deckListEntry: HTMLElement) => {
            const cardId = deckListEntry.dataset.cardId;
            const cardCount = parseInt(deckListEntry.querySelector('.deck-list-entry-count').textContent);

            // We need some more infos about the card, so lets queue it for loading
            deckListEntry.append(loadingTemplate.content.cloneNode(true));
            deckListEntry.classList.add('loading');

            cardLoader.register(cardId).then(card => {
                this.deckStatistics.addEntry(card, cardCount);
                this.appendToDeckListEntryRow(
                    deckListEntry,
                    card,
                    legalTemplate,
                    notLegalTemplate,
                    bannedTemplate,
                    extendedTemplate
                );

                const formattedBP = formatBudgetPoints(card.budgetPoints * cardCount);
                deckListEntry.querySelector('.deck-list-entry-axial-data').innerHTML =
                    `<span class="currency-eur">${formattedBP}</span>`
            });
        });


        cardLoader.start().then(() => {
            this.sidebar.renderDeckStatistics(this.deckStatistics);
            this.displayEnabled();
            this.contentWasChecked = true;
        });
    }

    /**
     * Just override `modifyCardItem`
     */
    private appendToDeckListEntryRow(
        deckListEntry: HTMLElement,
        card: FullCard,
        legalTemplate: HTMLTemplateElement,
        notLegalTemplate: HTMLTemplateElement,
        bannedTemplate: HTMLTemplateElement,
        extendedTemplate: HTMLTemplateElement
    ) {
        deckListEntry.querySelector('.card-legality').remove();
        this.modifyCardItem(deckListEntry, card, legalTemplate, notLegalTemplate, bannedTemplate, extendedTemplate);
    }

    protected getElementsToHideSelector(): string {
        return '.deck-list-entry > .card-legality';
    }

}
