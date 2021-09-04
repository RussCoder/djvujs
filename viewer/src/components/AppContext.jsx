import React, { useEffect, useMemo, useRef, useState } from "react";
import { ThemeContext, ThemeProvider } from "styled-components";

const widthThreshold = 769;
const heightThreshold = 569;
const defaultValue = { appWidth: widthThreshold, appHeight: heightThreshold, isMobile: false };
export const AppContext = ThemeContext;
export const useAppContext = () => React.useContext(AppContext);

export const withAppContext = Component => props => (
    <AppContext.Consumer>
        {appContext => <Component {...props} appContext={appContext} />}
    </AppContext.Consumer>
);

export default ({ AppRoot }) => {
    const rootRef = useRef(null);
    const [appContext, setAppContext] = useState(defaultValue);

    useEffect(() => {
        if (!rootRef.current) return;

        const observer = new ResizeObserver(([entry]) => {
            // maybe it's better to observe borderBox, but in mobile browsers only contentRect is supported now
            const boxSize = entry.contentBoxSize ? (entry.contentBoxSize[0] || entry.contentBoxSize) : {
                inlineSize: entry.contentRect.width,
                blockSize: entry.contentRect.height,
            };
            setAppContext({
                appWidth: boxSize.inlineSize,
                appHeight: boxSize.blockSize,
                isMobile: boxSize.blockSize < heightThreshold || boxSize.inlineSize < widthThreshold,
            });
        });

        observer.observe(rootRef.current);

        return () => observer.disconnect();
    }, [rootRef.current, setAppContext]);

    const app = useMemo(() => <AppRoot ref={rootRef} />, [rootRef]);

    return (
        <ThemeProvider theme={appContext}>
            {app}
        </ThemeProvider>
    );
}