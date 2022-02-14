// setTimeout(
//     () => {
//         alert("Hi :)");
//     },
//     1000
// )

const legalTemplate = document.createElement('template');
legalTemplate.innerHTML = '<dl class="card-legality"><dd class="legal">Legal</dd></dl>';
const notLegalTemplate = document.createElement('template');
notLegalTemplate.innerHTML = '<dl class="card-legality"><dd class="not-legal">Not Legal</dd></dl>';
const bannedTemplate = document.createElement('template');
bannedTemplate.innerHTML = '<dl class="card-legality"><dd class="banned">Banned</dd></dl>';
const extendedTemplate = document.createElement('template');
extendedTemplate.innerHTML = '<dl class="card-legality"><dd class="extended">Extended</dd></dl>';
// const restrictedTemplate = document.createElement('template');
// restrictedTemplate.innerHTML = '<dl class="card-legality"><dd class="restricted">Restrict.</dd></dl>';

chrome.runtime.sendMessage({action: 'get/banlist'}, function (banlist) {
    console.log('Received Casual Challenge ban list: ', banlist);

    document.querySelectorAll('.deck-list-entry').forEach((deckListEntry) => {
        let cardName = deckListEntry.querySelector('.deck-list-entry-name').innerText.trim();
        if (banlist.bans.hasOwnProperty(cardName)) {
            deckListEntry.append(bannedTemplate.content.cloneNode(true));
        } else if (banlist.extended.hasOwnProperty(cardName)) {
            deckListEntry.append(extendedTemplate.content.cloneNode(true));
        } else {
            deckListEntry.append(legalTemplate.content.cloneNode(true));

        }
    });
});
