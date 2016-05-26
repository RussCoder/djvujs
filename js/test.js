'use strict';

class TEST {
    constructor() {
        this.a = 12; 
        this.str = "Hello";
    }

    func() {
        console.log(this.str);
    }
}


function BWT(arr) {
    var length = arr.length;
    var offs = new Array(arr.length);    
    for (var i = 0; i < length; offs[i] = i++) {}
    console.log(offs);
    compare.alength = length;
    offs.sort(compare);
    var narr = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        var pos = offs[i] - 1;
        if (pos >= 0) {
            narr[i] = arr[pos];
        } 
        else {
            narr[i] = 0;
            makerpos = i;
        }
    }
    for (var i = 0; i < length; i++) {
        var str = '';
        for (var j = 0; j < arr.length; j++) {
            str += ' ' + arr[(offs[i] + j) % length];
        }
        console.log(str);
    }
    return narr;

}

function compare(a, b) {
    for (var i = 0; i < compare.alength; i++) {
        if (a === makerpos) {
            return 1;
        } 
        else if (b === makerpos) {
            return -1;
        }
        var res = arr[a] - arr[b];
        if (res) {
            return res;
        }
    }
    return 0;
}

var makerpos;

//var arr = [3, 2, 1, 3, 2, 1, 3, 2, 1, 0];

//var arr = [11, 3, 2, 10, 2, 10, 2, 0];

var arr = new Uint8Array([11, 3, 2, 10, 2, 10, 2, 0]);
makerpos = arr.length - 1;
console.log(arr);
var narr = BWT(arr);
console.log(narr);
var t  = new TEST();
t.func();


