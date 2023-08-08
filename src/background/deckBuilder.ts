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
            console.log('Inject script to website');
            console.log('Sender', port.sender);
            const tabId = port.sender.tab.id;
            console.assert(
                !Object.prototype.hasOwnProperty.call(deckBuilderContentScriptPorts, tabId),
                'There was already a contentPort bound for tab ' + tabId
            );
            deckBuilderContentScriptPorts[tabId] = port;
            chrome.scripting.executeScript({
                // target: {tabId: tab[0].id},
                target: {tabId: tabId},
                // func: script.bind(this, chrome.runtime.id),
                // func: script,
                files: ['deck-builder-website-script.js'],
                world: 'MAIN'
            }).then(() => console.log('injected a function'));

            port.onDisconnect.addListener(() => {
                console.log('ServiceWorker: ContentScript.EditDeckView port disconnected.');
            });
        }
    });
}

export const deckBuilder = {
    init: init
}
