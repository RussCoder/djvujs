import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaExpand, FaCompress } from "react-icons/fa";

import Actions from '../../actions/actions';
import { get } from '../../reducers';
import { useTranslation } from '../Translation';
import { ControlButton } from "../StyledPrimitives";

const FullPageViewButton = () => {
    const { hideFullPageSwitch } = useSelector(get.uiOptions);
    const isFullPageView = useSelector(get.isFullPageView);
    const dispatch = useDispatch();
    const t = useTranslation();

    if (hideFullPageSwitch) return null;

    return (
        <div title={t("Switch full page mode")} data-djvujs-class="full_page_button">
            <ControlButton
                as={isFullPageView ? FaCompress : FaExpand}
                onClick={() => console.log('toggle Fullscreen clicked') || dispatch(Actions.toggleFullPageViewAction(!isFullPageView))}
            />
        </div>
    );
};

export default FullPageViewButton;