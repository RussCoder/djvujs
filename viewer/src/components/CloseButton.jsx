import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import React from "react";
import { css } from "styled-components";
import { iconButton } from "./cssMixins";

const closeButtonStyle = css`
    ${iconButton};
    font-size: 24px;
    display: block;
    padding-right: 2px;
    margin-left: auto;
`;

export default ({ onClick, className = null }) => {
    return (
        <FontAwesomeIcon
            className={className}
            css={closeButtonStyle}
            icon={faTimesCircle}
            onClick={onClick}
            data-djvujs-class="close_button"
        />
    );
};