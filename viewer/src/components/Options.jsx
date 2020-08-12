import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { get } from '../reducers';
import { useTranslation } from "./Translation";
import { ActionTypes } from "../constants";

export default () => {
    const options = useSelector(get.options);
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <div className="options">
            <div className="header">Options</div>
            <label
                className="option"
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
            </label>
            <label
                className="option"
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
            </label>
        </div>
    )
};