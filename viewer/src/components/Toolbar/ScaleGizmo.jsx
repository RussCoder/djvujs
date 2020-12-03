import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Actions from '../../actions/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { get } from '../../reducers';
import { TranslationContext } from "../Translation";
import styled from 'styled-components';
import { iconButton, styledInput } from '../cssMixins';

const Root = styled.div`
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;

    svg {
        ${iconButton};
        font-size: 1.2em;
    }

    input {
        ${styledInput};
        display: inline-block;
        width: 3em;
        margin: 0.5em;
    }
`;

class ScaleGizmo extends React.Component {

    constructor(props) {
        super(props);
        this.state = { tempValue: null };
    }

    static propTypes = {
        scale: PropTypes.number.isRequired,
        setUserScale: PropTypes.func.isRequired
    };

    static contextType = TranslationContext;

    increaseScale = (e) => {
        e.preventDefault();
        var newScale = Math.floor((Math.round(this.props.scale * 100) + 10) / 10) / 10;
        this.props.setUserScale(newScale);
    };

    decreaseScale = (e) => {
        e.preventDefault();
        var newScale = Math.floor((Math.round(this.props.scale * 100) - 10) / 10) / 10;
        this.props.setUserScale(newScale);
    };

    startEditing = (e) => {
        e.target.select();
    };

    finishEditing = (e) => {
        var res = /\d+/.exec(e.target.value);
        var number = res ? +res[0] : 1;
        var newScale = Math.round(number) / 100;
        this.props.setUserScale(newScale);
        e.target.blur();
        this.setState({ tempValue: null });
    };

    onKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.finishEditing(e);
        }
    };

    onChange = (e) => {
        this.setState({ tempValue: e.target.value })
    };

    render() {
        const currentValue = Math.round(this.props.scale * 100);
        const t = this.context;

        return (
            <Root title={t("You also can scale the page via Ctrl+MouseWheel")}>
                <FontAwesomeIcon
                    icon={faMinus}
                    onClick={this.decreaseScale}
                />
                <input
                    onFocus={this.startEditing}
                    onKeyPress={this.onKeyPress}
                    onBlur={this.finishEditing}
                    type="text"
                    value={this.state.tempValue === null ? currentValue + '%' : this.state.tempValue}
                    onChange={this.onChange}
                />
                <FontAwesomeIcon
                    icon={faPlus}
                    onClick={this.increaseScale}
                />
            </Root>
        );
    }
}

export default connect(state => {
    return {
        scale: get.userScale(state),
    };
}, {
    setUserScale: Actions.setUserScaleAction
})(ScaleGizmo);