import inject from 'rollup-plugin-inject';
import legacy from 'rollup-plugin-legacy';
import replace from 'rollup-plugin-re';
import cleanup from 'rollup-plugin-cleanup';

export default {
    input: './src/index.js',
    output: [{
        file: 'dist/djvu.js',
        format: 'iife',
        name: 'DjVu'
    }, {
        file: '../viewer/public/tmp/djvu.js',
        format: 'iife',
        name: 'DjVu'
    }],
    plugins: [
        replace({
            defines: {
                FALSE_FLAG: false
            },
            replaces: {
                "'use strict';": ''
            }
        }),
        legacy({ // what is exported in each file
            "./src/DjVu.js": "DjVu",
            "./src/ByteStream.js": "ByteStream",
            "./src/ZPCodec.js": {
                "ZPEncoder": "ZPEncoder",
                "ZPDecoder": "ZPDecoder"
            },
            "./src/IFFChunks.js": {
                "IFFChunk": "IFFChunk",
                "DjVuError": "DjVuError",
                "ColorChunk": "ColorChunk",
                "INFOChunk": "INFOChunk",
                "INCLChunk": "INCLChunk",
                "CIDaChunk": "CIDaChunk",
                "NAVMChunk": "NAVMChunk",
                "DIRMChunk": "DIRMChunk"
            },
            "./src/BZZDecoder.js": "BZZDecoder",
            "./src/BZZEncoder.js": "BZZEncoder",
            "./src/IWCodecBaseClass.js": {
                Bytemap: "Bytemap",
                Block: "Block",
                IWCodecBaseClass: "IWCodecBaseClass"
            },
            "./src/DjVuText.js": "DjVuText",
            "./src/IWDecoder.js": "IWDecoder",
            "./src/IWEncoder.js": "IWEncoder",
            "./src/IWImage.js": "IWImage",
            "./src/DjVuPalette.js": "DjVuPalette",
            "./src/JB2Codec.js": "JB2Codec",
            "./src/JB2Dict.js": "JB2Dict",
            "./src/JB2Image.js": "JB2Image",
            "./src/DjViChunk.js": "DjViChunk",
            "./src/DjVuPage.js": "DjVuPage",
            "./src/DjVuDocument.js": "DjVuDocument",
            "./src/ByteStreamWriter.js": "ByteStreamWriter",
            "./src/IWImageWriter.js": "IWImageWriter",
            "./src/DjVuWriter.js": "DjVuWriter",
            "./src/DjVuWorker.js": "DjVuWorker"
        }),
        inject({ // how to import dependencies

            // control which files this plugin applies to
            // with include/exclude
            include: 'src/*.js',
            exclude: 'node_modules/**',

            /* all other options are treated as modules...*/

            // use the default – i.e. insert
            // import $ from 'jquery'
            DjVu: "./DjVu.js",
            ByteStream: "./ByteStream.js",
            ZPEncoder: ["./ZPCodec.js", "ZPEncoder"],
            ZPDecoder: ["./ZPCodec.js", "ZPDecoder"],
            "IFFChunk": ["./IFFChunks.js", "IFFChunk"],
            "DjVuError": ["./IFFChunks.js", "DjVuError"],
            "ColorChunk": ["./IFFChunks.js", "ColorChunk"],
            "INFOChunk": ["./IFFChunks.js", "INFOChunk"],
            "INCLChunk": ["./IFFChunks.js", "INCLChunk"],
            "CIDaChunk": ["./IFFChunks.js", "CIDaChunk"],
            "NAVMChunk": ["./IFFChunks.js", "NAVMChunk"],
            "DIRMChunk": ["./IFFChunks.js", "DIRMChunk"],
            BZZDecoder: "./BZZDecoder.js",
            BZZEncoder: "./BZZEncoder.js",
            IWCodecBaseClass: ["./IWCodecBaseClass.js", "IWCodecBaseClass"],
            Bytemap: ["./IWCodecBaseClass.js", "Bytemap"],
            Block: ["./IWCodecBaseClass.js", "Block"],
            IWDecoder: "./IWDecoder.js",
            IWEncoder: "./IWEncoder.js",
            IWImage: "./IWImage.js",
            DjVuPalette: "./DjVuPalette.js",
            DjVuText: "./DjVuText.js",
            JB2Codec: "./JB2Codec.js",
            JB2Dict: "./JB2Dict.js",
            JB2Image: "./JB2Image.js",
            DjViChunk: "./DjViChunk.js",
            DjVuPage: "./DjVuPage.js",
            DjVuDocument: "./DjVuDocument.js",
            ByteStreamWriter: "./ByteStreamWriter.js",
            IWImageWriter: "./IWImageWriter.js",
            DjVuWriter: "./DjVuWriter.js",
            DjVuWorker: "./DjVuWorker.js"
        }),
        cleanup()
    ],
    treeshake: false
};