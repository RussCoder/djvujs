import React from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { get } from '../reducers/rootReducer';
import { useTranslation } from "./Translation";

const FileLoadingScreen = () => {
    const loaded = useSelector(get.loadedBytes);
    const total = useSelector(get.totalBytes);
    const percentage = (loaded && total) ? Math.round(loaded / total * 100) : 0;
    const t = useTranslation();

    return (
        <div className="file_loading_screen">
            <div className="message">
                <FontAwesomeIcon icon={faSpinner} pulse={true} />
                <span> {t("Loading")}...</span>
            </div>
            <div className="bytes" style={(loaded || total) ? null : { visibility: "hidden" }}>
                {Math.round(loaded / 1024).toLocaleString('ru-RU')} KB {total ? `/ ${Math.round(total / 1024).toLocaleString('ru-RU')} KB` : ''}
            </div>
            <div className="progress_bar" style={total ? null : { visibility: "hidden" }}>
                <div className="progress" style={{ width: percentage + "%" }} />
            </div>
        </div>
    );
};

export default FileLoadingScreen;