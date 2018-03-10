export class Bitmap {
    constructor(width, height) {
        var length = Math.ceil(width * height / 8); // число байт необходимых для кодировки черно-белого изображенияы
        this.height = height;
        this.width = width;
        this.innerArray = new Uint8Array(length);
    }

    get(i, j) {
        if (!this.hasRow(i) || j < 0 || j >= this.width) {
            return 0;
        }
        var tmp = i * this.width + j;
        var index = tmp >> 3;
        var bitIndex = tmp & 7;
        var mask = 128 >> bitIndex;
        var answ = (this.innerArray[index] & mask) ? 1 : 0;
        return answ;
    }

    set(i, j) { // сделать "пиксель" черным
        var tmp = i * this.width + j;
        var index = tmp >> 3;
        var bitIndex = tmp & 7;
        var mask = 128 >> bitIndex;
        this.innerArray[index] |= mask;
        return;
    }

    hasRow(r) {
        return r >= 0 && r < this.height;
    }

    removeEmptyEdges() {
        var bottomShift = 0;
        var topShift = 0;
        var leftShift = 0;
        var rightShift = 0;

        main_cycle: for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            bottomShift++;
        }

        main_cycle: for (var i = this.height - 1; i >= 0; i--) {
            for (var j = 0; j < this.width; j++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            topShift++;
        }

        main_cycle: for (var j = 0; j < this.width; j++) {
            for (var i = 0; i < this.height; i++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            leftShift++;
        }

        main_cycle: for (var j = this.width - 1; j >= 0; j--) {
            for (var i = 0; i < this.height; i++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            rightShift++;
        }

        if (topShift || bottomShift || leftShift || rightShift) {
            var newWidth = this.width - leftShift - rightShift;
            var newHeight = this.height - topShift - bottomShift;
            var newBitMap = new Bitmap(newWidth, newHeight);
            for (var i = bottomShift, p = 0; p < newHeight; p++ , i++) {
                for (var j = leftShift, q = 0; q < newWidth; q++ , j++) {
                    if (this.get(i, j)) {
                        newBitMap.set(p, q);
                    }
                }
            }
            return newBitMap;
        }

        return this;
    }
}

export class NumContext {
    constructor() {
        this.ctx = [0];
        this._left = null;
        this._right = null;
    }

    get left() {
        if (!this._left) {
            this._left = new NumContext();
        }
        return this._left;
    }

    get right() {
        if (!this._right) {
            this._right = new NumContext();
        }
        return this._right;
    }
}

// структура для вычисления позиции символов на картинке
export class Baseline {
    constructor() {
        this.arr = new Array(3);
    }

    add(val) {
        this.arr.shift();
        this.arr.push(val);
    }

    getVal() {
        if (!this.arr[0]) {
            return this.arr[1] ? this.arr[1] : this.arr[2];
        }
        if (this.arr[0] >= this.arr[1] && this.arr[0] <= this.arr[2]
            || this.arr[0] <= this.arr[1] && this.arr[0] >= this.arr[2]) {
            return this.arr[0];
        }
        else if (this.arr[1] >= this.arr[0] && this.arr[1] <= this.arr[2]
            || this.arr[1] <= this.arr[0] && this.arr[1] >= this.arr[2]) {
            return this.arr[1];
        } else {
            return this.arr[2];
        }
    }

    reinit() {
        this.arr[0] = this.arr[1] = this.arr[2] = 0;
    }
}