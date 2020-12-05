import Actions from './actions/actions';
import { ActionTypes } from './constants/index';
import { get } from './reducers';

export default function initHotkeys(store) {
    document.addEventListener('keydown', (e) => {
        if ((e.key === 's' || e.code === 'KeyS') && e.ctrlKey) { // code property isn't supported in Edge yet 
            e.preventDefault();
            store.dispatch(Actions.tryToSaveDocument());
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

        if (e.code === 'KeyT' && e.altKey) {
            e.preventDefault();
            const { theme } = get.options(store.getState());
            store.dispatch({ type: ActionTypes.UPDATE_OPTIONS, payload: { theme: theme === 'light' ? 'dark' : 'light' } });
            return;
        }
    });
}