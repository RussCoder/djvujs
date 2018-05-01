import Actions from './actions/actions';

export default function initHotkeys(store) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 's' && e.ctrlKey) {
            e.preventDefault();
            store.dispatch(Actions.saveDocumentAction());
            return;
        }

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            store.dispatch(Actions.goToNextPageAction());
            return;
        }

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            store.dispatch(Actions.goToPreviousPageAction());
            return;
        }
    });
}