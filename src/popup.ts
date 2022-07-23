import '../styles/popup.scss';
import {StorageKeys, syncStorage} from "./common/storage";

document.getElementById('go-to-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});
const displayExtendedCheckbox = document.getElementById('displayExtended') as HTMLInputElement;
syncStorage.get<boolean>(StorageKeys.DISPLAY_EXTENDED, false)
    .then(displayExtended => {
        displayExtendedCheckbox.checked = displayExtended;
    });
displayExtendedCheckbox.addEventListener('change', () => {
    // noinspection JSIgnoredPromiseFromCall
    syncStorage.set(StorageKeys.DISPLAY_EXTENDED, displayExtendedCheckbox.checked);
});
