# Scryfall - Casual Challenge Checker

Checks cards and lists on scryfall.com if they are legal for the 'Casual Challenge' a custom MtG format created by Raoul Zander and Janik Nissen.

## Features

- Shows legality (banned and optionally extended) for the Casual Challenge format
- Shows Budget Points and percentage of Budget Share
- Supported views
  - Single card view
  - Deck view (list, visual, edit mode)
  - Search view (images and full mode)

## Development

### Used development stack

* Windows 10 (22H2)
* Node.js v18.15.0 (strongly recommended to use NVM)
* npm 9.6.4

Other versions might or might not work - in theory there is nothing hard-bound to these versions in the project, but experience has shown that npm projects are not too happy about different environments.

### First start

- Run `npm install`

### Test Extension in Chrome

* Run `npm run start-chrome`
* https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked
  * Need to load the extension from `\chrome-extension-casual-challenge\dist`

### Test Extension in Firefox

* First time, run `npm install --global web-ext`
* In `chrome-extension-casual-challenge\dist` run `web-ext run`

## Releasing

### Build Chrome Extension

* `npm run build-chrome`
* `upload[-environment].bat`
* Visit https://chrome.google.com/webstore/devconsole/96b3f2ff-adde-4b86-a5ca-dd664792f43f/cbdgdonajjfilioojjocdijiadbijpfg/edit
* Click "Prüfen lassen"
* Once the review was successful, the developer account will receive an email "Artikel erfolgreich veröffentlicht"

### Build Firefox Add-On

* `npm run build-and-package-firefox`
* --> `dist/firefox` contains a zip file ready to be uploaded to addons.mozilla.org
* Visit https://addons.mozilla.org/en-US/developers/addon/scryfall-casual-challenge/versions/submit/
* Upload the zip file
* Firefox wants to have the source files --> upload `\chrome-extension-casual-challenge\chrome-extension-casual-challenge.zip`
* Describe Version  
These are the standard text templates. If anything else changed, you need to indicate this to ensure a quick release.
  * Release Notes:
  > Welcome to Casual Challenge Season ##! New bans, new budget points and new playable cards from ???.
  * Notes to Reviewer:
  > Updated contained data JSONs.
* Once the review was successful, the developer account will receive a notification via email

## Credits

Icon: [Donkey icon](https://game-icons.net/1x1/skoll/donkey.html) by [Skoll](https://game-icons.net/)
under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)  
Recolored in #F5C823

### Disclaimer

Portions of "Scryfall - Casual Challenge Checker" are unofficial Fan Content permitted under the Wizards of the Coast
Fan Content Policy. The information presented on this extension about Magic: The Gathering, both literal and graphical,
is copyrighted by Wizards of the Coast.
This extension is not produced, endorsed, supported, or affiliated with Wizards of the Coast.
