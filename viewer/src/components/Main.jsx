import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { get } from '../reducers';
import Constants from '../constants';
import LeftPanel from './LeftPanel/LeftPanel';
import LoadingLayer from './LoadingLayer';
import ImageBlock from './ImageBlock/ImageBlock';
import TextBlock from './TextBlock';
import ErrorPage from './ErrorPage';
import Menu from "./Menu";

const Root = styled.div`
    position: relative;
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    display: flex;
    box-sizing: border-box;
    overflow: hidden;
`;

const PageZone = styled.div`
    flex: 1 1 auto;
    overflow: hidden;
    position: relative;
    padding: 0.5em;  
`;

export default () => {
    const viewMode = useSelector(get.viewMode);
    const pageNumber = useSelector(get.currentPageNumber);
    const isLoading = useSelector(get.isLoading);
    const pageText = useSelector(get.pageText);
    const imageData = useSelector(get.imageData);
    const imagePageError = useSelector(get.imagePageError);
    const textPageError = useSelector(get.textPageError);

    const renderMainElement = () => {
        if (imagePageError && viewMode === Constants.SINGLE_PAGE_MODE) {
            return <ErrorPage pageNumber={pageNumber} error={imagePageError} />;
        }
        if (viewMode === Constants.TEXT_MODE) {
            if (textPageError) {
                return <ErrorPage pageNumber={pageNumber} error={textPageError} />;
            }
            return <TextBlock text={pageText} />
        }
        if (viewMode === Constants.CONTINUOUS_SCROLL_MODE || imageData) {
            return <ImageBlock />;
        }
    };

    return (
        <Root>
            <LeftPanel />
            <PageZone>
                {renderMainElement()}
                {(isLoading && viewMode === Constants.SINGLE_PAGE_MODE) ? <LoadingLayer /> : null}
            </PageZone>
            <Menu />
        </Root>
    );
}