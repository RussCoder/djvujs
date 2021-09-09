'use strict';

module.exports = {
    // it's needed to make 11ty to general "page.html" instead of "page/index.html"
    permalink: data => data.page.filePathStem + '.html',
};