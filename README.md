# Scryfall - Casual Challenge Checker

Checks decklists on scryfall.com if they are legal for the 'Casual Challenge' a custom MtG format created by Raoul Zander and Janik Nissen.

## Core Features

- [x] Check for `.deck-details-title` ~ 'Casual Challenge'
  - [x] or use a button to flag a deck locally as casual challenge deck
- [x] Check if we are in **Decklist** mode, otherwise _do nothing_
- [x] Check legality:
  - [x] Not-Legal: Anything that's not **legal** in Vintage (API Call?)
  - [x] Banned: Anything on the banlist
  - [x] **OPTIONAL** Extended: anything on the extended banlist
  - [x] --> everything else = legal
- [x] Cache card infos for 1 week
- [x] Add a section "Casual Challenge" in the regular legality on a single card view
- [ ] Search view
  - [x] Grid/Image/Visual view
  - [ ] Nice loading display
  - [x] add buttons to define behavior
    - [x] ignore casual challenge
    - [x] show not-legal (faded out), banned & extended with border + hover
    - [ ] hide everything not legal in casual challenge, and extended with border+hover
  - [ ] Set view https://scryfall.com/sets/vma?as=grid&order=set
  - [ ] Inject button in ALL search controls
- [x] Bug: If a card appears more than once, only the last instance is correctly loaded
- [x] Auto clear card cache if running out of local storage
- [ ] Bug: Extended is checked before anything else and can thus override not-legal or banned (which are lazy-loaded
  information)
  - For not-legal this is solved right now by having the 50 cards that are concerned on a special list, but this is far
    from ideal
- [ ] Move "extended" into settings
- [ ] Auto-fix card prices
- [ ] Sort by price (in Deck view)
- [ ] Always navigate to '?with=eur"
  - [ ] on `/build` --> \[Done Editing]
  - [ ] on deck view --> \[Decklist]
  - [ ] in `deck-tray`
  - [ ] in https://scryfall.com/<user>/decks/
- [ ] Overall legality section (like in spreadsheet)
  - [ ] include price check
  - [ ] Remove Est. USD, Est. TIX, Wildcards
- [ ] Set basic lands to 0€
- [ ] Support chrome/firefox mobile

## Additional Features

- [x] Switch display to `?with=eur&as=list`
- [x] Show tooltip to display why something is not legal
- [ ] Fix printings to cheapest print
- [ ] Have options that allow to set what deck names are considered "Casual Challenge"
- [ ] **OPTIONAL** Clear cache button
- [ ] In-page tutorial for new users and each view
- [ ] Update banner der erklärt, was sich geändert hat
  - evtl in `#notification-tray`
- [ ] add explanation of supported views in Extension description
- [ ] Random enhancement:
  - `document.querySelector('a[href="/random"]').href = '/random?q=' + encodeURIComponent(document.getElementById('q').value + ' lang:en')`

  1. On Start Page:
    1. Random Card --> searches for entered query
    2. New button "Casual Challenge inspiration" with saved query `(rarity:r OR rarity:m) eur>=2 eur<=5 lang:en`
  2. On Advanced Search page
    1. New Button "Random card with these options"

## Known Bugs

- [x] "Delver of Secrets // Insectile Aberration" isn't shown as banned in search view even tho it is

## Deployment

- Create zip from everything but
  ```
  .git/
  .idea/
  publishing/
  tests/
  .gitignore
  chrome-extension-casual-challenge.iml
  README.md
  ```

## Credits

Icon: [Donkey icon](https://game-icons.net/1x1/skoll/donkey.html) by [Skoll](https://game-icons.net/)
under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)  
Recolored in #F5C823

### Disclaimer

Portions of "Scryfall - Casual Challenge Checker" are unofficial Fan Content permitted under the Wizards of the Coast
Fan Content Policy. The information presented on this extension about Magic: The Gathering, both literal and graphical,
is copyrighted by Wizards of the Coast.
This extension is not produced, endorsed, supported, or affiliated with Wizards of the Coast.
