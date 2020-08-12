import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFileImage } from '@fortawesome/free-regular-svg-icons';

import { get } from '../../reducers/rootReducer';
import Consts from '../../constants/consts';
import { TranslationContext } from '../Translation';

class ViewModeButtons extends React.Component {

    static propTypes = {
        isTextMode: PropTypes.bool.isRequired,
        isContinuousScrollMode: PropTypes.bool.isRequired,
    };

    static contextType = TranslationContext;

    enableContinuousScrollMode = () => {
        this.props.dispatch({ type: Consts.ENABLE_CONTINUOUS_SCROLL_MODE_ACTION });
    };

    enableSinglePageMode = () => {
        this.props.dispatch({ type: Consts.ENABLE_SINGLE_PAGE_MODE_ACTION });
    };

    enableTextMode = () => {
        this.props.dispatch({ type: Consts.ENABLE_TEXT_MODE_ACTION });
    };

    render() {
        const { isContinuousScrollMode, isTextMode, isIndirect } = this.props;
        const t = this.context;
        return (
            <div className="view_mode_group">
                {isIndirect ? null :
                    <span
                        className={`continuous_scroll_button control_button ${isContinuousScrollMode && !isTextMode ? 'active' : ''}`}
                        title={t("Continuous scroll view mode")}
                        onClick={this.enableContinuousScrollMode}
                    >
                        <FontAwesomeIcon icon={faFileImage} />
                        <FontAwesomeIcon icon={faFileImage} />
                    </span>
                }
                <span title={t("Single page view mode")} className={!isTextMode && !isContinuousScrollMode ? 'active' : ''}>
                    <FontAwesomeIcon
                        className="control_button"
                        icon={faFileImage}
                        onClick={this.enableSinglePageMode}
                    />
                </span>
                <span title={t("Text view mode")} className={isTextMode ? 'active' : ''}>
                    <FontAwesomeIcon
                        className="control_button"
                        icon={faFileAlt}
                        onClick={this.enableTextMode}
                    />
                </span>
            </div>
        );
    }
}

export default connect(state => ({
    isTextMode: get.isTextMode(state),
    isContinuousScrollMode: get.isContinuousScrollMode(state),
    isIndirect: get.isIndirect(state),
}))(ViewModeButtons);