import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Consts from '../constants/consts';
import Actions from '../actions/actions';

class FileBlock extends React.Component {

    static propTypes = {
        createNewDocument: PropTypes.func.isRequired
    };

    onChange = (e) => {
        if (!e.target.files.length) {
            return;
        }
        const file = e.target.files[0];
        if (file.name.substr(-5) !== '.djvu') {
            alert("Non DjVu file was submitted!");
            e.target.value = '';
            return;
        }

        var fr = new FileReader();
        fr.readAsArrayBuffer(file);
        fr.onload = () => {
            this.props.createNewDocument(fr.result);
        }
    };

    render() {
        return (
            <input type="file" onChange={this.onChange} />
        );
    }
}

export default connect(null,
    {
        createNewDocument: Actions.createDocumentFromArrayBufferAction
    }
)(FileBlock);