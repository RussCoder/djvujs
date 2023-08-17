import React from "react";
import { iconButton } from "../cssMixins";
import { FaRegTimesCircle } from "react-icons/fa";

export default ({ onClick, className = null }) => {
    return (
        <FaRegTimesCircle
            className={className}
            css={iconButton}
            onClick={onClick}
            data-djvujs-class="close_button"
        />
    );
};