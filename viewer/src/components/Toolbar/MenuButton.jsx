import { FiCommand } from "react-icons/fi";
import React from "react";
import { useDispatch } from "react-redux";
import { ActionTypes } from "../../constants";
import { iconButton } from "../cssMixins";
import styled from "styled-components";

const Root = styled.svg`
    ${iconButton};
    font-size: 2em;
    color: var(--highlight-color);
    margin-left: 1em;
`;

export default () => {
    const dispatch = useDispatch();
    return (
        <Root
            as={FiCommand}
            onClick={() => dispatch({ type: ActionTypes.TOGGLE_MENU })}
        />
    );
}