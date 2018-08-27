import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';

import Actions from '../actions/actions';
import { get } from '../reducers/rootReducer';

class RotationControl extends React.Component {
    static propTypes = {
        rotation: PropTypes.number.isRequired
    };

    rotateLeft = () => {
        this.props.dispatch(Actions.setPageRotationAction(this.props.rotation ? this.props.rotation - 90 : 270));
    }

    rotateRight = () => {
        this.props.dispatch(Actions.setPageRotationAction(this.props.rotation === 270 ? 0 : this.props.rotation + 90));
    }

    render() {
        return (
            <div className="rotation_control" title="Rotate the page">
                <FontAwesomeIcon icon={faUndo} className="rotate_left_button" onClick={this.rotateLeft} />
                <span className="rotation_value">{this.props.rotation}&deg;</span>
                <FontAwesomeIcon icon={faUndo} className="rotate_right_button" onClick={this.rotateRight} />
            </div>
        );
    }
}

export default connect(state => ({
    rotation: get.pageRotation(state)
}))(RotationControl);