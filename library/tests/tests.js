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
                TestHelper.endTestBlock();
                return runNextTest();
            });
        }

        TestHelper.writeLog(`Total time = ${Math.round(totalTime)} milliseconds`, "blue");
    };

    return runNextTest();
}

var TestHelper = {

    testBlock: null,

    writeLog(message, color = "black") {
        if (!this.testBlock) {
            this.testBlock = $('<div class="test_block"/>');
            outputBlock.append(this.testBlock);
        }
        this.testBlock.append(`<div style="color:${color}">${message}</div>`);
    },

    endTestBlock() {
        this.testBlock = null;
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

    getImageDataByImageURI(imageURI, rotate = 0) {
        var image = new Image();
        image.src = imageURI;
        return new Promise(resolve => {
            image.onload = () => {
                var canvas = document.createElement('canvas');
                if (rotate === 0 || rotate === 180) {
                    canvas.width = image.width;
                    canvas.height = image.height;
                } else {
                    canvas.width = image.height;
                    canvas.height = image.width;
                }
                var ctx = canvas.getContext('2d');
                if (rotate) {
                    ctx.translate(canvas.width / 2, canvas.height / 2)
                    ctx.rotate(rotate * Math.PI / 180);
                    ctx.translate(-canvas.width / 2, -canvas.height / 2);

                    // canvas.style.border = "1px solid black";
                    // document.body.appendChild(canvas);
                }
                ctx.drawImage(image, (canvas.width - image.width) / 2, (canvas.height - image.height) / 2);
                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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

    async _imageTest(djvuName, pageNum, imageName = null, hash = null, rotate = 0) {

        function checkByHash(data, message) {
            var isHashTheSame = TestHelper.getHashOfArray(data) === hash;
            return {
                isSuccess: isHashTheSame,
                messages: [
                    isHashTheSame ? "Hash is the same! Good" : "Hash is different!",
                    message
                ]
            };
        }

        var buffer = await (await fetch(`/assets/${djvuName}`)).arrayBuffer();
        await djvuWorker.createDocument(buffer);
        var obj = await djvuWorker.getPageImageDataWithDpi(pageNum);
        resultImageData = obj.imageData;
        if (imageName === null) {
            var result = checkByHash(resultImageData.data);
            return result.isSuccess ? null : result.messages[0];
        }
        var canonicImageData = await TestHelper.getImageDataByImageURI(`/assets/${imageName}`, rotate);
        var result = TestHelper.compareImageData(canonicImageData, resultImageData);
        if (result !== null && hash) {
            result = checkByHash(resultImageData.data, result);
        } else if (!hash) {
            result += "... Hash is " + TestHelper.getHashOfArray(resultImageData.data);
        }
        return result;
    },

    async _sliceTest(source, from, to, result) {
        const buffer = await (await fetch(source)).arrayBuffer();
        await djvuWorker.createDocument(buffer);
        const resultBuffer = await djvuWorker.doc.slice(from, to).run();
        const canonicBuffer = await (await fetch(result)).arrayBuffer();
        return TestHelper.compareArrayBuffers(canonicBuffer, resultBuffer);
    },

    /*test3LayerSiglePageDocument() { // отключен так как не ясен алгоритм масштабирования слоев
        return this._imageTest("happy_birthday.djvu", 0, "happy_birthday.png");
    },*/

    async _testText(djvuUrl, pageNumber, txtUrl) {
        const buffer = await (await fetch(djvuUrl)).arrayBuffer();
        await djvuWorker.createDocument(buffer);

        const [resultString, binText] = await Promise.all([
            pageNumber ? djvuWorker.doc.getPage(pageNumber).getText().run() : djvuWorker.doc.toString().run(),
            (await fetch(txtUrl)).arrayBuffer()
        ]);

        const canonicCharCodesArray = new Uint16Array(binText);
        for (var i = 0; i < canonicCharCodesArray.length; i++) {
            if (resultString.charCodeAt(i) !== canonicCharCodesArray[i]) {
                return "Text is incorrect!";
            }
        }
        return canonicCharCodesArray.length ? null : "No canonic text!";
    },

    async _testTextZones(djvuUrl, pageNumber, txtUrl, isNormalized = false) {
        const buffer = await (await fetch(djvuUrl)).arrayBuffer();
        await djvuWorker.createDocument(buffer);

        const page = djvuWorker.doc.getPage(pageNumber);
        const [textZones, binText] = await Promise.all([
            isNormalized ? page.getNormalizedTextZones().run() : page.getPageTextZone().run(),
            (await fetch(txtUrl)).arrayBuffer()
        ]);

        const resultString = JSON.stringify(textZones);

        const canonicCharCodesArray = new Uint16Array(binText);
        for (var i = 0; i < canonicCharCodesArray.length; i++) {
            if (resultString.charCodeAt(i) !== canonicCharCodesArray[i]) {
                return "Text Zones are incorrect!";
            }
        }
        return canonicCharCodesArray.length ? null : "No canonic text zones!";
    },

    testIncorrectFileFormatError() {
        return fetch(`/assets/boy.png`).then(res => res.arrayBuffer())
            .then(buffer => {
                return djvuWorker.createDocument(buffer);
            }).then(() => {
                return "No error! But there must be one!";
            }).catch(e => {
                if (e.code === DjVu.ErrorCodes.INCORRECT_FILE_FORMAT) {
                    return null;
                } else {
                    return e;
                }
            });
    },

    async testNoSuchPageError() {
        const buffer = await (await fetch(`/assets/boy.djvu`)).arrayBuffer();
        await djvuWorker.createDocument(buffer);
        try {
            var pageNumber = 100;
            await djvuWorker.getPageImageDataWithDpi(pageNumber);
        } catch (e) {
            if (e.code === DjVu.ErrorCodes.NO_SUCH_PAGE && e.pageNumber === pageNumber) {
                return null;
            } else {
                return e;
            }
        }
        return "No error! But there must be one!";
    },

    async testMetaDataOfDocWithShortINFOChunk() {
        return this._testText('/assets/carte.djvu', null, '/assets/carte_metadata.bin');
    },

    testPageTextZone() {
        return this._testTextZones('/assets/DjVu3Spec.djvu', 1, '/assets/DjVu3Spec_1_page_text_zone.bin');
    },

    testNormalizedTextZones() {
        return this._testTextZones('/assets/DjVu3Spec.djvu', 1, '/assets/DjVu3Spec_1_normalized_text_zones.bin', true);
    },

    async testContents() {
        const buffer = await (await fetch(`/assets/DjVu3Spec.djvu`)).arrayBuffer();
        await djvuWorker.createDocument(buffer);
        const contents = await djvuWorker.getContents();
        var res = await fetch('/assets/DjVu3Spec_contents.json');
        var canonicContents = await res.json();

        if (JSON.stringify(canonicContents) === JSON.stringify(contents)) {
            return null;
        } else {
            console.log(canonicContents, contents);
            return "Contents are different!";
        }
    },

    async testGetPageNumberByUrl() {
        const buffer = await (await fetch(`/assets/DjVu3Spec.djvu`)).arrayBuffer();
        await djvuWorker.createDocument(buffer);
        var pageNum = await djvuWorker.getPageNumberByUrl('#p0069.djvu');
        if (pageNum !== 69) {
            return `The url #p0069.djvu is targeted at 69 page but we got ${pageNum} !`;
        }
        pageNum = await djvuWorker.getPageNumberByUrl('#57');
        if (pageNum !== 57) {
            return `The url #57 is targeted at 57 page but we got ${pageNum} !`;
        }
        pageNum = await djvuWorker.getPageNumberByUrl('#900');
        if (pageNum !== null) {
            return `There is no page with the url #900, but we got ${pageNum} !`;
        }
        return null;
    },

    async testCancelAllWorkerTasks() {
        const buffer = await (await fetch(`/assets/boy.djvu`)).arrayBuffer();
        await djvuWorker.createDocument(buffer);
        try {
            var promises = [];
            for (var i = 2; i < 4; i++) {
                promises.push(djvuWorker.getPageImageDataWithDpi(i));
            }
            djvuWorker.cancelAllTasks();
            promises.push(djvuWorker.getPageImageDataWithDpi(i));
            await Promise.race(promises);
        } catch (e) {
            if (e.code === DjVu.ErrorCodes.NO_SUCH_PAGE && e.pageNumber === i) {
                return null;
            } else {
                return e;
            }
        }
        return "No error! But there must be one!";
    },

    async testCancelOneWorkerTask() {
        const buffer = await (await fetch(`/assets/boy.djvu`)).arrayBuffer();
        await djvuWorker.createDocument(buffer);
        try {
            var promises = [];
            for (var i = 2; i < 4; i++) {
                promises.push(djvuWorker.getPageImageDataWithDpi(i));
            }
            djvuWorker.cancelTask(promises[0]);
            promises.push(djvuWorker.getPageImageDataWithDpi(i));
            await Promise.race(promises);
        } catch (e) {
            if (e.code === DjVu.ErrorCodes.NO_SUCH_PAGE && e.pageNumber === 3) {
                return null;
            } else {
                return e;
            }
        }
        return "No error! But there must be one!";
    },

    testGetEnglishText() {
        return this._testText('/assets/DjVu3Spec.djvu', 1, '/assets/DjVu3Spec_1_text.bin');
    },

    testGetCzechText() {
        return this._testText('/assets/czech.djvu', 6, '/assets/czech_6_text.bin');
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
                fetch(`/assets/boy_and_chicken.djvu`).then(res => res.arrayBuffer()),
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

    testSliceDocumentWithCyrillicIds() {
        return this._sliceTest(`/assets/history.djvu`, 2, 2, `/assets/history_2.djvu`);
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

    testRotate90() {
        return this._imageTest("boy_jb2_rotate90.djvu", 1, "boy_jb2.png", -76276490, 90);
    },

    testRotate180() {
        return this._imageTest("boy_jb2_rotate180.djvu", 1, "boy_jb2.png", -76276490, 180);
    },

    testRotate270() {
        return this._imageTest("boy_jb2_rotate270.djvu", 1, "boy_jb2.png", -80336394, 270);
    },

    testJB2WithBitOfBackground() {
        return this._imageTest("DjVu3Spec.djvu", 48, "DjVu3Spec_48.png", 1367724765);
    },

    testJB2WhereRemovingOfEmptyEdgesOfBitmapsBeforeAddingToDictRequired() {
        return this._imageTest("problem_page.djvu", 1, "problem_page.png", 826528816);
    },

    testFGbzColoredMask() {
        return this._imageTest("navm_fgbz.djvu", 3, "navm_fgbz_3.png", 1017482741);
    },

    testPageWithCyrillicId() {
        return this._imageTest("history.djvu", 2, null, 1203480221);
    },

    async testEmptyPage() {
        var buffer = await (await fetch(`/assets/malliavin.djvu`)).arrayBuffer();
        await djvuWorker.createDocument(buffer);
        var obj = await djvuWorker.getPageImageDataWithDpi(6);
        if (!obj.imageData.data.every(byte => byte === 255)) {
            return "The page must be empty, but it isn't!";
        }
    },

    /*test3LayerColorImage() { // отключен так как не ясен алгоритм масштабирования слоев
        return this._imageTest("colorbook.djvu", 3, "colorbook_4.png");
    }*/
};

runAllTests();