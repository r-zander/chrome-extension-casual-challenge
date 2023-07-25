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

// function initAjaxInterceptors() {
//     console.log('initAjaxInterceptors');
//
//     // Add a response interceptor
//     Axios.interceptors.response.use(function (response) {
//         // Any status code that lie within the range of 2xx cause this function to trigger
//         // Do something with response data
//         console.log(response);
//         return response;
//     });
// }

// function script() {
//     console.log('Hello from the website!');
// }

//
// function inject(fn: () => void) {
//     const script = document.createElement('script')
//     script.text = `(${fn.toString()})();`
//     document.documentElement.appendChild(script)
// }


async function init() {
    // if (typeof Axios !== 'function') {
    //     const interval = setInterval(() => {
    //         if (typeof Axios === 'function') {
    //             initAjaxInterceptors();
    //             clearInterval(interval);
    //         }
    //     }, 10);
    // }

    // inject(script)
    chrome.runtime.sendMessage({action: 'inject'}).then(() => {
        console.log('Called backend to inject');
    });

    enhancedView = newEnhancedView();
    await enhancedView.init();
}

// noinspection JSIgnoredPromiseFromCall
init();
