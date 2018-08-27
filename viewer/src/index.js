import DjVu from './DjVu';
import DjVuViewer from './DjVuViewer';

DjVu.Viewer = DjVuViewer;

if (process.env.NODE_ENV !== 'production') {
    window.addEventListener('load', () => {
        window.DjVuViewerInstance.loadDocumentByUrl("/tmp/DjVu3Spec.djvu", { pageRotation: 0 });
        //window.DjVuViewerInstance.loadDocumentByUrl("/tmp/DjVu3Spec.djvu").then(() => window.DjVuViewerInstance.configure({pageRotation: 270}));
    });
}