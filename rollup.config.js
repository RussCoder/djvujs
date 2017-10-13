import inject from 'rollup-plugin-inject';
import legacy from 'rollup-plugin-legacy';

export default {
    input: 'rollup_index.js',
    output: {
        file: 'dist/djvu.js',
        format: 'iife',
        name: 'DjVu'
    },
    plugins: [
        legacy({
            "./djvujs/DjVu.js": "DjVu",
            "./djvujs/ByteStream.js": "ByteStream",
            "./djvujs/ZPCodec.js": {
                "ZPEncoder": "ZPEncoder",
                "ZPDecoder": "ZPDecoder"
            },
            "./djvujs/IFFChunks.js": {
                "IFFChunk": "IFFChunk",
                "DjVuError": "DjVuError",
                "ColorChunk": "ColorChunk",
                "INFOChunk": "INFOChunk",
                "INCLChunk": "INCLChunk",
                "CIDaChunk": "CIDaChunk",
                "NAVMChunk": "NAVMChunk",
                "DIRMChunk": "DIRMChunk"
            },
            "./djvujs/BZZDecoder.js": "BZZDecoder",
            "./djvujs/BZZEncoder.js": "BZZEncoder",
            "./djvujs/IWCodecBaseClass.js": {
                Bytemap: "Bytemap",
                Block: "Block",
                IWCodecBaseClass: "IWCodecBaseClass"
            },
            "./djvujs/IWDecoder.js": "IWDecoder",
            "./djvujs/IWEncoder.js": "IWEncoder",
            "./djvujs/IWImage.js": "IWImage",
            "./djvujs/DjVuPalette.js": "DjVuPalette",
            "./djvujs/JB2Codec.js": "JB2Codec",
            "./djvujs/JB2Dict.js": "JB2Dict",
            "./djvujs/JB2Image.js": "JB2Image",
            "./djvujs/DjViChunk.js": "DjViChunk",
            "./djvujs/DjVuPage.js": "DjVuPage",
            "./djvujs/DjVuDocument.js": "DjVuDocument",
            "./djvujs/ByteStreamWriter.js": "ByteStreamWriter",
            "./djvujs/IWImageWriter.js": "IWImageWriter",
            "./djvujs/DjVuWriter.js": "DjVuWriter",
            "./djvujs/DjVuGlobals.js": "Globals",
            "./djvujs/DjVuWorker.js": "DjVuWorker"
        }),
        inject({
            // control which files this plugin applies to
            // with include/exclude
            include: 'djvujs/*.js',
            exclude: 'node_modules/**',

            /* all other options are treated as modules...*/

            // use the default – i.e. insert
            // import $ from 'jquery'
            DjVu: "./DjVu.js",
            Globals: "./DjVuGlobals.js",
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
        })
    ],
    treeshake: false
};