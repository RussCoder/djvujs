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
    continuousMode: true,
    pagesList: [],
});

export default (state = initialState, action) => {
    switch (action.type) {

        case Consts.DROP_PAGE_ACTION: {
            const newPagesList = [...state.pagesList];
            const index = action.pageNumber - 1;
            if (newPagesList[index]) { // some pages (loaded as "last pages" of the previous saga) can not be in the state, but only in the registry in the saga class
                newPagesList[index] = {
                    width: newPagesList[index].width,
                    height: newPagesList[index].height,
                    dpi: newPagesList[index].dpi,
                };
            }
            return { ...state, pagesList: newPagesList };
        }

        case Consts.PAGES_SIZES_ARE_GOTTEN:
            return {
                ...state,
                isLoading: false,
                pagesList: action.sizes,
            };

        case Consts.PAGE_IS_LOADED_ACTION:
            if (state.pagesList[action.pageNumber - 1].url) { // if it has been already loaded we should avoid unnecessary updates
                return state;
            }
            const newPagesList = [...state.pagesList];
            newPagesList[action.pageNumber - 1] = action.pageData;
            return {
                ...state,
                pagesList: newPagesList
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
                pagesQuantity: action.pagesQuantity,
                fileName: action.fileName
            };

        case Consts.CLOSE_DOCUMENT_ACTION:
            return {
                ...initialState,
                isFullPageView: state.isFullPageView
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