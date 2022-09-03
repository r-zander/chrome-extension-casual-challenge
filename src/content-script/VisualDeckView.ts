import {addGlobalClass} from "./EnhancedView";
import {AbstractDeckView} from "./AbstractDeckView";
import {CardLoader} from "./CardLoader";
import {formatBudgetPoints} from "../common/formatting";

export const templateFn: (cssClass: string, text: string, html?: string) => string =
    (cssClass, text, html = '') =>
`<div class="legality-overlay ${cssClass}"></div>
<span class="card-grid-item-count card-grid-item-legality ${cssClass}">${text}${html}</span>`;

export class VisualDeckView extends AbstractDeckView {
    public async onInit(): Promise<void> {
        addGlobalClass('mode-deck-visual');
    }

    protected async checkDeck(): Promise<void> {
        await super.checkDeck();

        if (this.contentWasChecked) {
            // Just show our elements
            document.querySelectorAll('.card-grid-item-card > .legality-overlay, .card-grid-item-card > .card-grid-item-legality')
                .forEach(element => {
                    element.classList.remove('hidden');
                });

            this.displayEnabled();
            return;
        }

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

        document.querySelectorAll('.card-grid-item').forEach((deckListEntry: HTMLElement) => {
            if (deckListEntry.classList.contains('flexbox-spacer')) {
                return;
            }
            const cardId = deckListEntry.dataset.cardId;
            const cardItem = deckListEntry.querySelector('.card-grid-item-card') as HTMLElement;
            const cardCountText = deckListEntry.querySelector('.card-grid-item-count').textContent;
            const cardCount = parseInt(cardCountText.replace(/[^\d]/g, ''));

            cardItem.append(loadingTemplate.content.cloneNode(true));
            cardItem.classList.add('loading');

            cardLoader.register(cardId).then(card => {
                this.deckStatistics.addEntry(card, cardCount);
                this.appendToDeckListEntryImage(
                    deckListEntry,
                    card,
                    legalTemplate,
                    notLegalTemplate,
                    bannedTemplate,
                    extendedTemplate
                );

                const formattedBP = formatBudgetPoints(card.budgetPoints * cardCount);
                cardItem.insertAdjacentHTML('beforeend',
                    `<span class="card-grid-item-count card-grid-item-budget-points layout-${card.layout}">${formattedBP} BP</span>`);
            });
        });

        cardLoader.start().then(() => {
            this.sidebar.renderDeckStatistics(this.deckStatistics);
            this.displayEnabled();
            this.contentWasChecked = true;
        });
    }


    protected getElementsToHideSelector(): string {
        return '.card-grid-item-card > .legality-overlay,' +
               '.card-grid-item-card > .card-grid-item-legality';
    }
}
