import './css/styles.css';
import DjVu from './DjVu';
import DjVuViewer from './DjVuViewer';

DjVu.Viewer = DjVuViewer;

if (process.env.NODE_ENV !== 'production') {
    window.addEventListener('load', () => {
        window.DjVuViewerInstance.loadDocumentByUrl("/DjVu3Spec.djvu#page=10");
        
        //window.DjVuViewerInstance.loadDocumentByUrl("/tmp/czech_indirect/index.djvu", { pageRotation: 0, djvuOptions: {baseUrl: '/tmp/czech_indirect/'} });
        //window.DjVuViewerInstance.loadDocumentByUrl("/tmp/DjVu3Spec.djvu").then(() => window.DjVuViewerInstance.configure({pageRotation: 270}));

        // Tests for file names from Content-Disposition header
        //window.DjVuViewerInstance.loadDocumentByUrl("/djvufile?fname=%E5%9C%B0%E5%9B%BE.djvu");
        //window.DjVuViewerInstance.loadDocumentByUrl("/djvufile?fname=%E5%9C%B0%E5%9B%BE.djvu&cd=attachment");

        //window.DjVuViewerInstance.loadDocumentByUrl("http://localhost/djvuMap/obs-thats-an-error");
    });
}