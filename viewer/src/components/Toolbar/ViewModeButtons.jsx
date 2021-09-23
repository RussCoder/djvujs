import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaRegFileAlt, FaRegFileImage } from "react-icons/all";

import { get } from '../../reducers';
import Constants, { ActionTypes } from '../../constants';
import { TranslationContext } from '../Translation';
import styled from 'styled-components';
import { controlButton } from "../cssMixins";
import { ControlButton } from "../StyledPrimitives";

const ContinuousScrollButton = styled.span`
    ${controlButton};
    display: inline-flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    overflow: hidden;
    max-height: 100%;

    svg {
        flex: 0 0 auto;
    }
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
        this.props.dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: Constants.CONTINUOUS_SCROLL_MODE });
    };

    enableSinglePageMode = () => {
        this.props.dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: Constants.SINGLE_PAGE_MODE });
    };

    enableTextMode = () => {
        this.props.dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: Constants.TEXT_MODE });
    };

    render() {
        const { viewMode, isIndirect } = this.props;
        const t = this.context;

        return (
            <Root data-djvujs-id="view_mode_buttons">
                {isIndirect ? null :
                    <ContinuousScrollButton
                        style={viewMode === Constants.CONTINUOUS_SCROLL_MODE ? { opacity: 1 } : null}
                        title={t("Continuous scroll view mode")}
                        onClick={this.enableContinuousScrollMode}
                    >
                        <FaRegFileImage />
                        <FaRegFileImage />
                    </ContinuousScrollButton>
                }
                <span
                    title={t("Single page view mode")}
                    style={viewMode === Constants.SINGLE_PAGE_MODE ? { opacity: 1 } : null}
                >
                    <ControlButton
                        as={FaRegFileImage}
                        onClick={this.enableSinglePageMode}
                    />
                </span>
                <span
                    title={t("Text view mode")}
                    style={viewMode === Constants.TEXT_MODE ? { opacity: 1 } : null}
                >
                    <ControlButton
                        as={FaRegFileAlt}
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