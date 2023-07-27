import '../../styles/content.scss';
import {EnhancedView} from "./_EnhancedView";
import {GridSearchView} from "./GridSearchView";
import {ListDeckView} from "./ListDeckView";
import {VisualDeckView} from "./VisualDeckView";
import {NoopView} from "./noop/NoopView";
import {FullCardView} from "./FullCardView";
import {AxiosStatic} from 'axios';

let enhancedView: EnhancedView;

declare global {
    const Axios: AxiosStatic;
}

function newEnhancedView(): EnhancedView {
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
        } else {
            return new NoopView();
        }
    }

    if (location.pathname.startsWith('/card/')) {
        return new FullCardView();
    }

    return new NoopView();
}

async function init() {
    const port = chrome.runtime.connect({name: 'ContentScript.EditDeckView'});
    port.onMessage.addListener(message => {
        console.log('Received message through port', message);
    })

    enhancedView = newEnhancedView();
    await enhancedView.init();
}

// noinspection JSIgnoredPromiseFromCall
init();
