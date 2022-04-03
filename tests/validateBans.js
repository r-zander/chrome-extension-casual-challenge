function validateBanList() {
    chrome.runtime.sendMessage({action: 'get/ban/list'}, (banlist) => {
        if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
        }


        console.log(Object.keys(banlist.bans).length,
            Object.keys(banlist.extended).length);

        // output: 235 642 without filtering vintage restricted
        // output: 207 607 with filtering vintage restricted

    });
}

validateBanList();
