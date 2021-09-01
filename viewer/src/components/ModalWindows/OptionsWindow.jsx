import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { get } from '../../reducers';
import { useTranslation } from "../Translation";
import { ActionTypes } from "../../constants";
import styled from 'styled-components';
import ModalWindow from "./ModalWindow";
import ThemeSwitcher from "../InitialScreen/ThemeSwitcher";
import { inExtension } from "../../utils";
import LanguageSelector from "../Language/LanguageSelector";

const Root = styled.div`
    box-sizing: border-box;
    padding: 0 0.5em;
`;

const MainHeader = styled.div`
    font-size: 1.5em;
    font-weight: bold;
    margin-bottom: 0.5em;
    text-align: center;
`

const ExtensionOption = styled.label`
    display: flex;
    align-items: center;
    cursor: pointer;

    input[type=checkbox] {
        transform: scale(1.5);
        flex: 0 0 auto;
        cursor: pointer;
        display: inline-block;
        margin-right: 1em;
        outline: none;
    }
`;

const Option = styled.label`
    display: block;
    margin-bottom: 1em;
`;

export default () => {
    const options = useSelector(get.options);
    const dispatch = useDispatch();
    const t = useTranslation();
    const isShown = useSelector(get.isOptionsWindowOpened);

    if (!isShown) return null;

    return (
        <ModalWindow
            onClose={() => dispatch({ type: ActionTypes.TOGGLE_OPTIONS_WINDOW, payload: false })}
            css={`min-width: 15em;`}
            data-djvujs-id="options_window"
        >
            <Root>
                <MainHeader>{t('Options')}</MainHeader>
                <Option as="div">
                    <LanguageSelector />
                </Option>
                <Option>
                    <span style={{ marginRight: '0.5em' }}>{t('Color theme')}:</span>
                    <ThemeSwitcher />
                </Option>
                {inExtension ? <div>
                    <div css={`margin-bottom: 1em;`}>{t('Extension options')}:</div>
                    <ExtensionOption
                        title={t("All links to .djvu files will be opened by the viewer via a simple click on a link")}
                    >
                        <input
                            type="checkbox"
                            checked={options.interceptHttpRequests}
                            onChange={e => dispatch({
                                type: ActionTypes.UPDATE_OPTIONS,
                                payload: { interceptHttpRequests: e.target.checked, analyzeHeaders: false }
                            })}
                        />{t("Open all links with .djvu at the end via the viewer")}
                    </ExtensionOption>
                    <ExtensionOption
                        title={t("Analyze headers of every new tab in order to process even links which do not end with the .djvu extension")}
                        style={{ marginLeft: "1em" }}
                    >
                        <input
                            type="checkbox"
                            checked={options.analyzeHeaders}
                            onChange={e => dispatch({
                                type: ActionTypes.UPDATE_OPTIONS,
                                payload: { analyzeHeaders: e.target.checked, interceptHttpRequests: true }
                            })}
                        />{t("Detect .djvu files by means of http headers")}
                    </ExtensionOption>
                </div> : null}
            </Root>
        </ModalWindow>
    )
};