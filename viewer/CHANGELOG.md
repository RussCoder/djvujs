# DjVu.js Viewer's Changelog

## v.0.9.1 (01.02.2023)

- Spanish translation update.
- DjVu.js v.0.5.4: error messages are displayed again.

## v.0.9.0 (24.05.2022)

- Feature: several pages in a row in the continuous scroll mode.
- Fix: pinch-zoom works on mobile devices in the continuous scroll mode. 
- Style improvements. 

## v.0.8.3 (14.11.2021)

- French translation update.
- Minor style fixes.

## v.0.8.2 (23.09.2021)

- Support for big images (up to 20K * 20K pixels) in the single page view mode.
- Dynamic letter spacing in the text layer to make text fully fill its zone.
- API to change view mode programmatically.
- Fixed: a previous page was shown for a short while when one switched from
  continuous scroll to single page view mode.
- Getters, constants and action types are exposed as an escape hatch API for
  temporary solutions.

## v.0.8.1 (11.09.2021)

- Fixed a bug from the previous release (the text layer couldn't be selected).
- Updated Italian and Chinese translations.

## v.0.8.0 (06.09.2021)

- Mobile version.
- Fullscreen mode.
- Image scaling via pinch zoom.

## v.0.7.1 (30.08.2021)

- Toolbar can be pinned and unpinned.
- Minor fixes and improvements.

## v.0.7.0 (20.08.2021)

- Removed footer, added menu in order to use less space for controls.
- Contents panel is animated and can be closed completely.
- Continuous scroll mode performance improvement.

## v.0.6.2 (06.04.2021)

- Spanish and Portuguese translations.
- French translation update.

## v.0.6.1 (14.03.2021)

- Fixed print CSS to avoid printing empty pages in Safari.

## v.0.6.0 (10.03.2021)

- Print function.
- New UI options to hide open, close, print and save buttons.

## v.0.5.6 (21.02.2021)

- Simplified Chinese translation.
- UI options: a notification/agreement can be shown when a user tries to save a
  document.
- Save an indirect document after it's bundled with its original name.
- UI improvement: a handle to resize the left panel.

## v.0.5.5 (18.02.2021)

- Translation of error messages.
- New UI options: `showContentsAutomatically` and `changePageOnScroll`.
- Options window.
- Support of absolute and relative links in the table of contents.
- Italian translation.
- Minor improvements and corrections.

## v.0.5.4 (16.01.2021)

- French translation.
- An option to hide the full-page mode switch.

## v.0.5.3 (08.12.2020)

- Fix: styles in the help window.
- Update of the Swedish translation.

## v.0.5.2 (06.12.2020)

- Feature: bundle indirect djvu documents (suggestion in the save dialog).
- Fix: hide the page's scrollbars in the full page mode.

## v.0.5.1 (19.11.2020)
- Separate image and text errors for a page in order to show the part of data which is available.
  (Former behavior: if the text couldn't be decoded, an error page was shown, even if the image had been gotten)
  It's related only to the single-page view mode.

## v.0.5.0 (09.11.2020)
- Dark and light color themes.
- All CSS is built into the JS file.
- Preference for the continuous-scroll view mode is saved in the options now.
- Bug fixes and style improvements.

## v.0.4.1 (23.08.2020)
- Swedish translation.
- File name is extracted from the Content-Disposition header, if it's present.
- Russian translation was corrected.

## v.0.4.0 (19.08.2020)
- Multi-Language support.
- Russian and English languages.

## v.0.3.6 (27.07.2020)
- An ability to load a file by URL manually in the extension. 
- An extension option to analyze http headers to detect djvu files.

## v.0.3.5 (24.04.2020)
- New DOCUMENT_CLOSED and DOCUMENT_CHANGED events to change the page title dynamically. 
- decodeURIComponent applied to a file's name derived from a URL.
- Fixed a bug due to which there was no file names, but only ***. 

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