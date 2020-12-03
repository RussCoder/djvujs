import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

import ModalWindow from './ModalWindow';
import Actions from '../../actions/actions';
import { get } from '../../reducers';
import DjVu from '../../DjVu';
import { useTranslation } from '../Translation';
import styled from "styled-components";

const Root = styled.div`
    padding: 0.5em;

    div:first-child {
        font-size: 1.2em;
        width: 100%;
        font-weight: 600;
        border-bottom: 1px solid var(--border-color);
        margin: 0.5em 0;
    }
`;

export default () => {
    const isShown = useSelector(get.isHelpWindowShown);
    const dispatch = useDispatch();
    const t = useTranslation();

    if (!isShown) {
        return null;
    }

    return (
        <ModalWindow onClose={() => dispatch(Actions.closeHelpWindowAction())} isFixedSize={true}>
            <Root>
                <div
                    className="header">{`DjVu.js Viewer v.${DjVu.Viewer.VERSION} (DjVu.js v.${DjVu.VERSION})`}</div>
                <div className="para">
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

                <div className="header">{t('Hotkeys')}</div>
                <div className="para"><em>Ctrl+S</em> - {t('save the document')}</div>
                <div className="para"><em>Left Arrow</em> - {t('go to the previous page')}</div>
                <div className="para"><em>Right Arrow</em> - {t('go to the next page')}</div>

                <div className="header">{t('Controls')}</div>
                <div className="para">
                    {t("#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.", {
                        "#expandIcon": <FontAwesomeIcon icon={faExpand} />,
                        "#collapseIcon": <FontAwesomeIcon icon={faCompress} />,
                    })}
                    {' ' + t("If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.")}
                </div>
            </Root>
        </ModalWindow>
    );
}