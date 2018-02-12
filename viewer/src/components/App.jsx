import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import '../css/styles.css';

import DownPanel from "./DownPanel";
import ImageBlock from "./ImageBlock";
import InitialScreen from './InitialScreen';

class App extends Component {
    static propTypes = {
        isFullPageView: PropTypes.bool.isRequired,
        isFileLoaded: PropTypes.bool.isRequired
    };

    render() {
        let fullPageViewClass = "";
        const disableScrollClass = 'disable_scroll_djvujs';
        if (this.props.isFullPageView) {
            fullPageViewClass = " full_page_view";
            document.querySelector('html').classList.add(disableScrollClass);
            document.body.classList.add(disableScrollClass);
        } else {
            document.querySelector('html').classList.remove(disableScrollClass);
            document.body.classList.remove(disableScrollClass);
        }

        return (
            <div className={"djvu_viewer" + fullPageViewClass}>
                {this.props.isFileLoaded ? <ImageBlock /> : <InitialScreen />}
                <DownPanel />
            </div>
        );
    }
}

export default connect(
    state => ({
        isFileLoaded: !!state.fileName,
        isFullPageView: state.isFullPageView
    })
)(App);