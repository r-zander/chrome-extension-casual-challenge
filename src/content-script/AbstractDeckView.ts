import {EnhancedView} from "./EnhancedView";
import {Sidebar} from "./decklist/Sidebar";
import {CheckMode, MetaBar} from "./decklist/types";
import {StorageKeys, syncStorage} from "../common/storage";
import {SerializableMap} from "../common/SerializableMap";
import {DeckStatistics} from "./decklist/DeckStatistics";



function getDeckId(): string {
    const pathElements = location.pathname.split('/');
    return pathElements[pathElements.length - 1];
}

export abstract class AbstractDeckView extends EnhancedView {
    protected sidebar: Sidebar;
    protected deckStatistics: DeckStatistics;

    protected async shouldEnableChecks(): Promise<boolean> {
        return this.isCasualChallengeDeck();
    }

    protected createMetaBar(): MetaBar {
        this.sidebar = new Sidebar();
        this.sidebar.init();

        this.sidebar.addDisabledButtonClickHandler(this.enableChecks);
        this.sidebar.addEnabledButtonClickHandler(this.disableChecks);

        return this.sidebar;
    }

    protected async isCasualChallengeDeck(): Promise<boolean> {
        const enabledDecks = await syncStorage.get<Map<string, CheckMode>>(StorageKeys.ENABLED_DECKS);

        // Deck was explicitly disabled for deck check
        if (enabledDecks !== null && (enabledDecks.get(getDeckId()) === 'disabled')) {
            console.log('isCasualChallengeDeck', 'Deck is disabled according to `enabledDecks` storage');
            return false;
        }

        // Check for matching deck titles for auto-enable
        const deckTitle = (document.querySelector('.deck-details-title') as HTMLElement).innerText;
        if (deckTitle.match(/Casual.{0,3}Challenge/i) !== null ||
            deckTitle.includes('CC') /* Case-sensitive */) {
            console.log('isCasualChallengeDeck', 'Deck Title matches');
            // Synchronously store that this deck should have its deck check enabled
            // to prevent unexpected behavior when the deck name changes
            await this.storeCheckFlag('overlay');
            return true;
        }

        if (enabledDecks !== null && (enabledDecks.get(getDeckId()) === 'overlay')) {
            console.log('isCasualChallengeDeck', 'Found deck id in `enabledDecks` storage');
            return true;
        }

        console.log('isCasualChallengeDeck', 'Unknown deck, just proceed without checks.');
        return false;
    }

    protected async storeCheckFlag(newValue: CheckMode): Promise<void> {
        return syncStorage.get<Map<string, CheckMode>>(StorageKeys.ENABLED_DECKS)
            .then(enabledDecks => {
                if (enabledDecks === null) {
                    enabledDecks = new SerializableMap<string, CheckMode>();
                }
                enabledDecks.set(getDeckId(), newValue);

                return syncStorage.set(StorageKeys.ENABLED_DECKS, enabledDecks);
            });
    }

    protected async checkDeck(): Promise<void> {
        document.querySelector('.deck').classList.add('casual-challenge-deck');
        this.deckStatistics = new DeckStatistics();
    }

    protected onDisableChecks() {
        document.querySelector('.deck').classList.remove('casual-challenge-deck');
    }
}
