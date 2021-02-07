import React from 'react';

import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { ActionTypes } from '../../constants';
import { useTranslation } from "../Translation";
import { styledInput } from '../cssMixins';

const LinkBlockRoot = styled.form`
    max-width: 20em;
    display: flex;
    justify-content: center;
    margin: 1em auto;

    input {
        ${styledInput};
        flex: 1 1 auto;
        height: 2em;
        font-style: italic;
    }

    button {
        color: var(--color);
        margin-left: 1em;
        border-radius: 0.5em;
        background: none;
        border: 1px solid var(--border-color);
        cursor: pointer;

        &:hover {
            background: var(--alternative-background-color);
        }
    }
`;

const LinkBlock = () => {
    const [url, setUrl] = React.useState('');
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <LinkBlockRoot onSubmit={(e) => {
            e.preventDefault();
            if (/^https?:\/\/.+/.test(url.trim())) {
                dispatch({
                    type: ActionTypes.LOAD_DOCUMENT_BY_URL,
                    url: url,
                });
            } else {
                alert(t('Enter a valid URL (it should start with "http(s)://")'));
            }
        }}>
            <input
                value={url}
                placeholder={t("Paste a URL to a djvu file here")}
                onChange={e => setUrl(e.target.value)}
            />
            <button type="submit">{t("Open URL")}</button>
        </LinkBlockRoot>
    );
};

export default LinkBlock;