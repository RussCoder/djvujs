import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';

import Actions from '../actions/actions';

class HelpButton extends React.Component {

    static propTypes = {
        showHelpWindow: PropTypes.func.isRequired
    };

    render() {
        return (
            <span title="Show help window">
                <FontAwesomeIcon
                    className="control_button"
                    icon={faQuestionCircle}
                    onClick={this.props.showHelpWindow}
                />
            </span>
        );
    }
}

export default connect(null, {
    showHelpWindow: Actions.showHelpWindowAction
})(HelpButton);