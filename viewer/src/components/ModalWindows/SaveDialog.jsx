import React from 'react';
import styled from "styled-components";
import ModalWindow from "./ModalWindow";
import { useTranslation } from "../Translation";
import { useDispatch, useSelector } from "react-redux";
import { TextButton } from "../StyledPrimitives";
import { get } from "../../reducers";
import { ActionTypes } from "../../constants";
import ProgressBar from "../ProgressBar";
import Actions from "../../actions/actions";

const Root = styled.div`
    padding: 1em;
`;

const OptionButton = styled(TextButton)`
    width: 10em;
`;

const OptionsWrapper = styled.div`
    display: flex;
    justify-content: space-around;
    margin-top: 2em;
`;

const ProcessingBlock = styled.div`
    margin-top: 2em;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export default () => {
    const t = useTranslation();
    const dispatch = useDispatch();
    const isShown = useSelector(get.isSaveDialogShown);
    const buffer = useSelector(get.resultBuffer);
    const progress = useSelector(get.fileProcessingProgress);
    const isBundling = useSelector(get.isBundling);
    const [url, setUrl] = React.useState(null);

    const closeDialog = () => {
        dispatch({ type: ActionTypes.CLOSE_SAVE_DIALOG });
    };

    React.useEffect(() => {
        if (buffer) {
            const url = URL.createObjectURL(new Blob([buffer], { type: 'image/vnd.djvu' }));
            setUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setUrl(null);
        }
    }, [buffer]);

    if (!isShown) return null;

    const percentage = Math.round(progress * 100);

    return (
        <ModalWindow
            onClose={closeDialog}
            isFixedSize={false}
            css={`width: 25em`}
        >
            <Root>
                {!isBundling ? <>
                    <div css={'margin-bottom: 2em;'}>
                        {t("You are trying to save an indirect (multi-file) document.")}
                        {t("What exactly do you want to do?")}
                    </div>
                    <OptionsWrapper>
                        <OptionButton
                            onClick={() => {
                                closeDialog();
                                dispatch(Actions.saveDocumentAction())
                            }}
                        >
                            {t('Save only index file')}
                        </OptionButton>
                        <OptionButton onClick={() => dispatch({ type: ActionTypes.START_TO_BUNDLE })}>
                            {t('Download, bundle and save the whole document as one file')}
                        </OptionButton>
                    </OptionsWrapper>
                </> : null}

                {isBundling ?
                    <ProcessingBlock>
                        {!url ?
                            <>
                                <div css={`text-align: center; margin-bottom: 1em;`}>
                                    {t("Downloading and bundling the document")}... {percentage}%
                                </div>
                                <ProgressBar percentage={Math.round(progress * 100)} />
                            </> :
                            <>
                                <div css={`text-align: center; margin-bottom: 1em;`}>
                                    {t("The document has been downloaded and bundled successfully")}
                                </div>
                                <TextButton
                                    as="a"
                                    href={url}
                                    download="bundled_document.djvu"
                                    css={`text-decoration: none; margin: 0.5em`}
                                >
                                    {t('Save')}
                                </TextButton>
                            </>}
                    </ProcessingBlock> : null}
            </Root>
        </ModalWindow>
    );
}