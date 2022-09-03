import {CheckMode, MetaBar} from "./decklist/types";
import {StorageKeys, syncStorage} from "../common/storage";
import {FullCard} from "../common/card-representations";

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

    protected appendToDeckListEntryImage(
        deckListEntry: HTMLElement,
        card: FullCard,
        legalTemplate: HTMLTemplateElement,
        notLegalTemplate: HTMLTemplateElement,
        bannedTemplate: HTMLTemplateElement,
        extendedTemplate: HTMLTemplateElement
    ) {
        deckListEntry.querySelector('.legality-overlay').remove();
        deckListEntry.querySelector('.card-grid-item-legality').remove();
        const cardItem = deckListEntry.querySelector('.card-grid-item-card') as HTMLElement;
        this.modifyCardItem(cardItem, card, legalTemplate, notLegalTemplate, bannedTemplate, extendedTemplate);
    }

    protected modifyCardItem(
        cardItem: HTMLElement,
        card: FullCard,
        legalTemplate: HTMLTemplateElement,
        notLegalTemplate: HTMLTemplateElement,
        bannedTemplate: HTMLTemplateElement,
        extendedTemplate: HTMLTemplateElement
    ) {
        cardItem.classList.remove('loading');

        if (card.legalities.vintage !== 'legal') {
            cardItem.append(notLegalTemplate.content.cloneNode(true));
            cardItem.classList.add('not-legal');
        } else if (card.banStatus === 'banned' || isBannedInAnyFormat(card)) {
            cardItem.append(bannedTemplate.content.cloneNode(true));
            cardItem.classList.add('banned');
        } else if (this.displayExtended && card.banStatus === 'extended') {
            cardItem.append(extendedTemplate.content.cloneNode(true));
            cardItem.classList.add('extended');
        } else {
            cardItem.append(legalTemplate.content.cloneNode(true));
            cardItem.classList.add('legal');
        }
    }

    protected abstract storeCheckFlag(newValue: CheckMode): Promise<void>;

    protected enableChecks() {
        this.displayLoading();
        this.storeCheckFlag('overlay')
            .then(this.checkDeck);
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

