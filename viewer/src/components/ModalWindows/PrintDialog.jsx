import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ModalWindow from './ModalWindow';
import { get } from '../../reducers';
import { useTranslation } from '../Translation';
import styled from "styled-components";
import { ActionTypes } from "../../constants";
import { styledInput } from "../cssMixins";
import { TextButton } from "../StyledPrimitives";
import ProgressBar from "../ProgressBar";
import { isFirefox } from "../../utils";

const Root = styled.div`
    padding: 0.5em;
`;

const Select = styled.select`
    min-width: 4em;
    ${styledInput};
`;

function renderPageNumberOptions(pagesQuantity) {
    const pages = new Array(pagesQuantity);
    for (let i = 1; i <= pagesQuantity; i++) {
        pages[i - 1] = <option value={i} key={i}>{i}</option>;
    }
    return pages;
}

export default () => {
    const isPreparing = useSelector(get.isPreparingForPrinting);
    const printProgress = useSelector(get.printProgress);
    const pages = useSelector(get.pagesForPrinting);
    const dispatch = useDispatch();
    const t = useTranslation();
    const pagesQuantity = useSelector(get.pagesQuantity);

    const [from, setFrom] = React.useState(1);
    let [to, setTo] = React.useState(null);
    to = to || pagesQuantity;

    const print = (elem) => {
        const win = elem.contentWindow;
        win.onafterprint = () => {
            // If we do it synchronously, Firefox ceases to react to mouse movements (e.g. no hover animations).
            // and even after the page is reloaded, the main thread doesn't receive messages from the worker (although they are sent)
            // So it can be cured only via closing the tab and opening a new one.
            // In Chrome everything is OK.
            // Actually, 0 timeout works for Firefox too, but to make it more robust we use 100 ms.
            setTimeout(() => {
                dispatch({ type: ActionTypes.CLOSE_PRINT_DIALOG });
            }, isFirefox ? 100 : 0);
        };
        const promises = [];

        for (const page of pages) {
            const img = win.document.createElement('img');
            promises.push(new Promise(resolve => img.onload = resolve));
            img.src = page.url;
            img.width = page.width;
            img.height = page.height;

            img.style.display = 'block';
            // don't mind if two pages fit on one sheet, but it's not good to split one image into two pages
            img.style.breakInside = 'avoid'; // Chrome actually by default does not break images
            if (isFirefox) { // Firefox ignores break-inside, so we have to use break-after
                img.style.breakAfter = 'page';
            }
            img.style.margin = '0 auto';
            img.style.width = (page.width / page.dpi) + 'in';
            img.style.height = (page.height / page.dpi) + 'in';
            win.document.body.appendChild(img);
        }

        if (isFirefox) {
            win.print(); // Firefox shows blank pages if we wait for images (although prints correctly)
        } else {
            // Chrome shows empty images on pages if we do not wait
            Promise.all(promises).then(() => win.print());
        }
    };

    return (
        <ModalWindow onClose={() => dispatch({ type: ActionTypes.CLOSE_PRINT_DIALOG })}>
            <Root>
                {isPreparing ?
                    <>
                        <div css="text-align: center; margin-bottom: 1em;">
                            {t('Preparing pages for printing')}...
                            <span css="min-width: 3em; display: inline-block">{printProgress}%</span>
                        </div>
                        <ProgressBar percentage={printProgress} />
                        {pages ?
                            <iframe
                                css={`
                                    width: 0;
                                    height: 0;
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    opacity: 0;
                                `}
                                src="about:blank"
                                ref={elem => elem && print(elem)}
                            /> : null}
                    </>
                    : <>
                        <div>
                            {t('Pages must be rendered before printing.') + ' ' + t('It may take a while.')}
                        </div>
                        <div>{t('Select the pages you want to print.')}</div>

                        <div css="margin: 1em 0; text-align: center">
                            <span css="margin-right: 1em;">{t('From')}</span>
                            <Select value={from} onChange={e => setFrom(e.target.value)}>
                                {renderPageNumberOptions([pagesQuantity])}
                            </Select>
                            <span css="margin: 0 1em">{t('to')}</span>
                            <Select value={to} onChange={e => setTo(e.target.value)}>
                                {renderPageNumberOptions([pagesQuantity])}
                            </Select>
                        </div>
                        <TextButton
                            css="font-size: 0.8em; margin: 0 auto; display: block"
                            onClick={() => dispatch({
                                type: ActionTypes.PREPARE_PAGES_FOR_PRINTING,
                                payload: { from, to }
                            })}
                        >
                            {t('Prepare pages for printing')}
                        </TextButton>
                    </>}
            </Root>
        </ModalWindow>
    );
};