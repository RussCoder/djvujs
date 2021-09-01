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
            setAppContext({
                appWidth: entry.borderBoxSize[0].inlineSize,
                appHeight: entry.borderBoxSize[0].blockSize,
                isMobile: entry.borderBoxSize[0].blockSize < heightThreshold
                    || entry.borderBoxSize[0].inlineSize < widthThreshold,
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