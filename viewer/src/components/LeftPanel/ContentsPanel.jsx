import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Actions from '../../actions/actions';
import TreeItem from './TreeItem';
import { TranslationContext } from "../Translation";
import styled from 'styled-components';
import CloseButton from "../misc/CloseButton";
import { ActionTypes } from "../../constants";

const Root = styled.div`
    padding: 0.5em;
    box-sizing: border-box;
    height: 100%;
    overflow: auto;
`;

const Header = styled.div`
    font-size: 1.5em;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 0.5em;
    padding-bottom: 0.2em;
    display: flex;
    justify-content: space-between;
`;

class ContentsPanel extends React.Component {

    static propTypes = {
        contents: PropTypes.array
    };

    static contextType = TranslationContext;

    onTreeItemClick = (url) => {
        this.props.dispatch(Actions.setPageByUrlAction(url));
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
        const { contents, dispatch } = this.props;
        const t = this.context;

        return (
            <Root>
                <Header>
                    <span css={`margin-right: 0.5em;`}>{t("Contents")}</span>
                    <CloseButton
                        onClick={() => dispatch({ type: ActionTypes.CLOSE_CONTENTS })}
                    />
                </Header>
                {contents && contents.map((bookmark, i) => {
                    return <TreeItem key={i} {...this.makeTreeItemDataByBookmark(bookmark)} />
                })}
                {contents ? null :
                    <div css={`font-style: italic;`}>{t("No contents provided")}</div>
                }
            </Root>
        );
    }
}

export default connect()(ContentsPanel);