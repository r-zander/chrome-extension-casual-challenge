import {CheckMode, MetaBar} from "../metaBar";

let isInit = false;
let onDisabled = () => {/* default NOOP */};
let onOverlay = () => {/* default NOOP */};

let loadingIndicator: HTMLElement;
let initialSearchCheckMode: CheckMode;

export class SearchControls implements MetaBar {

    constructor(searchCheckMode: CheckMode) {
        initialSearchCheckMode = searchCheckMode;
    }

    public init() {
        const searchControlTemplate = document.createElement('template');
        searchControlTemplate.innerHTML = `
    <div class="search-controls-casual-challenge">
         <div class="casual-challenge-checks-loading button-n"><div class="dot-flashing"></div></div>
         <select id="check" title="Change how cards are checked for Casual Challenge" class="select-n">
            <option ` + (initialSearchCheckMode === 'disabled' ? 'selected="selected" ' : '') + `value="disabled">Disable</option>
            <option ` + (initialSearchCheckMode === 'overlay' ? 'selected="selected" ' : '') + `value="overlay">Overlay</option>
        </select>
         <label for="order">checks</label>
    </div>`;

        document.querySelector('.search-controls-inner > .search-controls-display-options').after(searchControlTemplate.content);
        loadingIndicator = document.querySelector('.casual-challenge-checks-loading');

        const checkModeSelect = document.getElementById('check') as HTMLInputElement;
        checkModeSelect.addEventListener('change', () => {
            switch (checkModeSelect.value) {
                case 'disabled':
                    onDisabled();
                    break;
                case 'overlay':
                    onOverlay();
                    break;
            }
        });

        isInit = true;
    }

    public hideLoadingIndicator(): void {
        loadingIndicator.classList.add('hidden');
    }

    public setOnDisabledHandler(handler: () => void): void {
        onDisabled = handler.bind(this);
    }

    public setOnOverlayHandler(handler: () => void): void {
        onOverlay = handler.bind(this);
    }

    public displayLoading(): void {
        loadingIndicator.classList.remove('hidden');
    }

    public displayEnabled(): void {
        loadingIndicator.classList.add('hidden');
    }

    public displayDisabled(): void {
        if (!isInit) return;

        loadingIndicator.classList.add('hidden');
    }

    static Noop = class extends SearchControls {
        constructor() {
            super('disabled')
        }

        public override init() {
            // Do nothing
        }

        public override hideLoadingIndicator(): void {
            // Do nothing
        }

        public override setOnDisabledHandler(): void {
            // Do nothing
        }

        public override setOnOverlayHandler(): void {
            // Do nothing
        }

        public override displayLoading(): void {
            // Do nothing
        }

        public override displayEnabled(): void {
            // Do nothing
        }

        public override displayDisabled(): void {
            // Do nothing
        }
    }
}
