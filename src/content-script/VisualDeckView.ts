import {addGlobalClass} from "./_EnhancedView";
import {AbstractDeckView} from "./AbstractDeckView";
import {formatBudgetPoints} from "../common/formatting";

export const templateFn: (cssClass: string, text: string, html?: string) => string =
    (cssClass, text, html = '') =>
        `<div class="legality-overlay ${cssClass}"></div>
<span class="card-grid-item-count card-grid-item-legality ${cssClass}">${text}${html}</span>`;

export class VisualDeckView extends AbstractDeckView {
    public async onInit(): Promise<void> {
        addGlobalClass('mode-deck-visual');
    }

    protected override async checkDeck(): Promise<void> {
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

        document.querySelectorAll('.card-grid-item').forEach((deckListEntry: HTMLElement) => {
            if (deckListEntry.classList.contains('flexbox-spacer')) {
                return;
            }
            const cardId = deckListEntry.dataset.cardId;
            const cardItem = deckListEntry.querySelector('.card-grid-item-card') as HTMLElement;
            const cardCountText = deckListEntry.querySelector('.card-grid-item-count').textContent;
            const cardCount = parseInt(cardCountText.replace(/[^\d]/g, ''));

            cardItem.append(this.loadingTemplate.content.cloneNode(true));
            cardItem.classList.add('loading');

            this.cardLoader.register(cardId).then(card => {
                this.deckStatistics.addEntry(card, cardCount);
                this.appendToDeckListEntryImage(deckListEntry, card);

                const formattedBP = formatBudgetPoints(card.budgetPoints * cardCount);
                cardItem.insertAdjacentHTML('beforeend',
                    `<span class="card-grid-item-count card-grid-item-budget-points layout-${card.layout}">${formattedBP} BP</span>`);
            });
        });

        this.cardLoader.start().then(() => {
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
