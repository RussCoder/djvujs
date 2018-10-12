import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default () => (
    <div className="loading_placeholder">
        <FontAwesomeIcon
            icon={faSpinner}
            pulse={true}
        />
        <span className="message">Loading...</span>
    </div>
);