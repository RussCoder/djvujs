'use strict';

class JB2Dict extends JB2Codec {
    constructor(bs) {
        super(bs);
        this.dict = [];
        this.isDecoded = false;
    }

    decode(djbz) {
        if (this.isDecoded) {
            return;
        }
        var type = this.decodeNum(0, 11, this.recordTypeCtx);
        if (type == 9) {
            // длина словаря
            var size = this.decodeNum(0, 262142, this.inheritDictSizeCtx);
            djbz.decode();
            this.dict = djbz.dict.slice(0, size);
            //тип следующей записи (должен быть 0)
            type = this.decodeNum(0, 11, this.recordTypeCtx);
            //console.log(size);
        }

        this.decodeNum(0, 262142, this.imageSizeCtx); // image width
        this.decodeNum(0, 262142, this.imageSizeCtx); // image height
        // флаг всегда должен быть = 0 
        var flag = this.zp.decode([0], 0);
        if (flag) {
            throw new Error("Bad flag!!!");
        }
        type = this.decodeNum(0, 11, this.recordTypeCtx);

        var width, widthdiff, heightdiff, symbolIndex;
        var height;
        var bm;
        while (type !== 11) {
            switch (type) {
                case 2:
                    width = this.decodeNum(0, 262142, this.symbolWidthCtx);
                    height = this.decodeNum(0, 262142, this.symbolHeightCtx);
                    bm = this.decodeBitmap(width, height);
                    this.dict.push(bm);
                    //this.drawBitmap(bm);
                    break;
                case 5:
                    symbolIndex = this.decodeNum(0, this.dict.length - 1, this.symbolIndexCtx);
                    widthdiff = this.decodeNum(-262143, 262142, this.symbolWidthDiffCtx);
                    heightdiff = this.decodeNum(-262143, 262142, this.symbolHeightDiffCtx);
                    var mbm = this.dict[symbolIndex];
                    var cbm = this.decodeBitmapRef(mbm.width + widthdiff, heightdiff + mbm.height, mbm);
                    //this.drawBitmap(cbm);
                    this.dict.push(cbm.removeEmptyEdges());
                    break;

                case 9: // Numcoder reset
                    //this.decodeNum(0, 262142, this.inheritDictSizeCtx);
                    console.log("RESET DICT");
                    this.resetNumContexts();
                    break;

                case 10:
                    /*var comment = */this.decodeComment();
                    /*var str = ""; // TODO: test comments
                    for (var i = 0; i < comment.length; i++) {
                        var byte = comment[i];
                        str += String.fromCharCode(byte);
                    }*/
                    break;

                default:
                    throw new Error("Unsupported type in JB2Dict: " + type);
            }

            type = this.decodeNum(0, 11, this.recordTypeCtx);
            if (type > 11) {
                console.error("TYPE ERROR " + type);
                break;
            }
        }

        this.isDecoded = true;
    }
}