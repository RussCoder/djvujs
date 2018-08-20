(function () {
    'use strict';

    var embeds = document.querySelectorAll('embed[type="image/x-djvu"], embed[type="image/vnd.djvu"]');

    if (embeds.length) {

        function isJustNumber(value) {
            return Number(value).toString() === String(value).trim();
        }

        chrome.runtime.sendMessage("include_scripts", () => {
            embeds.forEach(embed => {
                var div = document.createElement('div');

                if (embed.height) {
                    div.style.height = isJustNumber(embed.height) ? Number(embed.height) + "px" : embed.height;
                } else {
                    div.style.height = '90vh';
                }
                if (embed.width) {
                    div.style.width = isJustNumber(embed.width) ? Number(embed.width) + "px" : embed.width;
                }

                div.style.overflow = "hidden";

                div.className = "djvu_js_viewer_container";
                var src = embed.src;
                embed.parentNode.replaceChild(div, embed);

                var viewer = new DjVu.Viewer();
                viewer.loadDocumentByUrl(src);
                viewer.render(div);
            });
        });
    }
})();
