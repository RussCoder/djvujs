'use strict';

var djvuWorker = new DjVu.Worker();

var resultImageData;

var outputBlock = $('#test_results_wrapper');

// test invocations 

function runAllTests() {
    var testNames = Object.keys(Tests);
    var totalTime = 0;
    var runNextTest = () => {
        while (testNames.length) {
            var testName = testNames.shift();
            if (testName[0] === "_") {
                continue;
            }
            TestHelper.writeLog(`${testName} started...`);
            var startTime = performance.now();
            return Tests[testName]().then((result) => {
                var testTime = performance.now() - startTime;
                totalTime += testTime;
                if (!result) {
                    TestHelper.writeLog(`${testName} succeeded!`, "green");
                } else if (result.isSuccess) {
                    TestHelper.writeLog(`${testName} succeeded!`, "green");
                    if (result.messages) {
                        result.messages.forEach(message => {
                            TestHelper.writeLog(message, "orange");
                        });
                    }
                } else {
                    TestHelper.writeLog(`Error: ${JSON.stringify(result)}`, "red");
                    TestHelper.writeLog(`${testName} failed!`, "red");
                }
                TestHelper.writeLog(`It has taken ${Math.round(testTime)} milliseconds`, "blue");
                TestHelper.writeLine();
                return runNextTest();
            });
        }

        TestHelper.writeLog(`Total time = ${Math.round(totalTime)} milliseconds`, "blue");
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

    getHashOfArray(array) {
        var hash = 0, i, chr;
        if (array.length === 0) return hash;
        for (i = 0; i < array.length; i++) {
            chr = array[i];
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
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

    compareArrayBuffers(canonicBuffer, resultBuffer) {
        var canonicArray = new Uint8Array(canonicBuffer);
        var resultArray = new Uint8Array(resultBuffer);

        if (canonicArray.length !== resultArray.length) {
            return `Несовпадение длины байтовых массивов! ${canonicArray.length} и ${resultArray.length}`
        }

        for (var i = 0; i < canonicArray.length; i++) {
            if (canonicArray[i] !== resultArray[i]) {
                return `Расхождение в байте номер ${i} !`;
            }
        }
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
        var byteStep = 4;

        var luft1Check = () => {
            var luftCheck = (luft) => {
                for (var i = 0; i < resultImageData.data.length; i++) {
                    if (
                        canonicImageData.data[i + luft] !== resultImageData.data[i]
                        && canonicImageData.data[i] !== resultImageData.data[i]
                    ) {
                        return i;
                    }
                }
                return null;
            };
            var successLuft = null;
            [byteStep, -byteStep, width, width + byteStep, width - byteStep, -width, -width + byteStep, -width - byteStep].some(luft => {
                var index = luftCheck(luft);
                if (index === null) {
                    successLuft = luft;
                    return true;
                }
            });
            return successLuft;
        };

        var strictResult = strictCheck();
        if (strictResult === null) {
            return null;
        } else {
            var luft1Result = luft1Check();
            if (luft1Result !== null) {
                return `Нестрогая проверка пройдена luft = ${luft1Result}, однако имеется расхождение пикселей! Строгая проверка: ${strictResult}`;
            } else {
                return `Pасхождение пикселей! Строгая проверка: ${strictResult}`;
            }
        }
    }

};

var Tests = {

    _imageTest(djvuName, pageNum, imageName, hash = null) {
        return DjVu.Utils.loadFile(`/assets/${djvuName}`)
            .then(buffer => {
                return djvuWorker.createDocument(buffer);
            })
            .then(() => djvuWorker.getPageImageDataWithDpi(pageNum))
            .then(obj => {
                resultImageData = obj.imageData;
                return TestHelper.getImageDataByImageURI(`/assets/${imageName}`);
            })
            .then(canonicImageData => {
                var result = TestHelper.compareImageData(canonicImageData, resultImageData);
                if (result !== null && hash) {
                    var isHashTheSame = TestHelper.getHashOfArray(resultImageData.data) === hash;
                    return {
                        isSuccess: isHashTheSame,
                        messages: [
                            isHashTheSame ? "Hash is the same! Good" : "Hash is different!",
                            result
                        ]
                    };
                } else if (!hash) {
                    result += "... Hash is " + TestHelper.getHashOfArray(resultImageData.data);
                }
                return result;
            });
    },

    _sliceTest(source, from, to, result) {
        var resultBuffer;
        return DjVu.Utils.loadFile(source)
            .then(buffer => djvuWorker.createDocument(buffer))
            .then(() => djvuWorker.slice(from, to))
            .then(_resultBuffer => {
                resultBuffer = _resultBuffer;
                return DjVu.Utils.loadFile(result);
            })
            .then(canonicBuffer => {
                return TestHelper.compareArrayBuffers(canonicBuffer, resultBuffer);
            });
    },

    /*test3LayerSiglePageDocument() { // отключен так как не ясен алгоритм масштабирования слоев
        return this._imageTest("happy_birthday.djvu", 0, "happy_birthday.png");
    },*/

    _testText(djvuUrl, pageNumber, txtUrl) {
        return DjVu.Utils.loadFile(djvuUrl)
            .then(buffer => {
                return djvuWorker.createDocument(buffer);
            })
            .then(() => {
                return Promise.all([
                    djvuWorker.getPageText(pageNumber),
                    DjVu.Utils.loadFile(txtUrl, 'text')
                ]);
            })
            .then(data => {
                if (data[0] === data[1]) {
                    return null;
                } else {
                    return "Text is incorrect!";
                }
            });
    },

    testGetEnglishText() {
        return this._testText('/assets/DjVu3Spec.djvu', 1, '/assets/DjVu3Spec_1.txt');
    },

    testGetCzechText() {
        return this._testText('/assets/czech.djvu', 6, '/assets/czech_6.txt');
    },

    testCreateDocumentFromPictures() {
        djvuWorker.startMultiPageDocument(90, 0, 0);
        return Promise.all([
            TestHelper.getImageDataByImageURI(`/assets/boy.png`),
            TestHelper.getImageDataByImageURI(`/assets/chicken.png`)
        ]).then(imageDatas => {
            return Promise.all(imageDatas.map(imageData => djvuWorker.addPageToDocument(imageData)));
        }).then(() => {
            return Promise.all([
                DjVu.Utils.loadFile(`/assets/boy_and_chicken.djvu`),
                djvuWorker.endMultiPageDocument()
            ]);
        }).then(arrayBuffers => {
            return TestHelper.compareArrayBuffers(...arrayBuffers);
        });
    },

    testSliceDocument() {
        return this._sliceTest(`/assets/DjVu3Spec.djvu`, 5, 10, `/assets/DjVu3Spec_5-10.djvu`);
    },

    testSliceDocumentWithAnnotations() {
        return this._sliceTest(`/assets/czech.djvu`, 1, 3, `/assets/czech_1-3.djvu`);
    },

    testGrayscaleBG44() {
        return this._imageTest("boy.djvu", 1, "boy.png", -1560338846);
    },

    testColorBG44() {
        return this._imageTest("chicken.djvu", 1, "chicken.png", 1973539465);
    },

    testJB2Pure() {
        return this._imageTest("boy_jb2.djvu", 1, "boy_jb2.png", -650210314);
    },

    testJB2WithBitOfBackground() {
        return this._imageTest("DjVu3Spec.djvu", 48, "DjVu3Spec_48.png", 1367724765);
    },

    testJB2WhereRemovingOfEmptyEdgesOfBitmapsBeforeAddingToDictRequired() {
        return this._imageTest("problem_page.djvu", 1, "problem_page.png", 826528816);
    },

    testFGbzColoredMask() {
        return this._imageTest("navm_fgbz.djvu", 3, "navm_fgbz_3.png", 1017482741);
    }

    /*test3LayerColorImage() { // отключен так как не ясен алгоритм масштабирования слоев
        return this._imageTest("colorbook.djvu", 3, "colorbook_4.png");
    }*/
};

runAllTests();