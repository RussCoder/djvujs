import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Actions from '../actions/actions';
import { get } from '../reducers/rootReducer';
import FileBlock from './FileBlock';

class FilePanel extends React.Component {

    static propTypes = {
        fileName: PropTypes.string,
        saveDocument: PropTypes.func.isRequired
    };

    render() {
        return (
            <div className="file_panel">
                <FileBlock fileName={this.props.fileName} />
                {this.props.fileName ? (
                    <button
                        className="text_button"
                        onClick={this.props.saveDocument}
                        title="Save document"
                    >
                        Save
                    </button>
                ) : null}
            </div>
        );
    }
}

export default connect(state => ({
    fileName: get.fileName(state),
}), {
        saveDocument: Actions.saveDocumentAction
    })(FilePanel);