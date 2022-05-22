import React, { useEffect, useMemo, useRef, useState } from "react";
import { ThemeContext, ThemeProvider } from "styled-components";
import { useDispatch } from "react-redux";
import { ActionTypes } from "../constants";

const widthThreshold = 890;
const heightThreshold = 569;
const defaultValue = { appWidth: widthThreshold, appHeight: heightThreshold, isMobile: false };
export const AppContext = ThemeContext;
export const useAppContext = () => React.useContext(AppContext);

export const withAppContext = Component => props => (
    <AppContext.Consumer>
        {appContext => <Component {...props} appContext={appContext} />}
    </AppContext.Consumer>
);

function useAppSize(ref) {
    const [appSize, setAppSize] = useState(defaultValue);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver(([entry]) => {
            // maybe it's better to observe borderBox, but in mobile browsers only contentRect is supported now
            const boxSize = entry.contentBoxSize ? (entry.contentBoxSize[0] || entry.contentBoxSize) : {
                inlineSize: entry.contentRect.width,
                blockSize: entry.contentRect.height,
            };
            setAppSize({
                appWidth: boxSize.inlineSize,
                appHeight: boxSize.blockSize,
                isMobile: boxSize.blockSize < heightThreshold || boxSize.inlineSize < widthThreshold,
            });
        });

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [ref.current, setAppSize]);

    return appSize;
}

function useFullscreen(ref) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    useEffect(() => {
        if (!ref.current) return;

        const handler = () => {
            setIsFullscreen(document.fullscreenElement === ref.current || document.webkitFullscreenElement === ref.current);
        };

        ref.current.addEventListener('fullscreenchange', handler);
        ref.current.addEventListener('webkitfullscreenchange', handler);

    }, [ref.current]);

    const toggleFullscreen = async () => {
        if (!ref.current || !(document.fullscreenEnabled || document.webkitFullscreenEnabled)) return;

        let promise = null;
        if (!isFullscreen) {
            if (ref.current.requestFullscreen) {
                promise = ref.current.requestFullscreen();
            } else if (ref.current.webkitRequestFullScreen) {
                promise = ref.current.webkitRequestFullScreen();
            }
        } else if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) {
                promise = document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                promise = ref.current.webkitExitFullscreen();
            }
        }

        try {
            await promise;
        } catch (e) {
            console.warn('Cannot change fullscreen mode. Error: \n', e);
        }
    };

    return { isFullscreen, toggleFullscreen };
}

export default ({ AppRoot }) => {
    const rootRef = useRef(null);
    const appSize = useAppSize(rootRef);
    const fullscreen = useFullscreen(rootRef);
    const dispatch = useDispatch();
    const appContext = { ...appSize, ...fullscreen };

    useEffect(() => {
        dispatch({ type: ActionTypes.UPDATE_APP_CONTEXT, payload: appContext })
    }, [dispatch, appContext]);

    const app = useMemo(() => <AppRoot ref={rootRef} />, [rootRef]);

    return (
        <ThemeProvider theme={appContext}>
            {app}
        </ThemeProvider>
    );
}