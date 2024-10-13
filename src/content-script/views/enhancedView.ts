import {CheckMode, MetaBar} from "./metaBar";
import {StorageKeys, syncStorage} from "../../common/storage";
import {FullCard, StatisticsCard} from '../../common/cardRepresentations';
import {CardLoader} from "../cardLoader";
import {isBasicLand} from "../../common/casualChallengeLogic";

export function addGlobalClass(cssClass: string) {
    document.querySelector('#main').classList.add(cssClass);
}

export function removeGlobalClass(cssClass: string) {
    document.querySelector('#main').classList.remove(cssClass);
}

/**
 * Only looks at Casual Challenge relevant formats.
 */
export function isBannedInAnyFormat(card: StatisticsCard) {
    const legalities = card.legalities;
    return legalities.standard === 'banned' ||
        legalities.pioneer === 'banned' ||
        legalities.modern === 'banned' ||
        legalities.legacy === 'banned' ||
        legalities.vintage === 'banned' ||
        legalities.pauper === 'banned';
}

export abstract class EnhancedView<TMetaBar extends MetaBar> {
    protected metaBar: TMetaBar;
    protected contentWasChecked: boolean = false;

    private _displayExtended: boolean = false;
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
            this._displayExtended = await syncStorage.get(StorageKeys.DISPLAY_EXTENDED, false);
            await this.enhanceView();
        } else {
            this.displayDisabled();
        }
    }

    public abstract onInit(): Promise<void>;

    private initMetaBar(): void {
        this.metaBar = this.createMetaBar();
    }

    protected abstract createMetaBar(): TMetaBar;

    protected abstract shouldEnableChecks(): Promise<boolean>;

    // TODO rename
    protected abstract enhanceView(): Promise<void>;

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

    protected get displayExtended(): boolean {
        return this._displayExtended;
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

    protected modifyCardItem(cardItem: HTMLElement, card: FullCard) {
        cardItem.classList.remove('loading');

        if (isBasicLand(card)) {
            cardItem.append(this.legalTemplate.content.cloneNode(true));
            cardItem.classList.add('legal');
            return;
        }

        if (card.legalities.vintage === 'not_legal'
            || card.budgetPoints === null
            || card.budgetPoints === 0
        ) {
            cardItem.append(this.notLegalTemplate.content.cloneNode(true));
            cardItem.classList.add('not-legal');
            return;
        }

        if (card.banStatus === 'banned'
            || card.legalities.vintage === 'restricted'
            || isBannedInAnyFormat(card)
        ) {
            cardItem.append(this.bannedTemplate.content.cloneNode(true));
            cardItem.classList.add('banned');
            return;
        }

        if (this._displayExtended && card.banStatus === 'extended') {
            cardItem.append(this.extendedTemplate.content.cloneNode(true));
            cardItem.classList.add('extended');
            return;
        }

        cardItem.append(this.legalTemplate.content.cloneNode(true));
        cardItem.classList.add('legal');
    }

    protected abstract storeCheckFlag(newValue: CheckMode): Promise<void>;

    protected enableChecks() {
        this.displayLoading();
        this.storeCheckFlag('overlay')
            .then(() => this.enhanceView());
    }

    protected disableChecks(): void {
        this.displayLoading();
        this.storeCheckFlag('disabled')
            .then(() => {
                if (this.contentWasChecked) {
                    // Hide everything we added
                    this.onDisableChecks();
                    const elementsToHideSelector = this.getElementsToHideSelector();
                    if (elementsToHideSelector != null) {
                        document.querySelectorAll(elementsToHideSelector).forEach(element => {
                            element.classList.add('hidden');
                        });
                    }
                }

                this.displayDisabled();
            });
    }

    protected abstract onDisableChecks(): void;

    protected abstract getElementsToHideSelector(): string | null;

    protected displayLoading() {
        this.metaBar.displayLoading();
    }

    protected displayDisabled() {
        this.metaBar.displayDisabled();
    }

    protected displayEnabled() {
        this.metaBar.displayEnabled();
    }
}
