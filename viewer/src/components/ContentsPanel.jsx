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
        const contents = this.props.contents;
        return (
            <div className="contents_panel">
                <div className="header">Contents</div>
                {contents && contents.map((bookmark, i) => {
                    return <TreeItem key={i} {...this.makeTreeItemDataByBookmark(bookmark)} />
                })}
                {contents ? null :
                    <div className="no_contents_message">No contents provided</div>
                }
            </div>
        );
    }
}

export default connect(null, {
    setPageByUrl: Actions.setPageByUrlAction
})(ContentsPanel);