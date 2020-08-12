import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { get } from '../../reducers/rootReducer';
import { useTranslation } from '../Translation';
import { useSelector } from 'react-redux';

const StatusBar = () => {
    const isContinuousScrollMode = useSelector(get.isContinuousScrollMode);
    const isLoading = useSelector(get.isLoading) && !isContinuousScrollMode;
    const t = useTranslation();

    return (
        <div className="status_bar">
            <FontAwesomeIcon
                icon={isLoading ? faSpinner : faCheck}
                pulse={isLoading ? true : false}
            />
            <span className="message">{isLoading ? t("Loading") + "..." : t("Ready")}</span>
        </div>
    );
};

export default StatusBar;