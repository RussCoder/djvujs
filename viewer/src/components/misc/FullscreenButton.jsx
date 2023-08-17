import React from "react";
import styled from "styled-components";
import { IoDesktopOutline } from "react-icons/io5";
import { iconButton } from "../cssMixins";
import { useAppContext } from "../AppContext";
import { useTranslation } from "../Translation";

const FullscreenButton = styled(IoDesktopOutline)`
    ${iconButton};
    font-size: 1.1em;

    color: ${p => p.$active ? 'var(--highlight-color)' : 'inherit'};
`;

export default ({ className = null }) => {
    const { isFullscreen, toggleFullscreen } = useAppContext();
    const t = useTranslation();

    return (
        <FullscreenButton
            className={className}
            data-djvujs-class="fullscreen_button"
            title={t('Fullscreen mode')}
            $active={isFullscreen}
            onClick={toggleFullscreen}
        />
    );
};