import { createGetObjectByState } from '../utils';
import Consts from '../constants/consts';

const DjVu = window.DjVu;

const initialState = Object.freeze({
    djvuWorker: new DjVu.Worker(),
    fileName: null,
    userScale: 1,
    isLoading: false,
    isTextMode: false,
    pagesCount: null,
    isFullPageView: false,
    errorHeader: null,
    contents: null,
    errorMessage: null,
    isHelpWindowShown: false,
});

export default (state = initialState, action) => {
    switch (action.type) {

        case Consts.SHOW_HELP_WINDOW_ACTION:
            return {
                ...state,
                isHelpWindowShown: true
            }

        case Consts.CLOSE_HELP_WINDOW_ACTION:
            return {
                ...state,
                isHelpWindowShown: false
            }

        case Consts.SET_NEW_PAGE_NUMBER_ACTION:
        case Consts.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION:
            return {
                ...state,
                isLoading: true
            }

        case Consts.IMAGE_DATA_RECEIVED_ACTION:
            return {
                ...state,
                isLoading: false,
            };

        case Consts.DOCUMENT_CREATED_ACTION:
            return {
                ...initialState,
                isLoading: true,
                isFullPageView: state.isFullPageView,
                pagesCount: action.pagesCount,
                fileName: action.fileName
            };

        case Consts.CONTENTS_IS_GOTTEN_ACTION:
            return {
                ...state,
                contents: action.contents
            };

        case Consts.SET_USER_SCALE_ACTION:
            return {
                ...state,
                userScale: action.scale
            }

        case Consts.TOGGLE_FULL_PAGE_VIEW_ACTION:
            return {
                ...state,
                isFullPageView: action.isFullPageView
            }

        case Consts.TOGGLE_TEXT_MODE_ACTION:
            return {
                ...state,
                isTextMode: action.isTextMode
            }

        case Consts.ERROR_ACTION:
            return {
                ...state,
                isLoading: false,
                errorHeader: action.errorHeader,
                errorMessage: action.errorMessage,
            }

        case Consts.CLOSE_MODAL_WINDOW_ACTION:
            return {
                ...state,
                errorHeader: null,
                errorMessage: null,
            }

        default:
            return state;
    }
}

export const get = {
    ...createGetObjectByState(initialState),
    isDocumentLoaded: state => !!state.fileName
};