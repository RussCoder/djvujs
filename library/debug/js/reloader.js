/**
 * A simple websocket client reloading a page when a bundle is updated.
 */
(function () {
    'use strict';
    function setConnection() {
        var address = 'ws://' + location.host;

        console.log(`%cTrying to open a connention with ${address} ...`, "color: blue");
        var ws = new WebSocket(address);
        ws.onopen = () => console.info(`%cConnection is opened with ${address}. The page will be reloaded on each update.`, "color: green");

        ws.onmessage = message => {
            if (message.data === 'reload') {
                window.location.reload();
            }
        };

        ws.onclose = (e) => {
            console.info(`%cConnection is closed!`, 'color: red');
            setConnection();
        }
    }

    setConnection();

})();