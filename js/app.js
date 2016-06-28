'use strict';

var djvuWorker = new DjVuWorker();

$('#sitename').click(reset);
$('#slicefunc').click(sliceFuncPrepare);


function reset() {
    $('.funcblock').hide(400);
    $('#funcmenublock').show(400);
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