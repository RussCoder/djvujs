import React from 'react';
import { useSelector } from 'react-redux';

import { get } from '../reducers';
import styled from 'styled-components';
import ProgressBar from "./misc/ProgressBar";
import LoadingPhrase from "./misc/LoadingPhrase";

const Root = styled.div`
    flex-direction: column;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
`;

const FileLoadingScreen = () => {
    const loaded = useSelector(get.loadedBytes);
    const total = useSelector(get.totalBytes);
    const percentage = (loaded && total) ? Math.round(loaded / total * 100) : 0;

    return (
        <Root>
            <LoadingPhrase css={`font-size: 3em; margin-bottom: 0.5em`} />
            <div css={`font-size: 1.5em`} style={(loaded || total) ? null : { visibility: "hidden" }}>
                {Math.round(loaded / 1024).toLocaleString('ru-RU')} KB {total ? `/ ${Math.round(total / 1024).toLocaleString('ru-RU')} KB` : ''}
            </div>
            <ProgressBar percentage={percentage} css={total ? null : `visibility: hidden`} />
        </Root>
    );
};

export default FileLoadingScreen;