import React from 'react';

import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { ActionTypes } from '../../constants';

const LinkBlockRoot = styled.form`
    max-width: 20em;
    display: flex;
    justify-content: center;
    margin: 1em auto;

    input {
        flex: 1 1 auto;
        height: 2em;
        font-style: italic;
        border: 1px solid;
    }

    button {
        margin-left: 1em;
        border-radius: 0.5em;
        background: none;
        border: 1px solid;
        cursor: pointer;

        &:hover {
            background: lightgray;
        }
    }
`;

const LinkBlock = () => {
    const [url, setUrl] = React.useState('');
    const dispatch = useDispatch();

    return (
        <LinkBlockRoot onSubmit={(e) => {
            e.preventDefault();
            if (url) {
                dispatch({
                    type: ActionTypes.LOAD_DOCUMENT_BY_URL,
                    url: url,
                });
            } else {
                alert('Enter a valid URL to a djvu into the field');
            }
        }}>
            <input
                value={url}
                placeholder="Paste a URL to a djvu file here"
                onChange={e => setUrl(e.target.value)}
            />
            <button type="submit">Open URL</button>
        </LinkBlockRoot>
    );
}

export default LinkBlock;