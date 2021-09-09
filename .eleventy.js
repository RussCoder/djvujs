'use strict';

module.exports = function (eleventyConfig) {
    // 11ty doesn't copy assets by the default
    eleventyConfig.addPassthroughCopy("src/img");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/css/main.css");

    // without the option, pug template do not react to the permalink option in the computedData
    eleventyConfig.setDynamicPermalinks(false);

    return {
        dir: {
            input: 'src',
            output: 'docs',
        }
    };
};