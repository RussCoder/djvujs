(function () {
    'use strict';

    var embed = document.querySelector('embed[type="image/x-djvu"], embed[type="image/vnd.djvu"]');

    if (embed) {

        function isJustNumber(value) {
            return Number(value).toString() === String(value).trim();
        }

        chrome.runtime.sendMessage("include_scripts", () => {
            var div = document.createElement('div');

            if (embed.height) {
                div.style.height = isJustNumber(embed.height) ? Number(embed.height) + "px" : embed.height;
            } else {
                div.style.height = '90vh';
            }
            if (embed.width) {
                div.style.width = isJustNumber(embed.width) ? Number(embed.width) + "px" : embed.width;
            }

            div.className = "djvu_js_viewer_container";
            var src = embed.src;
            embed.parentNode.replaceChild(div, embed);

            DjVu.Viewer.loadDocumentByUrl(src);
            DjVu.Viewer.init(div);
        });
    }
})();
