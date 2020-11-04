import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { css } from 'styled-components';

const style = css`
    display: flex;

    .content {
        .name {
            cursor: pointer;
            margin-left: 0.5em;

            &:hover {
                text-decoration: underline;
            }
        }

        .children {
            padding-left: 0.5em;
        }
    }
`;

export default class TreeItem extends React.Component {

    static propTypes = {
        name: PropTypes.string.isRequired,
        children: PropTypes.array,
        callback: PropTypes.func,
        callbackData: PropTypes.any
    };

    constructor(props) {
        super(props);
        this.state = { isCollapsed: true };
    }

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

    toggleItem = () => {
        this.setState({ isCollapsed: !this.state.isCollapsed });
    };

    render() {
        return (
            <div css={style}>
                {this.props.children ?
                    <FontAwesomeIcon
                        icon={this.state.isCollapsed ? faPlusSquare : faMinusSquare}
                        onClick={this.toggleItem}
                    /> : <FontAwesomeIcon icon={faCircle} transform="shrink-8" />
                }
                <div className="content">
                    <div className="name" onClick={this.onClick}>{this.props.name}</div>
                    {this.state.isCollapsed ? null : this.renderChildren()}
                </div>
            </div>
        );
    }
}