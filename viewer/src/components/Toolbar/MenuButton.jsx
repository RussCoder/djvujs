import { FiCommand } from "react-icons/fi";
import React from "react";
import { iconButton } from "../cssMixins";
import styled from "styled-components";

const Root = styled(FiCommand)`
    ${iconButton};
    font-size: 2em;
    color: var(--highlight-color);
    margin-left: ${p => p.theme.isMobile || console.log('theme', p.theme) ? 0 : '1em'};
`;

export default ({ onClick }) => {
    return (
        <Root onClick={onClick} data-djvujs-id="menu_button" />
    );
}