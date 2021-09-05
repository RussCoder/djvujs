import React from "react";
import styled, { css } from "styled-components";
import CloseButton from "./misc/CloseButton";
import { useDispatch, useSelector } from "react-redux";
import { get } from "../reducers";
import FileBlock from "./FileBlock";
import OptionsButton from "./misc/OptionsButton";
import HelpButton from "./misc/HelpButton";
import { ControlButton } from "./StyledPrimitives";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { ActionTypes } from "../constants";
import { useTranslation } from "./Translation";
import SaveButton from "./misc/SaveButton";
import Actions from "../actions/actions";
import { useAppContext } from "./AppContext";
import ScaleGizmo from "./Toolbar/ScaleGizmo";
import RotationControl from "./Toolbar/RotationControl";
import ViewModeButtons from "./Toolbar/ViewModeButtons";
import CursorModeButtonGroup from "./Toolbar/CursorModeButtonGroup";
import FullPageViewButton from "./misc/FullPageViewButton";
import { IoDesktopOutline } from "react-icons/all";
import { iconButton } from "./cssMixins";

const Root = styled.div`
    font-size: 16px;
    --button-basic-size: 1em;
    position: absolute;
    bottom: calc(100% + var(--app-padding));
    right: 0;
    z-index: 1;
    min-height: min(15em, ${p => p.theme.appHeight * 0.7}px);
    max-height: ${p => p.theme.appHeight * 0.7}px;

    width: fit-content;
    max-width: 90%;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 5px 0 5px 0;
    padding: 0.5em;
    overflow: hidden;

    display: flex;
    flex-direction: column;

    ${p => p.$opened ? 'transform: translateX(0);' : 'transform: translateX(calc(100% + var(--app-padding) * 2));'};

    transition: transform 0.5s;
`;

const MenuWrapper = styled.div`
    display: flex;
    flex-direction: column;

    & > * {
        margin-bottom: 1em;
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5em;
    margin-bottom: 0.5em;
    font-size: 1.5em;

    svg {
        margin-left: auto;
    }

    span {
        margin-right: 1em;
    }
`;

const DocumentWrapper = styled.div`
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 1em;
    padding-bottom: 0.5em;
    padding-left: 0.5em;

    & > div:first-child {
        margin-bottom: 1em;
    }
`;

const documentControlsMobileStyle = css`
    flex-direction: column;
    padding-left: 1em;
    align-items: flex-start;
    border-bottom: 1px dashed var(--border-color);
    margin-bottom: 1em;

    & > * {
        margin-bottom: 0.5em;
    }
`;

const DocumentControls = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-top: 1em;

    ${p => p.theme.isMobile ? documentControlsMobileStyle : ''};
`;

const MenuItemStyle = css`
    cursor: pointer;

    :hover {
        & svg {
            transform: scale(1.1);
        }
    }
`;

const DocumentControl = styled.div`
    ${MenuItemStyle};
    margin-right: 1.5em;
    white-space: nowrap;

    ${ControlButton} {
        margin-left: 0;
    }
`;

const MobileControl = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 1em;

    span:first-child {
        margin-right: 1em;
    }
`;

const Content = styled.div`
    overflow: auto;
`;

const FullscreenButton = styled(IoDesktopOutline)`
    ${iconButton};
    font-size: 1.2em;

    color: ${p => p.$active ? 'var(--highlight-color)' : 'inherit'};
`;

export default ({ isOpened, onClose }) => {
    const dispatch = useDispatch();
    const t = useTranslation();
    const fileName = useSelector(get.fileName);
    const { hideOpenAndCloseButtons, hidePrintButton, hideSaveButton } = useSelector(get.uiOptions);
    const { isMobile, isFullscreen, toggleFullscreen } = useAppContext();

    const closeHandler = onClose;

    return (
        <Root $opened={isOpened} data-djvujs-id="menu">
            <Header>
                <span>{t('Menu')}</span>
                <CloseButton onClick={closeHandler} />
            </Header>

            <Content>
                <DocumentWrapper>
                    <div>{t('Document')}:</div>
                    {hideOpenAndCloseButtons ? fileName ? <span>{fileName}</span> : null :
                        <FileBlock fileName={fileName || ''} />}

                    <DocumentControls>
                        {hidePrintButton ? null :
                            <DocumentControl
                                onClick={() => {
                                    dispatch({ type: ActionTypes.OPEN_PRINT_DIALOG });
                                    closeHandler();
                                }}
                                title={t('Print document')}
                            >
                                <ControlButton icon={faPrint} />
                                <span>{t('Print')}</span>
                            </DocumentControl>}

                        {hideSaveButton ? null : <DocumentControl onClick={closeHandler}>
                            <SaveButton onClick={closeHandler} withLabel={true} />
                        </DocumentControl>}

                        {hideOpenAndCloseButtons ? null :
                            <DocumentControl onClick={() => dispatch(Actions.closeDocumentAction())}>
                                <ControlButton as={CloseButton} css={`font-size: 1em;`} />
                                <span>{t('Close')}</span>
                            </DocumentControl>}
                    </DocumentControls>

                    {isMobile ?
                        <>
                            <MobileControl>
                                <span>{t('View mode')}:</span>
                                <ViewModeButtons />
                            </MobileControl>
                            <MobileControl>
                                <span>{t('Scale')}:</span>
                                <ScaleGizmo />
                            </MobileControl>
                            <MobileControl>
                                <span>{t('Rotation')}:</span>
                                <RotationControl />
                            </MobileControl>
                            <MobileControl>
                                <span>{t('Cursor mode')}:</span>
                                <CursorModeButtonGroup />
                            </MobileControl>
                        </> : null}
                </DocumentWrapper>

                <MenuWrapper>
                    <MobileControl>
                        <span>{t('Full page mode')}:</span>
                        <FullPageViewButton />
                    </MobileControl>
                    {(document.fullscreenEnabled || document.webkitFullscreenEnabled) ? <MobileControl>
                        <span>{t('Fullscreen mode')}:</span>
                        <FullscreenButton
                            $active={isFullscreen}
                            onClick={toggleFullscreen}
                        />
                    </MobileControl> : null}
                    <OptionsButton onClick={closeHandler} withLabel={true} />
                    <HelpButton onClick={closeHandler} withLabel={true} />
                </MenuWrapper>
            </Content>
        </Root>
    );
}