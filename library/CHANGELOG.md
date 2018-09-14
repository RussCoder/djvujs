# DjVu.js Library Changelog

## v.0.2.2 (14.09.2018)

- Rotation flags are processed now. A image of page is rotated by default if required.

## v.0.2.1 (20.08.2018)

- Empty pages are processed correctly.

## v.0.2.0 (16.06.2018)

- DjVuWorker is created from the Data URL which is generated automatically, so there is no need in explicit script URL. 
- Additional method run() for the DjVuWorkerTask (the proxy object which is return by the "doc" property of the worker).
- Utils.loadFile() is deprecated now.
- The whole script is available through the DjVu.DjVuScript() method, which is added as a wrapper in the build process. 

## v.0.1.9 (25.05.2018)

- TXT* chunks are decoded completely - text zones are decoded.
- Normalized text zones for the text layer of page. 

## v.0.1.8 (15.05.2018)

- New universal Proxy-based DjVuWorker API, allowing to automatically use most of methods of DjVuDocument.

## v.0.1.7 (19.04.2018)

- UTF-8 ids of pages and dictionaries are supported.

## v.0.1.6 (15.04.2018)

- JB2 codec performance optimizations (more efficient memory access)

## v.0.1.5 (05.04.2018)

- Old files with INFO chunks less than 10 bytes are supported.
- A specific error for corrupted files. 

## v.0.1.4 (27.03.2018)

- A table of contents can be gotten.
- A page number may be gotten by a url. 

## v.0.1.3 (25.03.2018)

- All worker tasks-promises can be cancelled now.
- A task is posted to the worker only after the previous one is fulfilled.

## v.0.1.2 (24.03.2018)

- Unified style of DjVuErrors, which are errors that are thrown manually, when a file is corrupted, there is no requested page and so on. 
- DjVuErrors are rather simple objects that may be copied between workers. 

## v.0.1.1 (19.03.2018)

- UTF-8 strings are decoded correctly now.

## v.0.1.0 (14.03.2018)

- IW44, BZZ and ZP codecs are fully implemented with some constraints in case of BZZ codec.
- JB2 codec is implemented only for decoding.
- BGjp, FGjp, Smmr are not supported at all.
- ANTa, ANTz, NAVM, FORM:THUM and TH44 are not supported, but there are dummies for them, so they are processed somehow.
- Support of TXTz and TXTa is implemented partly, only pure text is decoded.
- The library can split a djvu file, render pages, generate metadata of djvu files, and create a document from a set of images (using IW44 codec).