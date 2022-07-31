import '../styles/popup.scss';
import {StorageKeys, syncStorage} from "./common/storage";

const displayExtendedCheckbox = document.getElementById('displayExtended') as HTMLInputElement;
syncStorage.get<boolean>(StorageKeys.DISPLAY_EXTENDED, false)
    .then(displayExtended => {
        displayExtendedCheckbox.checked = displayExtended;
    });
displayExtendedCheckbox.addEventListener('change', () => {
    // noinspection JSIgnoredPromiseFromCall
    syncStorage.set(StorageKeys.DISPLAY_EXTENDED, displayExtendedCheckbox.checked);
});


const priceIndexSelect = document.getElementById('priceIndex') as HTMLSelectElement;
if (priceIndexSelect !== null) {
    syncStorage.get<string>(StorageKeys.PRICE_INDEX, 'B')
        .then(priceIndex => {
            priceIndexSelect.value = priceIndex;
        });
    priceIndexSelect.addEventListener('change', () => {
        // noinspection JSIgnoredPromiseFromCall
        syncStorage.set(StorageKeys.PRICE_INDEX, priceIndexSelect.value);
    });
}


const priceListSelect = document.getElementById('priceList') as HTMLSelectElement;
if (priceListSelect !== null) {
    syncStorage.get<string>(StorageKeys.PRICE_LIST, '04')
        .then(priceList => {
            priceListSelect.value = priceList;
        });
    priceListSelect.addEventListener('change', () => {
        // noinspection JSIgnoredPromiseFromCall
        syncStorage.set(StorageKeys.PRICE_LIST, priceListSelect.value);
    });
}
