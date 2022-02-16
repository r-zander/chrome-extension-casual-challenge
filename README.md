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

## Additional Features

- [x] Switch display to `?with=eur&as=list`
- [ ] Show tooltip to display why something is not legal
- [ ] Add a section "Casual Challenge" in the regular legality on a single card view
- [ ] Fix printings to cheapest print
- [ ] Have options that allow to set what deck names are considered "Casual Challenge"
- [ ] **OPTIONAL** Clear cache button

## Credits

Icon: [Donkey icon](https://game-icons.net/1x1/skoll/donkey.html) by [Skoll](https://game-icons.net/) under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)  
Recolored in #F5C823
