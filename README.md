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
  - [in progress] Grid/Image/Visual view
  - [ ] Nice loading display
  - [ ] add buttons to define behavior
    - [ ] ignore casual challenge
    - [ ] show not-legal (faded out), banned & extended with border + hover
    - [ ] hide everything not legal in casual challenge, and extended with border+hover
- [ ] add explanation of supported views in Extension description
- [x] Bug: If a card appears more than once, only the last instance is correctly loaded

## Additional Features

- [x] Switch display to `?with=eur&as=list`
- [ ] Show tooltip to display why something is not legal
- [ ] Fix printings to cheapest print
- [ ] Have options that allow to set what deck names are considered "Casual Challenge"
- [ ] **OPTIONAL** Clear cache button

## Credits

Icon: [Donkey icon](https://game-icons.net/1x1/skoll/donkey.html) by [Skoll](https://game-icons.net/) under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)  
Recolored in #F5C823

### Disclaimer

Portions of "Scryfall - Casual Challenge Checker" are unofficial Fan Content permitted under the Wizards of the Coast Fan Content Policy. The information 
presented on this extension about Magic: The Gathering, both literal and graphical, is copyrighted by Wizards of the Coast.
This extension is not produced, endorsed, supported, or affiliated with Wizards of the Coast.
