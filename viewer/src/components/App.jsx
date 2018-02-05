import React, { Component } from 'react';
import DownPanel from "./DownPanel";
import ImageBlock from "./ImageBlock";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import '../css/styles.css';

class App extends Component {
    static propTypes = {
        isFullPageView: PropTypes.bool.isRequired
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
                <ImageBlock />
                <DownPanel />
            </div>
        );
    }
}

export default connect(
    state => ({
        isFullPageView: state.isFullPageView
    })
)(App);