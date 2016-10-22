'use strict';

var djvuWorker = new DjVuWorker();

$('#backbutton').click(reset);
$('.funcelem').on('click', () => {
   $('#backbutton').show(400); 
}); 
$('#slicefunc').click(sliceFuncPrepare);
$('#picturefunc').click(pictureFuncPrepare);
$('#metadatafunc').click(metaDataFuncPrepare);

function reset(event) {
    event.preventDefault();
    event.stopPropagation();
    $('.funcblock').hide(400);
    $('#backbutton').hide(400);
    $('#funcmenublock').show(400);
    $('#finput').wrap('<form>').closest('form').get(0).reset();
    $('#finput').unwrap().removeAttr('multiple').off('change');
    $('.info').text('');
    $('#procmess').text('');
    $('#filehref').hide();
    djvuWorker.reset();
}


function metaDataFuncPrepare() {
    $('#funcmenublock').hide(400);
    $('#funcblock').show(400);
    var mtblock = $('#metaDataBlock').show(400);
    $("#finput").change(metaDataFunc);
    $("#procmess").text("");
    $("#metaDataBlock #metadata").html('');
}

function metaDataFunc() {
    $("#procmess").text("");
    $("#metaDataBlock #metadata").html('');
    if (this.files.length) {
        if (this.files[0].name.substr(-5) !== '.djvu') {
            $('#warnmess').text("Расширение файла не .djvu !!!");
            return;
        }
        $('#warnmess').text("");
        var fr = new FileReader();
        fr.readAsArrayBuffer($("#finput")[0].files[0]);
        $("#procmess").text('Загрузка документа ...');
        fr.onload = () => {
            var buf = fr.result;
            djvuWorker.createDocument(buf)

                .then(() => {
                    $("#procmess").text('Задание выполняется ...');
                    return djvuWorker.getDocumentMetaData(true);
                })

                .then(str => {
                    $("#procmess").text("Задание выполнено !");
                    $("#metaDataBlock #metadata").html(str);
                })

                .catch(() => {
                    $("#procmess").text("Ошибка при обработке файла !!!");
                });
        }
    }
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
    var delayInit = 0;
    var slices = +$('input[name=imagequality]:checked').val();
    var grayscale = $('#grayscale').prop('checked') ? 1 : 0;

    var files = $('#finput')[0].files;
    djvuWorker.startMultyPageDocument(slices, delayInit, grayscale)
    $('#filehref').hide();
    var i = 0;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    $("#procmess").text("Задание выполняется ...");

    var func = () => {
        createImageBitmap(files[i])
            .then((image) => {
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                var imageData = ctx.getImageData(0, 0, image.width, image.height);
                return djvuWorker.addPageToDocument(imageData);
            },
            (e) => {
                $("#procmess").text("Ошибка при загрузке файлов! " + e.message);
            })
            .then(() => {
                if (++i < files.length) {
                    $("#procmess").text("Задание выполняется ... " + Math.round(i / files.length * 100) + ' %');
                    func();
                }
                else {
                    $("#procmess").text("Сборка файла ... ");
                    djvuWorker.endMultyPageDocument()
                        .then((buffer) => {
                            $("#procmess").text("Задание выполненено !!!");
                            $('#filehref').prop('href', DjVuWorker.createArrayBufferURL(buffer)).show(400);
                        });
                }
            });
    }
    func();
}


function createPicDocument(imageArray) {
    var delayInit = 0;
    var slices = +$('input[name=imagequality]:checked').val();
    var grayscale = $('#grayscale').prop('checked') ? 1 : 0;

    djvuWorker.createDocumentFromPictures(imageArray, slices, delayInit, grayscale)
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