import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner } from '@fortawesome/fontawesome-free-solid';
import { get } from '../reducers/rootReducer';

class StatusBar extends React.Component {

    static propTypes = {
        isLoading: PropTypes.bool.isRequired
    };

    onClick = () => {
        this.props.toggleTextMode(!this.props.isTextMode);
    };

    render() {
        return (
            <div className="status_bar">
                <FontAwesomeIcon
                    className="control_button"
                    icon={this.props.isLoading ? faSpinner : faCheck}
                    pulse={this.props.isLoading ? true : false}
                    onClick={this.onClick}
                />
                <span className="message">{this.props.isLoading ? "Loading..." : "Ready"}</span>
            </div>
        );
    }
}

export default connect(state => ({
    isLoading: get.isLoading(state)
}))(StatusBar);