'use strict';

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("_src/img");
    eleventyConfig.addPassthroughCopy("_src/js");
    eleventyConfig.addPassthroughCopy("_src/assets");
    eleventyConfig.addPassthroughCopy("_src/css/main.css");

    eleventyConfig.setDynamicPermalinks(false);

    return {
        dir: {
            input: '_src',
            output: 'docs',
        }
    };
};