import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';

import Actions from '../../actions/actions';
import { get } from '../../reducers/rootReducer';
import FileBlock from '../FileBlock';
import { TranslationContext } from '../Translation';
import styled, { css } from 'styled-components';

const style = css`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const TextButton = styled.button`
    background: inherit;
    color: var(--color);
    border: 1px solid var(--color);
    border-radius: 3px;
    padding: 0.2em;
    cursor: pointer;

    &:hover {
        background: var(--alternative-background-color);
    }

    &:focus {
        outline: none;
    }
`;

class FilePanel extends React.Component {

    static propTypes = {
        fileName: PropTypes.string,
        saveDocument: PropTypes.func.isRequired
    };

    static contextType = TranslationContext;

    render() {
        const t = this.context;

        return (
            <div css={style}>
                {this.props.fileName ? (
                    <span title={t("Close document")}>
                        <FontAwesomeIcon
                            className="control_button"
                            onClick={this.props.closeDocument}
                            icon={faTimesCircle}
                        />
                    </span>
                ) : null}
                <FileBlock fileName={this.props.fileName} />
                {this.props.fileName ? (
                    <TextButton
                        onClick={this.props.saveDocument}
                        title={t("Save document")}
                    >
                        {t('Save')}
                    </TextButton>
                ) : null}
            </div>
        );
    }
}

export default connect(state => ({
    fileName: get.fileName(state),
}), {
    saveDocument: Actions.saveDocumentAction,
    closeDocument: Actions.closeDocumentAction
})(FilePanel);