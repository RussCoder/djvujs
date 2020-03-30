# DjVu.js Viewer Changelog

## v.0.3.4 (30.03.2020)
- Viewer's programmatic API enhancement: page number can be set via configure(), getPageNumber() and PAGE_NUMBER_CHANGED event were added.

## v.0.3.3 (03.11.2019)
- Options. There is only one option to open all links to .djvu files via the viewer on click. It's available only in the extension.

## v.0.3.2 (26.10.2019)
- Fixed a bug due to which it was impossible to create many instance of the viewer on the same page.

## v.0.3.1 (11.08.2019)
- A page number can be set in the URL, e.g. some.djvu#page=10.

## v.0.3.0 (12.05.2019)
- Continuous scroll mode.

## v.0.2.5 (30.03.2019)
- Page scale can be set programmatically.

## v.0.2.4 (15.11.2018)

- Loading layer with a short delay. 
- Improvement in pages caching logic. 
- Minor fixes. 

## v.0.2.3 (12.10.2018)

- Some errors are shown instead of pages rather than in a pop-up window.
- Loading placeholder is shown when there is no image yet.
- Minor changes to support indirect djvu.

## v.0.2.2 (27.08.2018)

- Rotate pages 0, 90, 180, 270 degrees clockwise.
- New API allowing to set the initial page rotation programmatically. 
- Page positioning improvement.

## v.0.2.1 (20.08.2018)

- Turn over pages via scrolling.
- Bug fixes. 

## v.0.2.0 (05.08.2018)

- Now it's possible to create many instances of the viewer.
- Ctrl+S works even when the keyboard layout isn't English.

## v.0.1.7 (18.06.2018)

- The height of the containing element (which the viewer renders into) isn't changed anymore.
- DjVu global variable is encapsulated in a separate module.
- Minor styles update.

## v.0.1.6 (02.06.2018)

- Layout update: no tools panel on the initial screen.
- Drag&Drop file zone on the initial screen.
- A possibility to close a document and return to the initial screen.

## v.0.1.5 (25.05.2018)

- A page text layer and two cursor modes. 

## v.0.1.4 (16.05.2018)

- Pages are cached now, so better user experience is provided, since pages are switched faster. 

## v.0.1.3 (10.05.2018)

- Help button and help window.
- Layout update.
- Save button near the file block.
- Minor style improvements. 

## v.0.1.2 (01.05.2018)

- Program API: loadDocument and loadDocumentByUrl.
- File loading screen with a progress bar.
- Hotkeys: Ctrl+S to save the document, right/left arrows to go to next/previous pages. 

## v.0.1.1 (20.04.2018)

- Better error handling.
- Table of contents styles improvements.
- Now the page vertical scroll bar returns to the top, when a page is changed.

## v.0.1.0 (10.04.2018)

- Open single-page and multi-page .djvu documents.
- Show text of pages if it is provided.
- Scale images of pages. 
- Drag images of pages.
- Turn pages of documents, go to arbitrary page by its number.
- Table of contents is shown, if it exists in the document. An ability to turn over pages of the document via links of the table of contents.
- Full page mode.
- Status bar shows when a task is being executed.