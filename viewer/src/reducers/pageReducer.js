import { createSelector } from 'reselect';
import Constants from '../constants';
import { ActionTypes } from '../constants/index';

const singlePageInitialState = Object.freeze({
    imageData: null,
    imageDpi: null,
    pageText: null,
    textZones: null,
    imagePageError: null,
    textPageError: null,
});

const initialState = Object.freeze({
    ...singlePageInitialState,
    cursorMode: Constants.GRAB_CURSOR_MODE,
    currentPageNumber: 1,
    shouldScrollToPage: false,
    pageList: [],
    pageSizeList: [],
});

export default function pageReducer(state = initialState, action) {
    const payload = action.payload;
    switch (action.type) {
        case Constants.DROP_PAGE_ACTION: {
            const newPagesList = [...state.pageList];
            const index = action.pageNumber - 1;
            if (newPagesList[index]) { // some pages (loaded as "last pages" of the previous saga) can not be in the state, but only in the registry in the saga class
                newPagesList[index] = {
                    width: newPagesList[index].width,
                    height: newPagesList[index].height,
                    dpi: newPagesList[index].dpi,
                };
            }
            return { ...state, pageList: newPagesList };
        }

        case Constants.DROP_ALL_PAGES_ACTION:
            return {
                ...state,
                pageList: [...state.pageSizeList],
            }

        case Constants.PAGES_SIZES_ARE_GOTTEN:
            return {
                ...state,
                isLoading: false,
                pageSizeList: action.sizes,
                pageList: action.sizes,
            };

        case Constants.PAGE_IS_LOADED_ACTION:
            const page = state.pageList[action.pageNumber - 1];
            if (page && page.url) { // if it has been already loaded we should avoid unnecessary updates
                return state;
            }
            const newPagesList = [...state.pageList];
            newPagesList[action.pageNumber - 1] = action.pageData;
            return {
                ...state,
                pageList: newPagesList
            };

        case Constants.SET_CURSOR_MODE_ACTION:
            return {
                ...state,
                cursorMode: action.cursorMode
            };

        case Constants.IMAGE_DATA_RECEIVED_ACTION:
            return {
                ...state,
                imageData: action.imageData,
                imageDpi: action.imageDpi
            };

        case Constants.SET_NEW_PAGE_NUMBER_ACTION:
            return {
                ...state,
                ...((state.textPageError || state.imagePageError) ? singlePageInitialState : null),
                shouldScrollToPage: action.shouldScrollToPage,
                currentPageNumber: action.pageNumber
            };

        case Constants.PAGE_TEXT_FETCHED_ACTION:
            return {
                ...state,
                pageText: action.pageText,
                textZones: action.textZones
            };

        case ActionTypes.SET_IMAGE_PAGE_ERROR:
            return { ...state, imagePageError: payload };

        case ActionTypes.SET_TEXT_PAGE_ERROR:
            return { ...state, textPageError: payload };

        default:
            return state;
    }
}

/** @returns {function} */
const $ = selector => createSelector(state => state.pageState, selector);

export const get = {
    cursorMode: $(s => s.cursorMode),
    pageText: $(s => s.pageText),
    imageData: $(s => s.imageData),
    imageDpi: $(s => s.imageDpi),
    textZones: $(s => s.textZones),
    currentPageNumber: $(s => s.currentPageNumber),
    shouldScrollToPage: $(s => s.shouldScrollToPage),
    imagePageError: $(s => s.imagePageError),
    textPageError: $(s => s.textPageError),
    pageList: $(s => s.pageList),
    pageSizeList: $(s => s.pageSizeList),
};