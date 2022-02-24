function init() {
    const cardName = document.querySelector('.card-text-card-name').innerText.trim();

    chrome.runtime.sendMessage(
        {action: 'get/ban-status', cardName: cardName},
        (banStatus) => {
            if (chrome.runtime.lastError) {
                console.error('Error while fetching ban status.', chrome.runtime.lastError);
                return;
            }

            displayLegality(banStatus);
        });
}

function displayLegality(banStatus) {
    switch (banStatus) {
        case 'banned':
            appendLegalityElement('banned', 'Banned',
                'One of the top 50 cards in a paper tournament format.');
            return;
        case 'extended':
            appendLegalityElement('extended', 'Extended',
                'One of the top 200 cards in a paper tournament format.');
            return;
        default:
            // Fallthrough - needs a more complicated handling outside of the switch
    }

    let vintageLegality;
    document.querySelectorAll('.card-legality-item > dt').forEach(formatElement => {
        if (formatElement.innerText.trim() === 'Vintage') {
            vintageLegality = formatElement.nextElementSibling.classList.item(0);
        }
    });

    if (vintageLegality === 'legal') {
        appendLegalityElement('legal', 'Legal',
            'There are no bans and the card is legal in Vintage.');
    } else {
        appendLegalityElement('not-legal', 'Not Legal',
            'This card is not fully legal in Vintage.');
    }
}

function appendLegalityElement(cssClass, text, explanation) {
    const template = document.createElement('template');
    template.innerHTML =
        `<div class="card-legality-item">
            <dt title="Casual Challenge">Casual Challenge</dt>
            <dd title="${explanation}" class="${cssClass}">${text}</dd>
         </div>`

    const cardLegalityRow = document.querySelector('.card-legality-row:last-child');
    if (cardLegalityRow.children.length === 1) {
        cardLegalityRow.append(template.content);
    } else {
        const newRow = document.createElement('template');
        newRow.innerHTML = '<div class="card-legality-row"></div>'
        newRow.content.firstElementChild.append(template.content);
        cardLegalityRow.after(newRow.content);
    }
}

init();
