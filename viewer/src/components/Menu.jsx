import React from "react";
import styled, { css } from "styled-components";
import CloseButton from "./misc/CloseButton";
import { useDispatch, useSelector } from "react-redux";
import { get } from "../reducers";
import FileBlock from "./FileBlock";
import OptionsButton from "./Footer/OptionsButton";
import HelpButton from "./Footer/HelpButton";
import { ControlButton } from "./StyledPrimitives";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { ActionTypes } from "../constants";
import { useTranslation } from "./Translation";
import SaveButton from "./misc/SaveButton";
import Actions from "../actions/actions";

const Root = styled.div`
    font-size: 16px;
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 1;
    height: 15em;
    width: 15em;

    min-width: max-content;
    max-width: 90%;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 5px 0 5px 0;
    padding: 0.5em;

    ${p => p.$opened ? 'transform: translateX(0);' : 'transform: translateX(calc(100% + var(--app-padding)));'};

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

const DocumentControls = styled.div`
    display: flex;
    align-items: center;
    margin-top: 1em;
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

    ${ControlButton} {
        margin-left: 0;
    }
`;

export default () => {
    const isOpened = useSelector(get.isMenuOpened);
    const dispatch = useDispatch();
    const t = useTranslation();
    const documentName = useSelector(get.fileName);
    const { hideOpenAndCloseButtons, hidePrintButton, hideSaveButton } = useSelector(get.uiOptions);

    const closeHandler = () => dispatch({ type: ActionTypes.CLOSE_MENU });

    return (
        <Root $opened={isOpened}>
            <Header>
                <span>Menu</span>
                <CloseButton onClick={closeHandler} />
            </Header>

            <DocumentWrapper>
                <div>Document:</div>
                <FileBlock fileName={documentName} />

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
                            <span>Print</span>
                        </DocumentControl>}

                    {hideSaveButton ? null : <DocumentControl onClick={closeHandler}>
                        <SaveButton onClick={closeHandler} withLabel={true} />
                    </DocumentControl>}

                    {hideOpenAndCloseButtons ? null :
                        <DocumentControl onClick={() => dispatch(Actions.closeDocumentAction())}>
                            <ControlButton as={CloseButton} css={`font-size: 1em;`} />
                            <span>Close</span>
                        </DocumentControl>}
                </DocumentControls>
            </DocumentWrapper>

            <MenuWrapper>
                <OptionsButton onClick={closeHandler} withLabel={true} />
                <HelpButton onClick={closeHandler} withLabel={true} />
            </MenuWrapper>
        </Root>
    );
}