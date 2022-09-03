import '../../../styles/decklist-content.css';
import {EnhancedView} from "../EnhancedView";
import {GridSearchView} from "../GridSearchView";
import {NoopView} from "../NoopView";
import {ListDeckView} from "../ListDeckView";
import {VisualDeckView} from "../VisualDeckView";

let enhancedView: EnhancedView;

function newEnhancedView(): EnhancedView {
    if (location.pathname === '/search') {
        const modeSelector = document.querySelector('select#as') as HTMLInputElement;
        if (modeSelector !== null) {
            switch (modeSelector.value) {
                case 'grid':
                    return new GridSearchView();
            }
        }

        return new NoopView();
    }

    if (location.pathname.match(/\/decks\//)) {
        if (document.querySelectorAll('.deck-list').length !== 0) {
            return new ListDeckView();
        } else if (document.querySelectorAll('.card-grid').length !== 0) {
            return new VisualDeckView();
        } else {
            return new NoopView();
        }
    }

    return new NoopView();
}

async function init() {
    enhancedView = newEnhancedView();
    await enhancedView.init();
}

// noinspection JSIgnoredPromiseFromCall
init();
