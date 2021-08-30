import { IoListCircleSharp, IoListCircleOutline } from "react-icons/io5";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionTypes } from "../../constants";
import { iconButton } from "../cssMixins";
import { get } from "../../reducers";
import styled from "styled-components";

const Root = styled.svg`
    ${iconButton};
    font-size: 2em;
    flex: 0 0 auto;
`;

export default () => {
    const dispatch = useDispatch();
    const isOpened = useSelector(get.isContentsOpened);

    return (
        <Root
            as={isOpened ? IoListCircleSharp : IoListCircleOutline}
            onClick={() => dispatch({ type: ActionTypes.TOGGLE_CONTENTS })}
            data-djvujs-id="contents_button"
        />
    );
}