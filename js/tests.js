'use strict';

var djvuWorker = new DjVuWorker();

var resultImageData;

var outputBlock = $('#test_results_wrapper');

// test invocations 

function runAllTests() {
    var testNames = Object.keys(Tests);
    var runNextTest = () => {
        while (testNames.length) {
            var testName = testNames.shift();
            if (testName[0] === "_") {
                continue;
            }
            TestHelper.writeLog(`${testName} started...`);
            return Tests[testName]().then((error) => {
                if (error) {
                    TestHelper.writeLog(`Error: ${error}`, "red");
                    TestHelper.writeLog(`${testName} fails!`, "red");
                } else {
                    TestHelper.writeLog(`${testName} succeeded!`, "green");
                }

                TestHelper.writeLine();
                return runNextTest();
            });
        }
    };

    return runNextTest();
}

var TestHelper = {
    writeLog(message, color = "black") {
        outputBlock.append(`<div style="color:${color}">${message}</div>`);
    },

    writeLine() {
        outputBlock.append("<hr>");
    },

    getImageDataByImageURI(imageURI) {
        var image = new Image();
        image.src = imageURI;
        return new Promise(resolve => {
            image.onload = () => {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                var imageData = ctx.getImageData(0, 0, image.width, image.height);
                resolve(imageData);
            };
        });
    },

    compareImageData(canonicImageData, resultImageData) {
        if (canonicImageData.width !== resultImageData.width) {
            return `Несовпадение ширины! ${canonicImageData.width} и ${resultImageData.width}`;
        }

        if (canonicImageData.height !== resultImageData.height) {
            return `Несовпадение высоты! ${canonicImageData.height} и ${resultImageData.height}`;
        }

        var strictCheck = () => {
            for (var i = 0; i < resultImageData.data.length; i++) {
                if (
                    canonicImageData.data[i] !== resultImageData.data[i]
                ) {
                    return i;
                }
            }
            return null;
        };

        var height = canonicImageData.height * 4;
        var width = canonicImageData.width * 4;
        var byteStep = 8;

        var luft1Check = () => {
            for (var i = 0; i < resultImageData.data.length; i++) {
                if (
                    canonicImageData.data[i] !== resultImageData.data[i]
                    && canonicImageData.data[i + byteStep] !== resultImageData.data[i]
                    && canonicImageData.data[i - byteStep] !== resultImageData.data[i]
                    && canonicImageData.data[i + width] !== resultImageData.data[i]
                    && canonicImageData.data[i + width + byteStep] !== resultImageData.data[i]
                    && canonicImageData.data[i + width - byteStep] !== resultImageData.data[i]
                    && canonicImageData.data[i - width] !== resultImageData.data[i]
                    && canonicImageData.data[i - width + byteStep] !== resultImageData.data[i]
                    && canonicImageData.data[i - width - byteStep] !== resultImageData.data[i]
                ) {
                    return i;
                }
            }
            return null;
        };

        var strictResult = strictCheck();
        if (strictResult === null) {
            return null;
        } else {
            var luft1Result = luft1Check();
            if (luft1Result === null) {
                return `Нестрогая проверка пройдена, однако имеется расхождение пикселей! Строгая проверка: ${strictResult}`;
            } else {
                return `Pасхождение пикселей! Строгая проверка: ${strictResult} Нестрогая проверка: ${luft1Result}`;
            }
        }
    }

};

var Tests = {

    _imageTest(djvuName, pageNum, imageName) {
        return DjVu.Utils.loadFile(`/assets/${djvuName}`)
            .then(buffer => djvuWorker.createDocument(buffer))
            .then(() => djvuWorker.getPageImageDataWithDPI(pageNum))
            .then(obj => {
                resultImageData = obj.imageData;
                return TestHelper.getImageDataByImageURI(`/assets/${imageName}`);

            })
            .then(canonicImageData => {
                return TestHelper.compareImageData(canonicImageData, resultImageData);
            });
    },

    /*test3LayerSiglePageDocument() { // отключен так как не ясен алгоритм масштабирования слоев
        return this._imageTest("happy_birthday.djvu", 0, "happy_birthday.png");
    },*/

    testGrayscaleBG44() {
        return this._imageTest("boy.djvu", 0, "boy.png");
    },

    testColorBG44() {
        return this._imageTest("chicken.djvu", 0, "chicken.png");
    },

    testJB2Pure() {
        return this._imageTest("boy_jb2.djvu", 0, "boy_jb2.png");
    },

    testJB2WithBitOfBackground() {
        return this._imageTest("DjVu3Spec.djvu", 47, "DjVu3Spec_48.png");
    },

    /*test3LayerColorImage() { // отключен так как не ясен алгоритм масштабирования слоев
        return this._imageTest("colorbook.djvu", 3, "colorbook_4.png");
    }*/
}

runAllTests();