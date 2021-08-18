import React from "react";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { iconButton } from "../cssMixins";

export default ({ onClick, className = null }) => {
    return (
        <FontAwesomeIcon
            className={className}
            css={iconButton}
            icon={faTimesCircle}
            onClick={onClick}
            data-djvujs-class="close_button"
        />
    );
};