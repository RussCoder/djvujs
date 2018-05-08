import React from 'react';
import { connect } from 'react-redux';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/fontawesome-free-solid';

import { get } from '../reducers/rootReducer';

class FileLoadingScreen extends React.Component {

    render() {
        var { loaded, total } = this.props;

        var percentage = 0;
        if (loaded && total) {
            percentage = Math.round(loaded / total * 100);
        }

        return (
            <div className="file_loading_screen">
                <div className="message">
                    <FontAwesomeIcon
                        icon={faSpinner}
                        pulse={true}
                    />
                    <span> Loading...</span>
                </div>
                <div className="bytes" style={(loaded || total) ? null : { visibility: "hidden" }}>
                    {Math.round(loaded / 1024).toLocaleString('ru-RU')} KB {total ? `/ ${Math.round(total / 1024).toLocaleString('ru-RU')} KB` : ''}
                </div>
                <div className="progress_bar" style={total ? null : { visibility: "hidden" }}>
                    <div className="progress" style={{ width: percentage + "%" }} />
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    loaded: get.loadedBytes(state),
    total: get.totalBytes(state)
}))(FileLoadingScreen);