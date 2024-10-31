import {MessageType} from "../common/types";
import Port = chrome.runtime.Port;



const deckBuilderContentScriptPorts: { [key: number]: Port } = {}

function forwardMessageToContentScript(tabId: number, message: MessageType) {
    deckBuilderContentScriptPorts[tabId].postMessage(message);
}

function init() {
    chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
        const tabId = sender.tab.id;
        forwardMessageToContentScript(tabId, message);
        sendResponse({status: 'Accepted'});
    });

    chrome.runtime.onConnect.addListener((port: Port) => {
        console.log('onConnect');
        if (port.name === 'ContentScript.EditDeckView') {
            console.log('Try to inject deck-builder-website-script.js to website');
            const tabId = port.sender.tab.id;
            console.assert(
                !Object.prototype.hasOwnProperty.call(deckBuilderContentScriptPorts, tabId),
                'There was already a contentPort bound for tab ' + tabId
            );
            deckBuilderContentScriptPorts[tabId] = port;
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: ['deck-builder-website-script.js'],
                // Firefox doesn't support the MAIN ExecutionWorld
                world: __BROWSER__ === 'CHROME' ? 'MAIN' : 'ISOLATED'
            }).then(() => console.log('Injected deck-builder-website-script.js'))
                .catch(reason => console.error('Error injecting deck-builder-website-script.js.', reason));

            port.onDisconnect.addListener(() => {
                console.log('ServiceWorker: ContentScript.EditDeckView port disconnected.');
            });
        }
    });
}

export const deckBuilder = {
    init: init
}
