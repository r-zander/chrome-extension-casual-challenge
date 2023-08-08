import {META_BAR_TITLE, statisticHtml, StatisticsAwareMetaBar} from "../statisticsAwareMetaBar";

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
    }

    public hideLoadingIndicator(): void {
        // Nothing to do
    }

    public displayLoading(): void {
        // Nothing to do
    }

    public displayEnabled(): void {
        // Nothing to do
    }

    public displayDisabled(): void {
        // Nothing to do
    }
}
