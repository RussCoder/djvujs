import React from 'react';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';

import Actions from '../../actions/actions';
import { get } from '../../reducers/rootReducer';
import FileBlock from '../FileBlock';
import styled, { css } from 'styled-components';
import { ControlButton } from '../StyledPrimitives';
import { useTranslation } from '../Translation';
import { useDispatch, useSelector } from 'react-redux';

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

export default () => {
    const t = useTranslation();
    const dispatch = useDispatch();
    const fileName = useSelector(get.fileName);

    return (
        <div css={style}>
            {fileName ? (
                <span title={t("Close document")}>
                    <ControlButton
                        onClick={() => dispatch(Actions.closeDocumentAction())}
                        icon={faTimesCircle}
                    />
                </span>
            ) : null}
            <FileBlock fileName={fileName} />
            {fileName ? (
                <TextButton
                    onClick={() => dispatch(Actions.saveDocumentAction())}
                    title={t("Save document")}
                >
                    {t('Save')}
                </TextButton>
            ) : null}
        </div>
    );
}