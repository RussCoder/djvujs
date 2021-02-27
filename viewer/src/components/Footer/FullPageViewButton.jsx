import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

import Actions from '../../actions/actions';
import { get } from '../../reducers';
import { useTranslation } from '../Translation';
import { ControlButton } from '../StyledPrimitives';

const FullPageViewButton = () => {
    const isFullPageView = useSelector(get.isFullPageView);
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <div title={t("Switch full page mode")} data-djvujs-class="full_page_button">
            <ControlButton
                icon={isFullPageView ? faCompress : faExpand}
                onClick={() => dispatch(Actions.toggleFullPageViewAction(!isFullPageView))}
            />
        </div>
    );
};

export default FullPageViewButton;