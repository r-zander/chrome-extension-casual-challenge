import './content.scss';
import {EnhancedView} from "./views/enhancedView";
import {GridSearchView} from "./views/search/grid/gridSearchView";
import {ListDeckView} from "./views/deck/view/list/listDeckView";
import {VisualDeckView} from "./views/deck/view/visual/visualDeckView";
import {NoopView} from "./views/noop/noopView";
import {FullCardView} from "./views/full-card/fullCardView";
import {AxiosStatic} from 'axios';
import {EditDeckView} from "./views/deck/edit/editDeckView";
import {MetaBar} from "./views/metaBar";

let enhancedView: EnhancedView<MetaBar>;

declare global {
    const Axios: AxiosStatic;
}

function newEnhancedView(): EnhancedView<MetaBar> {
    if (location.host === 'scryfall.com') {
        const isSetPromoRoute = location.pathname.startsWith('/sets/');
        if (location.pathname === '/search' || isSetPromoRoute) {
            const modeSelector = document.querySelector('select#as') as HTMLInputElement;
            if (modeSelector !== null) {
                switch (modeSelector.value) {
                    case 'grid':
                        return new GridSearchView(isSetPromoRoute ? 'sets' : 'search');
                    case 'full':
                        return new FullCardView();
                }
            }

            const cardProfile = document.querySelector('#main > .card-profile');
            if (cardProfile !== null) {
                return new FullCardView();
            }

            return new NoopView();
        }

        if (location.pathname.match(/\/decks\//)) {
            if (document.querySelectorAll('.deck-list').length !== 0) {
                return new ListDeckView();
            } else if (document.querySelectorAll('.card-grid').length !== 0) {
                return new VisualDeckView();
            } else if (location.pathname.endsWith('/build')) {
                return new EditDeckView();
            } else {
                return new NoopView();
            }
        }

        if (location.pathname.startsWith('/card/')) {
            return new FullCardView();
        }
    } else if (location.host === 'tagger.scryfall.com') {
        if (location.pathname.startsWith('/card/')) {
            // full-card
        }

        if (location.pathname.startsWith('/tags/card/')) {
            // tags/card view
        }

        if (location.pathname.startsWith('/tags/artwork/')) {
            // tags/artwork view
        }
    }

    return new NoopView();
}

async function init() {
    enhancedView = newEnhancedView();
    await enhancedView.init();
}

// With `runAt : "document_idle"` it's necessary to make sure the DOM is ready before we start enhancing it
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    // noinspection JSIgnoredPromiseFromCall
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}
