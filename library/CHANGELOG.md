# DjVu.js Library Changelog

## v.0.1.1 (19.03.2018)

- UTF-8 strings are decoded correctly now.

## v.0.1.0 (14.03.2018)

- IW44, BZZ and ZP codecs are fully implemented with some constraints in case of BZZ codec.
- JB2 codec is implemented only for decoding.
- BGjp, FGjp, Smmr are not supported at all.
- ANTa, ANTz, NAVM, FORM:THUM and TH44 are not supported, but there are dummies for them, so they are processed somehow.
- Support of TXTz and TXTa is implemented partly, only pure text is decoded.
- The library can split a djvu file, render pages, generate metadata of djvu files, and create a document from a set of images (using IW44 codec).