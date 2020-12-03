import React from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { get } from '../reducers';
import { useTranslation } from "./Translation";
import styled from 'styled-components';
import ProgressBar from "./ProgressBar";

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
    const t = useTranslation();

    return (
        <Root>
            <div css={`font-size: 3em; margin-bottom: 0.5em`}>
                <FontAwesomeIcon icon={faSpinner} pulse={true} />
                <span> {t("Loading")}...</span>
            </div>
            <div css={`font-size: 1.5em`} style={(loaded || total) ? null : { visibility: "hidden" }}>
                {Math.round(loaded / 1024).toLocaleString('ru-RU')} KB {total ? `/ ${Math.round(total / 1024).toLocaleString('ru-RU')} KB` : ''}
            </div>
            <ProgressBar percentage={percentage} css={total ? null : `visibility: hidden`} />
        </Root>
    );
};

export default FileLoadingScreen;