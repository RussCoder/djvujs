(function () {
    'use strict';

    var includeScriptsPromise = null;
    function includeScripts() {
        return includeScriptsPromise || (includeScriptsPromise = new Promise(resolve => {
            chrome.runtime.sendMessage("include_scripts", resolve);
        }));
    }

    function processTag(tag, src) {
        function isJustNumber(value) {
            return Number(value).toString() === String(value).trim();
        }

        var div = document.createElement('div');
        if (tag.height) {
            div.style.height = isJustNumber(tag.height) ? Number(tag.height) + "px" : tag.height;
        } else {
            div.style.height = '90vh';
        }
        if (tag.width) {
            div.style.width = isJustNumber(tag.width) ? Number(tag.width) + "px" : tag.width;
        }

        div.style.overflow = "hidden";
        div.className = "djvu_js_viewer_container";
        tag.parentNode.replaceChild(div, tag);

        DjVu.notInExtension = true;
        var viewer = new DjVu.Viewer();
        viewer.loadDocumentByUrl(src);
        viewer.render(div);
    }

    const objects = document.querySelectorAll('object[classid="clsid:0e8d0700-75df-11d3-8b4a-0008c7450c4a"]');
    if (objects.length) {
        includeScripts().then(() => {
            objects.forEach(object => {
                var srcParam = object.querySelector('param[name="src"]');
                if (srcParam && srcParam.value) {
                    processTag(object, srcParam.value);
                }
            });
            processEmbeds();
        })
    } else {
        processEmbeds();
    }

    function processEmbeds() { // should be processed after objects, since embeds may be nested in objects as a fallback
        const embeds = document.querySelectorAll('embed[type="image/x-djvu"], embed[type="image/vnd.djvu"]');
        if (embeds.length) {
            includeScripts().then(() => {
                embeds.forEach(embed => {
                    processTag(embed, embed.src);
                });
            });
        }
    }
})();
