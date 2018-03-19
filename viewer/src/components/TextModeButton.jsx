import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faFileAlt, faFileImage } from '@fortawesome/fontawesome-free-regular';

import Actions from '../actions/actions';

class TextModeButton extends React.Component {

    static propTypes = {
        isTextMode: PropTypes.bool.isRequired
    };

    onClick = () => {
        this.props.toggleTextMode(!this.props.isTextMode);
    };

    render() {
        return (
            <div title={this.props.isTextMode ? "Show image" : "Show pure text"}>
                <FontAwesomeIcon
                    className="control_button"
                    icon={this.props.isTextMode ? faFileImage : faFileAlt}
                    onClick={this.onClick}
                />
            </div>
        );
    }
}

export default connect(state => ({
    isTextMode: state.isTextMode
}), {
        toggleTextMode: Actions.toggleTextModeAction
    })(TextModeButton);