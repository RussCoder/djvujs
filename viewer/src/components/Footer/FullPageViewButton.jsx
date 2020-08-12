import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

import Actions from '../../actions/actions';
import { get } from '../../reducers/rootReducer';
import { useTranslation } from '../Translation';

const FullPageViewButton = () => {
    const isFullPageView = useSelector(get.isFullPageView);
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <div title={t("Switch full page mode")}>
            <FontAwesomeIcon
                className="control_button"
                icon={isFullPageView ? faCompress : faExpand}
                onClick={() => dispatch(Actions.toggleFullPageViewAction(!isFullPageView))}
            />
        </div>
    );
};

export default FullPageViewButton;