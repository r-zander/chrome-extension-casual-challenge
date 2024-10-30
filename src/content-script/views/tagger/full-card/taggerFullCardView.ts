import {Format} from "scryfall-api";
import {FullCard, PaperLegalities} from "../../../../common/cardRepresentations";
import {isBasicLand} from "../../../../common/casualChallengeLogic";
import {formatBudgetPoints, formatBudgetPointsShare} from "../../../../common/formatting";
import {addGlobalClass, EnhancedView} from "../../enhancedView";
import {NoopMetaBar} from "../../noop/noopMetaBar";

export class TaggerFullCardView extends EnhancedView<NoopMetaBar> {

    public async onInit() {
        addGlobalClass('mode-full-card');

        return Promise.resolve(undefined);
    }

    protected createMetaBar(): NoopMetaBar {
        return new NoopMetaBar();
    }

    protected shouldEnableChecks(): Promise<boolean> {
        return Promise.resolve(true);
    }

    protected async enhanceView(): Promise<void> {
        //  <meta name="csrf-token" content="cmERsa54uJ6FpSyVVqzV9OolRv8PNzxit5vt8nn34pn-3e9lWvWjDPjfBh2vrX__cNQBkqu7AixqpbItpxS5QQ" />

        fetch("https://tagger.scryfall.com/graphql", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-csrf-token": "cmERsa54uJ6FpSyVVqzV9OolRv8PNzxit5vt8nn34pn-3e9lWvWjDPjfBh2vrX__cNQBkqu7AixqpbItpxS5QQ"
  },
  "referrer": location.toString(),
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "{\"query\":\"query FetchCard($set:String! $number:String! $back:Boolean=false $moderatorView:Boolean=false){card:cardBySet(set:$set number:$number back:$back){...CardAttrs backside layout scryfallUrl sideNames twoSided rotatedLayout taggings(moderatorView:$moderatorView){...TaggingAttrs tag{...TagAttrs ancestorTags{...TagAttrs}}}relationships(moderatorView:$moderatorView){...RelationshipAttrs}}}fragment CardAttrs on Card{artImageUrl backside cardImageUrl collectorNumber id illustrationId name oracleId printingId set}fragment RelationshipAttrs on Relationship{classifier classifierInverse annotation subjectId subjectName createdAt creatorId foreignKey id name pendingRevisions relatedId relatedName status type}fragment TagAttrs on Tag{category createdAt creatorId id name namespace pendingRevisions slug status type}fragment TaggingAttrs on Tagging{annotation subjectId createdAt creatorId foreignKey id pendingRevisions type status weight}\",\"operationName\":\"FetchCard\",\"variables\":{\"set\":\"woe\",\"number\":\"205\",\"back\":false,\"moderatorView\":false}}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});

fetch("https://tagger.scryfall.com/graphql", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-csrf-token": "cmERsa54uJ6FpSyVVqzV9OolRv8PNzxit5vt8nn34pn-3e9lWvWjDPjfBh2vrX__cNQBkqu7AixqpbItpxS5QQ"
  },
  "referrer": location.toString(),
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "{\"query\":\"query FetchCard($set: String! $number: String! $back: Boolean = false) {card: cardBySet(set: $set, number: $number, back: $back) {id}}\",\"operationName\":\"FetchCard\",\"variables\":{\"set\":\"woe\",\"number\":\"205\",\"back\":false}}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});




        const cardProfileElements = document.querySelectorAll('#main > .card-profile');

        cardProfileElements.forEach((cardProfileElement: HTMLElement) => {
            const cardIdElement: HTMLElement = cardProfileElement.querySelector('.prints > .print-langs > .print-langs-item.current')
            if (cardIdElement === null) {
                console.warn('Unable to find cardIdElement in ', cardProfileElement);
                return;
            }
            const cardId = cardIdElement.dataset.cardId;
            if (cardId === undefined) {
                console.warn('Unable to find cardId for "' + cardIdElement.title + '".');
                return;
            }

            this.cardLoader.register(cardId).then(fullCard => {
                displayLegality(cardProfileElement, fullCard, this.displayExtended);
                displayBudgetPoints(cardProfileElement, fullCard.budgetPoints);
            });
        });

        this.cardLoader.start().then(() => {
            this.displayEnabled();
            this.contentWasChecked = true;
        });
    }

    protected storeCheckFlag(): Promise<void> {
        return Promise.resolve(undefined);
    }

    protected onDisableChecks(): void {
        // Nothing to do here
    }

    protected getElementsToHideSelector(): string {
        return null;
    }
}

function displayBudgetPoints(cardProfileElement: HTMLElement, budgetPoints: number) {
    const printsTables = cardProfileElement.querySelectorAll('.prints > .prints-table');
    const lastPrintTable = printsTables.item(printsTables.length - 1);
    const formattedBP = formatBudgetPoints(budgetPoints);
    const formattedPercentage = formatBudgetPointsShare(budgetPoints);
    const html = `
<table class="prints-table">
    <thead>
        <tr>
            <th>
                <span>Casual Challenge</span>
            </th>
            <th>
                <span>BP</span>
            </th>
            <th>
                <span>%</span>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <span style="cursor: inherit;">Budget Points</span>
            </td>
            <td>
                <span class="currency-eur" style="cursor: inherit; font-variant: small-caps;">${formattedBP}</span>
            </td>
            <td>
                <span class="currency-usd" style="cursor: inherit">${formattedPercentage}</span>
            </td>
        </tr>
    </tbody>
</table>`;

    lastPrintTable.insertAdjacentHTML('afterend', html);
}

function displayLegality(cardProfileElement: HTMLElement, card: FullCard, displayExtended: boolean): void {
    if (isBasicLand(card)) {
        appendLegalityElement(
            cardProfileElement,
            'legal',
            'Legal',
            'Nonsnow basic lands are always legal.'
        );
        return;
    }

    if (card.legalities.vintage === 'not_legal') {
        appendLegalityElement(
            cardProfileElement,
            'not-legal',
            'Not Legal',
            'This card is not legal in Vintage.'
        );
        return;
    }

    if (card.budgetPoints === null || card.budgetPoints === 0) {
        appendLegalityElement(
            cardProfileElement,
            'not-legal',
            'Not Legal',
            'This card has no valid budget points (yet).'
        );
        return;
    }

    if (card.legalities.vintage === 'restricted') {
        appendLegalityElement(
            cardProfileElement,
            'banned',
            'Banned',
            'Restricted in Vintage.'
        );
        return;
    }

    if (card.banStatus === 'banned') {
        appendLegalityElement(
            cardProfileElement,
            'banned',
            'Banned',
            'Played in ' + formatsToString(card.banFormats) + ' competitive decks'
        );
        return;
    }

    const bannedInFormats = bannedFormats(card.legalities);
    if (bannedInFormats.length > 0) {
        appendLegalityElement(
            cardProfileElement,
            'banned',
            'Banned',
            'Banned in ' + bannedInFormats.join(', ')
        );
        return;
    }

    if (card.banStatus !== 'extended') {
        appendLegalityElement(
            cardProfileElement,
            'legal',
            'Legal',
            'There are no bans and the card is legal in Vintage.'
        );
        return;
    }

    if (displayExtended) {
        appendLegalityElement(
            cardProfileElement,
            'extended',
            'Extended',
            'Played in ' + formatsToString(card.banFormats) + ' competitive decks'
        );
        return;
    }

    // Don't show "Extended" but still provide the user with format usage information
    appendLegalityElement(
        cardProfileElement,
        'legal',
        'Legal',
        'Played in ' + formatsToString(card.banFormats) + ' competitive decks'
    );
}

/**
 * Only looks at Casual Challenge relevant formats.
 */
function bannedFormats(legalities: PaperLegalities): string[] {
    const bannedInFormats: string[] = [];
    if (legalities.standard === 'banned') {
        bannedInFormats.push('Standard');
    }
    if (legalities.pioneer === 'banned') {
        bannedInFormats.push('Pioneer');
    }
    if (legalities.modern === 'banned') {
        bannedInFormats.push('Modern');
    }
    if (legalities.legacy === 'banned') {
        bannedInFormats.push('Legacy');
    }
    if (legalities.vintage === 'banned') {
        bannedInFormats.push('Vintage');
    }
    if (legalities.pauper === 'banned') {
        bannedInFormats.push('Pauper');
    }

    return bannedInFormats;
}

function formatsToString(formats: Map<keyof typeof Format, number>): string {
    let result = '';
    for (const [format, deckPercentage] of Object.entries(formats)) {
        if (result.length > 0) {
            result += ', '
        }
        result += (deckPercentage * 100).toFixed(0) + '% of ' + format
    }

    return result;
}

function appendLegalityElement(cardProfileElement: HTMLElement, cssClass: string, text: string, explanation: string): void {
    const template = document.createElement('template');
    template.innerHTML =
        `<div class="card-legality-item casual-challenge"
              title="${text} in Casual Challenge

${explanation}">
            <dt title="Casual Challenge">Casual Challenge</dt>
            <dd title="${explanation}" class="${cssClass}">${text}</dd>
         </div>`

    const cardLegalityRow = cardProfileElement.querySelector('.card-legality-row:last-child');
    if (cardLegalityRow.children.length === 1) {
        cardLegalityRow.append(template.content);
    } else {
        const newRow = document.createElement('template');
        newRow.innerHTML = '<div class="card-legality-row"></div>'
        newRow.content.firstElementChild.append(template.content);
        cardLegalityRow.after(newRow.content);
    }

    cardProfileElement
        .querySelectorAll('.card-legality-item.casual-challenge')
        .forEach((titledElement) => {
            titledElement.addEventListener('click', (event) => {
                (event.currentTarget as HTMLElement).classList.toggle('clicked');
            });
        });
}
