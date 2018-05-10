import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faExpand, faCompress } from '@fortawesome/fontawesome-free-solid';

import ModalWindow from './ModalWindow';
import Actions from '../actions/actions';
import { get } from '../reducers/rootReducer';

const DjVu = window.DjVu;

class HelpWindow extends React.Component {

    static propTypes = {
        closeHelpWindow: PropTypes.func.isRequired
    };

    render() {
        const { closeHelpWindow, isShown } = this.props;

        if (!isShown) {
            return null;
        }

        return (
            <ModalWindow onClose={closeHelpWindow} isFixedSize={true}>
                <div className="help_window">

                    <div className="header">{`DjVu.js Viewer v.${DjVu.Viewer.VERSION} (DjVu.js v.${DjVu.VERSION})`}</div>
                    <div className="para">
                        The application for viewing .djvu files in the browser.<br />
                        If something doesn't work properly, feel free to write about the problem 
                        at <a target="_blank" rel="noopener noreferrer" href="mailto:djvujs@yandex.ru">djvujs@yandex.ru</a>.<br />
                        The official website is <a target="_blank" rel="noopener noreferrer" href="https://djvu.js.org/">djvu.js.org</a>.<br />
                        The source code is available 
                        on <a target="_blank" rel="noopener noreferrer" href="https://github.com/RussCoder/djvujs">GitHub</a>.<br />
                    </div>

                    <div className="header">Hotkeys</div>
                    <div className="para"><em>Ctrl+S</em> - save document</div>
                    <div className="para"><em>Left Arrow</em> - go to the previous page</div>
                    <div className="para"><em>Right Arrow</em> - go to the next page</div>

                    <div className="header">Controls</div>
                    <div className="para">
                        <FontAwesomeIcon icon={faExpand} /> and <FontAwesomeIcon icon={faCompress} /> are
                        to switch the viewer to full page mode and back.
                        If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.
                     </div>

                </div>
            </ModalWindow>
        );
    }
}

export default connect(state => ({
    isShown: get.isHelpWindowShown(state)
}), {
        closeHelpWindow: Actions.closeHelpWindowAction
    })(HelpWindow);