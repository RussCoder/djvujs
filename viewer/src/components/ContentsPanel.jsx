import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Actions from '../actions/actions';
import TreeItem from './TreeItem';

class ContentsPanel extends React.Component {

    static propTypes = {
        contents: PropTypes.array,
        setPageByUrl: PropTypes.func.isRequired
    };

    onTreeItemClick = (url) => {
        this.props.setPageByUrl(url);
    };

    convertBookmarkArrayToTreeItemDataArray(bookmarkArray) {
        return bookmarkArray && bookmarkArray.map(bookmark => this.makeTreeItemDataByBookmark(bookmark));
    }

    makeTreeItemDataByBookmark(bookmark) {
        return {
            name: bookmark.description,
            children: this.convertBookmarkArrayToTreeItemDataArray(bookmark.children),
            callback: this.onTreeItemClick,
            callbackData: bookmark.url
        };
    }

    render() {
        return (
            <div className="contents_panel">
                {this.props.contents && this.props.contents.map((bookmark, i) => {
                    return <TreeItem key={i} {...this.makeTreeItemDataByBookmark(bookmark)} />
                })}
            </div>
        );
    }
}

export default connect(null, {
    setPageByUrl: Actions.setPageByUrlAction
})(ContentsPanel);