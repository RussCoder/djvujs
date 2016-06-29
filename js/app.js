'use strict';

var djvuWorker = new DjVuWorker();

$('#sitename, #mainpagehref').click(reset);
$('#slicefunc').click(sliceFuncPrepare);
$('#picturefunc').click(pictureFuncPrepare);

function reset(event) {
    event.preventDefault();
    event.stopPropagation();
    $('.funcblock').hide(400);
    $('#funcmenublock').show(400);
}


function pictureFuncPrepare() {
    $('#funcmenublock').hide(400);
    $('#funcblock').show(400);
    var picuture = $('#pictureblock').show(400);
    $('#finput').prop('multiple', true).off('change').change(function () {
        $('#filehref').hide();
        $('#picturebut').prop('disabled', false);

    });
    $('#picturebut').click(readImagesAndCreateDocument);
}

function readImagesAndCreateDocument() {
    var files = $('#finput')[0].files;
    var i = 0;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var imageArray = new Array(files.length);
    $("#procmess").text("Загрузка файлов ...");
    var func = () => {
        createImageBitmap(files[i])
            .then((image) => {
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                var imageData = ctx.getImageData(0, 0, image.width, image.height);
                imageArray[i++] = imageData;
                if (i < files.length) {
                    func();
                }
                else {
                    createPicDocument(imageArray);
                    $("#procmess").text("Задание выполняется ...");
                }
            },
            (e) => {
                $("#procmess").text("Ошибка при загрузке файлов! " + e.message);
            });
    }
    func();
}

function createPicDocument(imageArray) {
    djvuWorker.createDocumentFromPictures(imageArray)
        .then((buffer) => {
            $("#procmess").text("Задание выполненено !!!");
            $('#filehref').prop('href', DjVuWorker.createArrayBufferURL(buffer)).show(400);
        },
        () => {
            $("#procmess").text("Ошибка при обработке файла !!!");
        });
    djvuWorker.onprocess = (percent) => {
        $("#procmess").text("Задание выполняется ... " + (percent * 100 >> 0) + '%');
    }
}


function sliceFuncPrepare() {
    $('#funcmenublock').hide(400);
    $('#funcblock').show(400);
    var sliceblock = $('#sliceblock').show(400);
    $("#finput").off('change').change(function () {
        $('#filehref').hide();
        if (this.files.length) {
            if (this.files[0].name.substr(-5) !== '.djvu') {
                $('#warnmess').text("Расширение файла не .djvu !!!");
                return;
            }
            $('#warnmess').text("");

            sliceblock.find('.info').text('');
            var fr = new FileReader();
            fr.readAsArrayBuffer($("#finput")[0].files[0]);
            fr.onload = () => {
                var buf = fr.result;
                djvuWorker.createDocument(buf)
                    .then(() => {
                        $("#procmess").text('');
                        sliceblock.find('.info').text('Документ содержит ' + djvuWorker.pagenumber
                            + ' страниц. Вы можете ввести значение от 1 до ' + djvuWorker.pagenumber);
                        $('#slicebut').off('off').click(sliceFunc).prop('disabled', false);
                    },
                    () => {
                        $("#procmess").text("Ошибка при обработке файла !!!");
                    });
            }
        }
        else {
            $('#slicebut').prop('disabled', true);
        }
    });
}

function sliceFunc() {
    $("#procmess").text("Задание выполняется ...");
    $('#filehref').hide();
    var from = +$("#firstnum").val() - 1;
    var to = +$("#secondnum").val();
    djvuWorker.slice(from, to)
        .then((buffer) => {
            $("#procmess").text("Задание выполненено !!!");
            $('#filehref').prop('href', DjVuWorker.createArrayBufferURL(buffer)).show(400);
        },
        () => { // reject
            $("#procmess").text("Ошибка при обработке файла !!!");
        });
}