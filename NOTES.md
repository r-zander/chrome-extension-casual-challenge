https://developer.chrome.com/docs/extensions/reference/scripting/#method-insertCSS


Card legality badges
```
<dl class="card-legality">
    <div class="card-legality-row">
        <div class="card-legality-item">
          <dt>Standard</dt>
          <dd class="not-legal">Not Legal</dd>
        </div>
    </div>
    <div class="card-legality-row">
        <div class="card-legality-item">
          <dt>Pioneer</dt>
          <dd class="legal">Legal</dd>
        </div>
    </div>
    <div class="card-legality-row">
        <div class="card-legality-item">
          <dt>Legacy</dt>
          <dd class="banned">Banned</dd>
        </div>
    </div>
    <div class="card-legality-row">
        <div class="card-legality-item">
          <dt>Vintage</dt>
          <dd class="restricted">Restrict.</dd>
        </div>
    </div>
</dl>
```
--> "extended" should be a yellow badge

## Must Have Features

- [x] Check for `.deck-details-title` ~ 'Casual Challenge'
  - [ ] or use a button to flag a deck locally as casual challenge deck
- [x] Check if we are in **Decklist** mode, otherwise _do nothing_
- [x] Check legality:
  - [x] Not-Legal: Anything that's not **legal** in Vintage (API Call?)
    - [ ] **OPTIONAL** Show tooltip to display why something is not legal
  - [x] Banned: Anything on the banlist
  - [x] **OPTIONAL** Extended: anything on the extended banlist
  - [x] --> everything else = legal
- [ ] Cache card infos for 1 week
  - [ ] **OPTIONAL** Clear cache button

## Optional/Additional Features

- [ ] Switch Display to `?with=eur&as=list`
- [ ] Add a section "Casual Challenge" in the regular legality on a single card view
- [ ] Fix printings to cheapest print
- [ ] Have options that allow to set what deck names are considered "Casual Challenge"
