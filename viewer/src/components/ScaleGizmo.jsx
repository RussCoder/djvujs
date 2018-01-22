import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Consts from '../constants/consts';
import Actions from '../actions/actions';

class ScaleGizmo extends React.Component {

    static propTypes = {
        scale: PropTypes.number.isRequired,
        setUserScale: PropTypes.func.isRequired
    };

    onSliderChange = (e) => {
        const value = +e.target.value / 100;
        this.props.setUserScale(value);
    };

    render() {
        const currentValue = Math.round(this.props.scale * 100);
        return (
            <div className="scale_gizmo">
                <input className="scale"
                    type="range"
                    min="0"
                    max="200"
                    step="1"
                    value={currentValue}
                    onChange={this.onSliderChange}
                />
                <span className="scale_label">{currentValue}</span>%
            </div>
        );
    }
}

export default connect(state => {
    return {
        scale: state.userScale,
    };
},
    {
        setUserScale: Actions.setUserScaleAction
    }
)(ScaleGizmo);