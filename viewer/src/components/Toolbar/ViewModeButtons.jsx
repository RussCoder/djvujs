import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFileImage } from '@fortawesome/free-regular-svg-icons';

import { get } from '../../reducers';
import Constants from '../../constants';
import { TranslationContext } from '../Translation';
import { ControlButton } from '../StyledPrimitives';
import styled, { css } from 'styled-components';

const continuousScrollButtonStyle = css`
    display: inline-flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    overflow: hidden;
    max-height: 100%;
`;

const Root = styled.span`
    display: inline-flex;
    align-items: center;
    height: calc(var(--button-basic-size) * 1.2);

    span {
        opacity: 0.5;
    }
`;

class ViewModeButtons extends React.Component {

    static propTypes = {
        viewMode: PropTypes.string.isRequired,
        isIndirect: PropTypes.bool.isRequired,
    };

    static contextType = TranslationContext;

    enableContinuousScrollMode = () => {
        this.props.dispatch({ type: Constants.ENABLE_CONTINUOUS_SCROLL_MODE_ACTION });
    };

    enableSinglePageMode = () => {
        this.props.dispatch({ type: Constants.ENABLE_SINGLE_PAGE_MODE_ACTION });
    };

    enableTextMode = () => {
        this.props.dispatch({ type: Constants.ENABLE_TEXT_MODE_ACTION });
    };

    render() {
        const { viewMode, isIndirect } = this.props;
        const t = this.context;

        return (
            <Root data-djvujs-id="view_mode_buttons">
                {isIndirect ? null :
                    <ControlButton
                        as="span"
                        css={continuousScrollButtonStyle}
                        style={viewMode === Constants.CONTINUOUS_SCROLL_MODE ? { opacity: 1 } : null}
                        title={t("Continuous scroll view mode")}
                        onClick={this.enableContinuousScrollMode}
                    >
                        <FontAwesomeIcon icon={faFileImage} />
                        <FontAwesomeIcon icon={faFileImage} />
                    </ControlButton>
                }
                <span
                    title={t("Single page view mode")}
                    style={viewMode === Constants.SINGLE_PAGE_MODE ? { opacity: 1 } : null}
                >
                    <ControlButton
                        icon={faFileImage}
                        onClick={this.enableSinglePageMode}
                    />
                </span>
                <span
                    title={t("Text view mode")}
                    style={viewMode === Constants.TEXT_MODE ? { opacity: 1 } : null}
                >
                    <ControlButton
                        icon={faFileAlt}
                        onClick={this.enableTextMode}
                    />
                </span>
            </Root>
        );
    }
}

export default connect(state => ({
    viewMode: get.viewMode(state),
    isIndirect: get.isIndirect(state),
}))(ViewModeButtons);