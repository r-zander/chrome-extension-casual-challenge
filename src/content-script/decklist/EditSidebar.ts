import {META_BAR_TITLE, statisticHtml, StatisticsAwareMetaBar} from "./StatisticsAwareMetaBar";


let isInit = false;

// let loadingIndicator: HTMLElement,
//     disabledButton: HTMLElement,
//     enabledButton: HTMLElement;

export class EditSidebar extends StatisticsAwareMetaBar {
    constructor() {
        super(false);
    }

    public init(): void {
        document.querySelector('.deckbuilder-sidebar').insertAdjacentHTML('beforeend', `
<h6 class="deckbuilder-section-title-bar">
    <span class="deckbuilder-section-title">${META_BAR_TITLE}</span>
</h6>
<div class="sidebar-toolbox casual-challenge">
    ${statisticHtml}
</div>`);

        // loadingIndicator = document.querySelector('.casual-challenge-checks-loading');
        // disabledButton = document.querySelector('.casual-challenge-checks-disabled');
        // enabledButton = document.querySelector('.casual-challenge-checks-enabled');

        isInit = true;
    }

    // public addDisabledButtonClickHandler(handler: () => void): void {
    //     disabledButton.addEventListener('click', handler);
    // }
    //
    // public addEnabledButtonClickHandler(handler: () => void): void {
    //     enabledButton.addEventListener('click', handler);
    // }

    public hideLoadingIndicator(): void {
        // loadingIndicator.classList.add('hidden');
    }

    public displayLoading(): void {
        // loadingIndicator.classList.remove('hidden');
        // disabledButton.classList.add('hidden');
        // enabledButton.classList.add('hidden');
    }

    public displayEnabled(): void {
        // loadingIndicator.classList.add('hidden');
        // disabledButton.classList.add('hidden');
        // enabledButton.classList.remove('hidden');
    }

    public displayDisabled(): void {
        // if (!isInit) return;
        //
        // loadingIndicator.classList.add('hidden');
        // disabledButton.classList.remove('hidden');
        // enabledButton.classList.add('hidden');
    }
}
