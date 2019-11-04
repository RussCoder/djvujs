import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { get } from '../reducers';
import Consts from '../constants/consts';

export default () => {
    const options = useSelector(get.options);
    const dispatch = useDispatch();

    return (
        <div className="options">
            <div className="header">Options</div>
            <label className="option" title="When enabled, all links to .djvu files will be opened by the viewer via a simple click on a link">
                <input
                    type="checkbox"
                    checked={options.interceptHttpRequests}
                    onChange={e => dispatch({
                        type: Consts.OPTIONS_UPDATED_ACTION,
                        payload: { ...options, interceptHttpRequests: e.target.checked }
                    })}
                />Open all .djvu links via the viewer
            </label>
        </div>
    )
};