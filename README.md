# The `djvu.js.org` website

To update the bundles edit the versions in `src/_data/globalData.json` and then:

```
npm run make
```

Commit changes and push them to the repository.

To edit the website and apply changes on the fly run:

```
npm start
```

## General notes

The website is built with `Pug` template engine, `Markdown`, `Sass (scss)` and
some js code.

The build process is configured manually, look into `package.json` scripts for
more details. 

The result static files are written into `docs` folder.