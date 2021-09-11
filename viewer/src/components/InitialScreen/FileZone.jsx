import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaUpload } from "react-icons/all";
import { TranslationContext } from '../Translation';
import Actions from '../../actions/actions';
import styled, { css, keyframes } from 'styled-components';

const FileIcon = styled(FaUpload)`
    font-size: 1.5em;
`;

const shake = keyframes`
    from {transform: rotateY(0deg)}
    25% {transform: rotateY(5deg)}
    75% {transform: rotateY(-5deg)}
    to {transform: rotateY(0deg)}
`;

const dragOverStyle = css`
    animation: ${shake} 1s infinite linear;
    opacity: 0.8;
    border-color: var(--highlight-color);
`;

const Root = styled.div`
    border: 0.1em dashed var(--border-color);
    background: var(--alternative-background-color);
    padding: 0.5em;
    max-width: 20em;
    min-height: 5em;
    margin: auto;
    border-radius: 0.5em;
    cursor: pointer;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &:hover {
        ${FileIcon} {
            transform: scale(1.1);
        }
    }

    ${p => p.$dragOver ? dragOverStyle : ''};
`;

class FileZone extends React.Component {

    static propTypes = {
        createNewDocument: PropTypes.func.isRequired
    };

    static contextType = TranslationContext;

    state = {
        isDragOver: false
    };

    onChange = (e) => {
        if (!e.target.files.length) {
            return;
        }
        this.processFile(e.target.files[0]);
    };

    processFile(file) {
        var fr = new FileReader();
        fr.readAsArrayBuffer(file);
        fr.onload = () => {
            this.props.createNewDocument(fr.result, file.name);
        }
    }

    onClick = (e) => {
        this.input && this.input.click();
    };

    checkDrag = (e) => {
        if (e.dataTransfer.items.length === 1 && e.dataTransfer.items[0].kind === 'file') {
            e.preventDefault();
            this.setState({ isDragOver: true })
        }
    };

    onDragLeave = (e) => {
        this.setState({ isDragOver: false });
    };

    onDrop = (e) => {
        this.setState({ isDragOver: false });
        if (e.dataTransfer.items[0].kind === 'file') {
            e.preventDefault();
            this.processFile(e.dataTransfer.items[0].getAsFile());
        }
    };

    render() {
        const t = this.context;

        return (
            <Root
                $dragOver={this.state.isDragOver}
                onClick={this.onClick}
                title={t("Open another .djvu file")}
                onDragEnter={this.checkDrag}
                onDragOver={this.checkDrag}
                onDragLeave={this.onDragLeave}
                onDrop={this.onDrop}
            >
                <FileIcon />
                <span>{t('Drag & Drop a file here or click to choose manually')}</span>
                <input
                    style={{ display: 'none' }}
                    type="file"
                    onChange={this.onChange}
                    accept=".djvu, .djv"
                    ref={node => this.input = node}
                />
            </Root>
        );
    }
}

export default connect(null,
    {
        createNewDocument: Actions.createDocumentFromArrayBufferAction,
    }
)(FileZone);