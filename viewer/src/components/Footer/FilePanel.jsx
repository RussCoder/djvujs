import React from 'react';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';

import Actions from '../../actions/actions';
import { get } from '../../reducers';
import FileBlock from '../FileBlock';
import { css } from 'styled-components';
import { ControlButton, TextButton } from '../StyledPrimitives';
import { useTranslation } from '../Translation';
import { useDispatch, useSelector } from 'react-redux';
import { ActionTypes } from "../../constants";

const style = css`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default () => {
    const t = useTranslation();
    const dispatch = useDispatch();
    const fileName = useSelector(get.fileName);
    const isIndirect = useSelector(get.isIndirect);

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
                    onClick={() => {
                        dispatch(isIndirect ? { type: ActionTypes.OPEN_SAVE_DIALOG } : Actions.saveDocumentAction());
                    }}
                    title={t("Save document")}
                >
                    {t('Save')}
                </TextButton>
            ) : null}
        </div>
    );
}