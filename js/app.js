'use strict';

var djvuWorker = new DjVuWorker();

$('#sitename').click(reset);
$('#slicefunc').click(sliceFuncPrepare);


function reset() {
    $('#funcblock').hide(400);
    $('#funcmenublock').show(400);
}

function sliceFuncPrepare() {
    $('#funcmenublock').hide(400);
    $('#funcblock').show(400);
    $('#sliceblock').show(400);
    $("#finput").off('change').change(function () {
        $('#filehref').hide();
        if (this.files.length) {
            if(this.files[0].name.substr(-5) !== '.djvu') {
                $('#warnmess').text("Файл не является .djvu !!!");
                return;
            }
            $('#slicebut').off('off').click(sliceFunc).prop('disabled', false);;
        }
        else {
            $('#slicebut').prop('disabled', true);
        }
    });
}

function sliceFunc() {
    var from = +$("#firstnum").val() - 1;
    var to = +$("#secondnum").val() - 1;
    var fr = new FileReader();
    fr.readAsArrayBuffer($("#finput")[0].files[0]);
    fr.onload = () => {
        var buf = fr.result;
        djvuWorker.createDocument(buf)
            .then(() => {
                return djvuWorker.slice(from, to);
            })
            .then((buffer) => {
                $('#filehref').prop('href', DjVuWorker.createArrayBufferURL(buffer))
                    .show(400);

            });
    }

}