import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner } from '@fortawesome/fontawesome-free-solid';

export default class TreeItem extends React.Component {

    static propTypes = {
        name: PropTypes.string.isRequired,
        children: PropTypes.array,
        callback: PropTypes.func,
        callbackData: PropTypes.any
    };

    onClick = () => {
        this.props.callback && this.props.callback(this.props.callbackData);
    };

    renderChildren() {
        if (!this.props.children) {
            return null;
        }
        return (
            <div className="children">
                {this.props.children.map((treeItem, i) => {
                    return <TreeItem key={i} {...treeItem} />
                })}
            </div>
        );
    }

    render() {
        return (
            <div className="tree_item">
                <div className="name" onClick={this.onClick}>{this.props.name}</div>
                {this.renderChildren()}
            </div>
        );
    }
}