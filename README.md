# The `djvu.js.org` website

To update the bundles edit the version in `src/_data/_globalData` and then:

```
npm run make
```

Commit changes and push them to the repository.

To edit the website and apply changes on the fly run in two
terminals `npm start` and `npm run css`.

## General notes

### HTML

The website is statically generated via `Eleventy (11ty)`, which provides some global
data from `src/_data/` for each template. Also, there is so-called "Font Matter
Data" - a list of variables inside a template, like

```
---
layout: _layout.pug 
---
```

It's an 11ty-specific block, unrelated to the template engine.

Theoretically, all layouts can be set via global (computed) 11ty data, or
even native `.pug` files can be used for each page (and Pug provides its own way
to use templates).

Also, look into `.eleventy.js` for additional config.

Everything else is done via template engines.

### CSS and static assets

`css` files are generated via `sass` independently of Eleventy. 11ty only
copies (and watches) generated `css` and static assets (including `js` files)
into the output directory.