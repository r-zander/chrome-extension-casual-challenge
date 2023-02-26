import {CheckMode, MetaBar} from "./decklist/types";
import {StorageKeys, syncStorage} from "../common/storage";
import {FullCard} from "../common/card-representations";
import {CardLoader} from "./CardLoader";

export function addGlobalClass(cssClass: string) {
    document.querySelector('#main').classList.add(cssClass);
}

export function removeGlobalClass(cssClass: string) {
    document.querySelector('#main').classList.remove(cssClass);
}

/**
 * Only looks at Casual Challenge relevant formats.
 */
function isBannedInAnyFormat(card: FullCard) {
    const legalities = card.legalities;
    return legalities.standard === 'banned' ||
        legalities.pioneer === 'banned' ||
        legalities.modern === 'banned' ||
        legalities.legacy === 'banned' ||
        legalities.vintage === 'banned' ||
        legalities.pauper === 'banned';
}

export abstract class EnhancedView {
    private metaBar: MetaBar;
    private displayExtended: boolean = false;
    protected contentWasChecked: boolean = false;

    private _loadingTemplate: HTMLTemplateElement = null;
    private _legalTemplate: HTMLTemplateElement = null;
    private _notLegalTemplate: HTMLTemplateElement = null;
    private _bannedTemplate: HTMLTemplateElement = null;
    private _extendedTemplate: HTMLTemplateElement = null;
    private _cardLoader: CardLoader = null;

    public async init(): Promise<void> {
        await this.onInit();
        this.initMetaBar();
        if (await this.shouldEnableChecks()) {
            // TODO automatically adjust display when the value changes
            this.displayExtended = await syncStorage.get(StorageKeys.DISPLAY_EXTENDED, false);
            await this.checkDeck();
        } else {
            this.displayDisabled();
        }
    }

    public abstract onInit(): Promise<void>;

    private initMetaBar(): void {
        this.metaBar = this.createMetaBar();
    }

    protected abstract createMetaBar(): MetaBar;

    protected abstract shouldEnableChecks(): Promise<boolean>;

    // TODO rename
    protected abstract checkDeck(): Promise<void>;

    protected get loadingTemplate(): HTMLTemplateElement {
        if (this._loadingTemplate === null) {
            this._loadingTemplate = document.createElement('template');
            this._loadingTemplate.innerHTML = this.createTemplate('loading', '', '<div class="dot-flashing"></div>');
        }
        return this._loadingTemplate;
    }

    protected get legalTemplate(): HTMLTemplateElement {
        if (this._legalTemplate === null) {
            this._legalTemplate = document.createElement('template');
            this._legalTemplate.innerHTML = this.createTemplate('legal', 'Legal');
        }
        return this._legalTemplate;
    }

    protected get notLegalTemplate(): HTMLTemplateElement {
        if (this._notLegalTemplate === null) {
            this._notLegalTemplate = document.createElement('template');
            this._notLegalTemplate.innerHTML = this.createTemplate('not-legal', 'Not Legal');
        }
        return this._notLegalTemplate;
    }

    protected get bannedTemplate(): HTMLTemplateElement {
        if (this._bannedTemplate === null) {
            this._bannedTemplate = document.createElement('template');
            this._bannedTemplate.innerHTML = this.createTemplate('banned', 'Banned');
        }
        return this._bannedTemplate;
    }

    protected get extendedTemplate(): HTMLTemplateElement {
        if (this._extendedTemplate === null) {
            this._extendedTemplate = document.createElement('template');
            this._extendedTemplate.innerHTML = this.createTemplate('extended', 'Extended');
        }
        return this._extendedTemplate;
    }

    protected get cardLoader(): CardLoader {
        if (this._cardLoader === null) {
            this._cardLoader = new CardLoader();
        }

        return this._cardLoader;
    }

    protected createTemplate(cssClass: string, text: string, html: string = ''): string {
        return `<div class="legality-overlay ${cssClass}"></div>
<span class="card-grid-item-count card-grid-item-legality ${cssClass}">${text}${html}</span>`;
    };

    protected appendToDeckListEntryImage(
        deckListEntry: HTMLElement,
        card: FullCard,
    ) {
        deckListEntry.querySelector('.legality-overlay').remove();
        deckListEntry.querySelector('.card-grid-item-legality').remove();
        const cardItem = deckListEntry.querySelector('.card-grid-item-card') as HTMLElement;
        this.modifyCardItem(cardItem, card);
    }

    protected modifyCardItem(
        cardItem: HTMLElement,
        card: FullCard,
    ) {
        cardItem.classList.remove('loading');

        if (card.legalities.vintage === 'not_legal' ||
            card.budgetPoints === null ||
            card.budgetPoints === 0
        ) {
            cardItem.append(this.notLegalTemplate.content.cloneNode(true));
            cardItem.classList.add('not-legal');
        } else if (card.banStatus === 'banned'
            || card.legalities.vintage === 'restricted'
            || isBannedInAnyFormat(card)
        ) {
            cardItem.append(this.bannedTemplate.content.cloneNode(true));
            cardItem.classList.add('banned');
        } else if (this.displayExtended && card.banStatus === 'extended') {
            cardItem.append(this.extendedTemplate.content.cloneNode(true));
            cardItem.classList.add('extended');
        } else {
            cardItem.append(this.legalTemplate.content.cloneNode(true));
            cardItem.classList.add('legal');
        }
    }

    protected abstract storeCheckFlag(newValue: CheckMode): Promise<void>;

    protected enableChecks() {
        this.displayLoading();
        this.storeCheckFlag('overlay')
            .then(() => this.checkDeck());
    }

    protected disableChecks(): void {
        this.displayLoading();
        this.storeCheckFlag('disabled')
            .then(() => {
                if (this.contentWasChecked) {
                    // Hide everything we added
                    this.onDisableChecks();
                    document.querySelectorAll(this.getElementsToHideSelector()).forEach(element => {
                        element.classList.add('hidden');
                    });
                }

                this.displayDisabled();
            });
    }

    protected abstract onDisableChecks(): void;

    protected abstract getElementsToHideSelector(): string;

    protected displayLoading() {
        console.log('isEnabled', 'loading');

        // switch (contentMode) {
        //     case CONTENT_MODE_SEARCH_IMAGES:
        //         return;
        // }

        this.metaBar.displayLoading();
    }

    protected displayDisabled() {
        console.log('isEnabled', false);

        // switch (contentMode) {
        //     case CONTENT_MODE_SEARCH_IMAGES:
        //         return;
        // }

        this.metaBar.displayDisabled();
    }

    protected displayEnabled() {
        console.log('isEnabled', true);

        // switch (contentMode) {
        //     case CONTENT_MODE_SEARCH_IMAGES:
        //         return;
        // }

        this.metaBar.displayEnabled();
    }

}
