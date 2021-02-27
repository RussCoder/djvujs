import DjVu from './DjVu';
import DjVuViewer from './DjVuViewer';

DjVu.Viewer = DjVuViewer;

if (process.env.NODE_ENV !== 'production') {
    window.addEventListener('load', () => {
        if (new URLSearchParams(location.search).get('tests')) return; // do nothing in case of end-to-end tests

        window.viewer = window.DjVuViewerInstance = new window.DjVu.Viewer({
            uiOptions: {
                // showContentsAutomatically: false,
                // changePageOnScroll: false,
                // onSaveNotification: {
                //     text: "Doing this you agree with something else",
                //     yesButton: "Maybe",
                //     noButton: "Never!",
                // }
            }
        });
        window.DjVuViewerInstance.render(document.getElementById('root'));

        //window.DjVuViewerInstance.loadDocumentByUrl("/DjVu3Spec.djvu#page=10");
        window.DjVuViewerInstance.loadDocumentByUrl("/DjVu3Spec_indirect/index.djvu");

        //window.DjVuViewerInstance.loadDocumentByUrl("/czech_indirect/index.djvu", { pageRotation: 0, djvuOptions: {baseUrl: '/czech_indirect/'} });
        //window.DjVuViewerInstance.loadDocumentByUrl("/tmp/DjVu3Spec.djvu").then(() => window.DjVuViewerInstance.configure({pageRotation: 270}));

        // Tests for file names from Content-Disposition header
        //window.DjVuViewerInstance.loadDocumentByUrl("/djvufile?fname=%E5%9C%B0%E5%9B%BE.djvu");
        //window.DjVuViewerInstance.loadDocumentByUrl("/djvufile?fname=%E5%9C%B0%E5%9B%BE.djvu&cd=attachment");

        //window.DjVuViewerInstance.loadDocumentByUrl("http://localhost/djvuMap/obs-thats-an-error");
    });
}