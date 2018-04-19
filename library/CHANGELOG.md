# DjVu.js Library Changelog

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