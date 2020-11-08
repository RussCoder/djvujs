import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { get } from '../reducers';
import Consts from '../constants';
import LeftPanel from './LeftPanel/LeftPanel';
import LoadingLayer from './LoadingLayer';
import ImageBlock from './ImageBlock/ImageBlock';
import TextBlock from './TextBlock';

const Root = styled.div`
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    display: flex;
    padding: 0.5em;
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
    const pageError = useSelector(get.pageError);

    const renderMainElement = () => {
        if (pageError) {
            return <ErrorPage pageNumber={pageNumber} error={pageError} />;
        }
        if (viewMode === Consts.TEXT_MODE) {
            return <TextBlock text={pageText} />
        }
        if (viewMode === Consts.CONTINUOUS_SCROLL_MODE || imageData) {
            return <ImageBlock />;
        }
    };

    return (
        <Root>
            <LeftPanel />
            <PageZone>
                {renderMainElement()}
                {(isLoading && viewMode === Consts.SINGLE_PAGE_MODE) ? <LoadingLayer /> : null}
            </PageZone>
        </Root>
    );
}