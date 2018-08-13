import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Actions from '../actions/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { get } from '../reducers/rootReducer';

class ScaleGizmo extends React.Component {

    constructor(props) {
        super(props);
        this.state = { tempValue: null };
    }

    static propTypes = {
        scale: PropTypes.number.isRequired,
        setUserScale: PropTypes.func.isRequired
    };

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
        return (
            <div
                className="scale_gizmo"
                title="You also can scale the image via Ctrl+MouseWheel"
            >
                <FontAwesomeIcon
                    icon={faMinus}
                    onClick={this.decreaseScale}
                    className="scale_button"
                />
                <input
                    onFocus={this.startEditing}
                    onKeyPress={this.onKeyPress}
                    onBlur={this.finishEditing}
                    className="scale"
                    type="text"
                    value={this.state.tempValue === null ? currentValue + '%' : this.state.tempValue}
                    onChange={this.onChange}
                />
                <FontAwesomeIcon
                    icon={faPlus}
                    onClick={this.increaseScale}
                    className="scale_button"
                />
            </div>
        );
    }
}

export default connect(state => {
    return {
        scale: get.userScale(state),
    };
},
    {
        setUserScale: Actions.setUserScaleAction
    }
)(ScaleGizmo);