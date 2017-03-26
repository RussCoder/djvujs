'use strict';

class JB2Dict extends JB2Codec {
    constructor(bs) {
        super(bs);
        this.dict = [];
        //this.decode();
    }
    
    decode(djbz) {
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
        
        this.decodeNum(0, 262142, this.imageSizeCtx);
        this.decodeNum(0, 262142, this.imageSizeCtx);
        // флаг всегда должен быть = 0 
        var flag = this.zp.decode([0], 0);
        if (flag) {
            throw new Error("Bad flag!!!");
        }
        type = this.decodeNum(0, 11, this.recordTypeCtx);
        
        var endflag = 0;
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
                //endflag = 1;
                var mbm = this.dict[symbolIndex];
                var cbm = this.decodeBitmapRef(mbm.width + widthdiff, heightdiff + mbm.height, mbm);
                //this.drawBitmap(cbm);
                this.dict.push(cbm);
                break;
            case 10:
                var comment = this.decodeComment();
                var str = "";
                for (var i = 0; i < comment.length; i++) {
                    var byte = comment[i];
                    str += String.fromCharCode(byte);
                }
                console.log(str);
                endflag = 1;
                break;
            default:
                endflag = 1;
                throw new Error("Indefined type in JB2Dict: ", type);          
            }
            if (endflag) {
                return;
            }
            type = this.decodeNum(0, 11, this.recordTypeCtx);
            if (type > 11) {
                console.log("TYPE ERROR " + type);
                break;
            }
        }
        Globals.dict = this.dict;
    }

}