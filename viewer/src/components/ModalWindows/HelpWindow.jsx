import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaExpand, FaCompress } from "react-icons/fa";

import ModalWindow from './ModalWindow';
import Actions from '../../actions/actions';
import { get } from '../../reducers';
import DjVu from '../../DjVu';
import { useTranslation } from '../Translation';
import styled from "styled-components";

const Root = styled.div`
    padding: 0.5em;
    font-size: ${p => p.theme.isMobile ? 12 : 20}px;
`;

const Header = styled.div`
    font-size: 1.2em;
    width: 100%;
    font-weight: 600;
    border-bottom: 1px solid var(--border-color);
    margin: 0.5em 0;
`;

const HotkeyGrid = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.5em;

    & > :nth-child(2n+1) {
        text-align: center;
    }
`;

export default () => {
    const isShown = useSelector(get.isHelpWindowShown);
    const dispatch = useDispatch();
    const t = useTranslation();
    const { hideFullPageSwitch } = useSelector(get.uiOptions);

    if (!isShown) {
        return null;
    }

    return (
        <ModalWindow onClose={() => dispatch(Actions.closeHelpWindowAction())} isFixedSize={true}>
            <Root>
                <Header>{`DjVu.js Viewer v.${DjVu.Viewer.VERSION} (DjVu.js v.${DjVu.VERSION})`}</Header>
                <div>
                    {t('The application for viewing .djvu files in the browser.')}<br />
                    {t("If something doesn't work properly, feel free to write about the problem at #email.", {
                        '#email': <a target="_blank" rel="noopener noreferrer"
                                     href="mailto:djvujs@yandex.ru">djvujs@yandex.ru</a>
                    })}
                    <br />
                    {t("The official website is #website.", {
                        "#website": <a target="_blank" rel="noopener noreferrer"
                                       href="https://djvu.js.org/">djvu.js.org</a>
                    })}<br />
                    {t("The source code is available on #link.", {
                        "#link": <a target="_blank" rel="noopener noreferrer"
                                    href="https://github.com/RussCoder/djvujs">GitHub</a>
                    })}<br />
                </div>

                <Header>{t('Hotkeys')}</Header>
                <HotkeyGrid>
                    <em>Ctrl+S</em><span>- {t('save the document')}</span>
                    <em>{'\u2190'}</em><span>- {t('go to the previous page')}</span>
                    <em>{'\u2192'}</em><span>- {t('go to the next page')}</span>
                </HotkeyGrid>

                {hideFullPageSwitch ? null :
                    <>
                        <Header>{t('Controls')}</Header>
                        <div>
                            {t("#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.", {
                                "#expandIcon": <FaExpand />,
                                "#collapseIcon": <FaCompress />,
                            })}
                            {' ' + t("If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.")}
                        </div>
                    </>
                }
            </Root>
        </ModalWindow>
    );
}