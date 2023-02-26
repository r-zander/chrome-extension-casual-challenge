import {addGlobalClass, EnhancedView, removeGlobalClass} from "./EnhancedView";
import {StorageKeys, syncStorage} from "../common/storage";
import {CheckMode, MetaBar} from "./decklist/types";
import {SearchControls} from "./decklist/SearchControls";
import {formatBudgetPoints} from "../common/formatting";

export class GridSearchView extends EnhancedView {
    private mode: CheckMode;
    private searchControls: SearchControls;

    public async onInit() {
        this.mode = await syncStorage.get<CheckMode>(StorageKeys.SEARCH_CHECK_MODE, 'overlay');
        switch (this.mode) {
            case 'overlay':
                addGlobalClass('mode-search-images-overlay');
                break;
            case 'disabled':
                addGlobalClass('mode-search-images-disabled');
                return;
        }
    }

    protected createMetaBar(): MetaBar {
        this.searchControls = new SearchControls(this.mode);
        this.searchControls.init();

        this.searchControls.setOnDisabledHandler(this.disableChecks.bind(this));
        this.searchControls.setOnOverlayHandler(this.enableChecks.bind(this));

        this.searchControls.hideLoadingIndicator();

        return this.searchControls;
    }

    protected async shouldEnableChecks(): Promise<boolean> {
        return this.mode !== 'disabled';
    }

    protected async checkDeck(): Promise<void> {
        if (this.contentWasChecked) {
            // Just show our elements
            removeGlobalClass('mode-search-images-disabled');
            addGlobalClass('mode-search-images-overlay');
            document.querySelectorAll(this.getElementsToHideSelector()).forEach(element => {
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

            cardItem.append(this.loadingTemplate.content.cloneNode(true));
            cardItem.classList.add('loading');

            this.cardLoader.register(cardId).then(card => {
                this.appendToDeckListEntryImage(deckListEntry, card);
                const formattedBP = formatBudgetPoints(card.budgetPoints);
                cardItem.insertAdjacentHTML('beforeend',
                    `<span class="card-grid-item-count card-grid-item-budget-points layout-${card.layout}">${formattedBP} BP</span>`)
            });
        });

        this.cardLoader.start().then(() => {
            this.displayEnabled();
            this.contentWasChecked = true;
        });
    }

    protected async storeCheckFlag(newValue: CheckMode) {
        return syncStorage.set(StorageKeys.SEARCH_CHECK_MODE, newValue);
    }

    protected onDisableChecks() {
        removeGlobalClass('mode-search-images-overlay');
        addGlobalClass('mode-search-images-disabled');
    }

    protected getElementsToHideSelector(): string {
        return '.card-grid-item-card > .legality-overlay,' +
               '.card-grid-item-card > .card-grid-item-legality,' +
               '.card-grid-item-card > .card-grid-item-budget-points';
    }
}
