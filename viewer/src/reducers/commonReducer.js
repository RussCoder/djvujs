import { createGetObjectByState } from '../utils';
import Consts from '../constants/consts';

const initialState = Object.freeze({
    fileName: null,
    userScale: 1,
    pageRotation: 0,
    isLoading: false,
    isTextMode: false,
    pagesQuantity: null,
    isFullPageView: false,
    errorHeader: null,
    contents: null,
    errorMessage: null,
    isHelpWindowShown: false,
    isContinuousScrollMode: false,
    isIndirect: false,
    options: {
        interceptHttpRequests: false,
    },
});

export default (state = initialState, action) => {
    const payload = action.payload;
    switch (action.type) {

        case Consts.OPTIONS_UPDATED_ACTION:
            return { ...state, options: payload };

        case Consts.ENABLE_CONTINUOUS_SCROLL_MODE_ACTION:
            return { ...state, isContinuousScrollMode: true, isTextMode: false };

        case Consts.ENABLE_SINGLE_PAGE_MODE_ACTION:
            return { ...state, isContinuousScrollMode: false, isTextMode: false };

        case Consts.ENABLE_TEXT_MODE_ACTION:
            return { ...state, isContinuousScrollMode: false, isTextMode: true };

        case Consts.PAGES_SIZES_ARE_GOTTEN:
            return {
                ...state,
                isLoading: false,
            };

        case Consts.SET_PAGE_ROTATION_ACTION:
            return {
                ...state,
                pageRotation: action.pageRotation
            };

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
        case Consts.PAGE_ERROR_ACTION:
            return {
                ...state,
                isLoading: false,
            };

        case Consts.DOCUMENT_CREATED_ACTION:
            return {
                ...initialState,
                isLoading: true,
                isFullPageView: state.isFullPageView,
                isContinuousScrollMode: state.isContinuousScrollMode,
                pagesQuantity: action.pagesQuantity,
                fileName: action.fileName,
                isIndirect: action.isIndirect,
                options: state.options,
            };

        case Consts.CLOSE_DOCUMENT_ACTION:
            return {
                ...initialState,
                isFullPageView: state.isFullPageView,
                options: state.options,
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