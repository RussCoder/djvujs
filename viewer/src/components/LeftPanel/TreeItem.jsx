import React from 'react';
import PropTypes from 'prop-types';
import { FaRegPlusSquare, FaRegMinusSquare, FaCircle } from "react-icons/fa";
import styled from 'styled-components';

const Name = styled.div`
    cursor: pointer;
    margin-left: 0.5em;
    line-height: 20px;

    &:hover {
        text-decoration: underline;
    }
`;

const Root = styled.div`
    display: flex;
    flex-wrap: nowrap;
    
    & > svg {
        flex: 0 0 auto;
        font-size: 20px;
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
            <div css={`padding-left: 0.5em;`}>
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
        const Icon = this.state.isCollapsed ? FaRegPlusSquare : FaRegMinusSquare
        return (
            <Root>
                {this.props.children ?
                    <Icon
                        onClick={this.toggleItem}
                    /> : <FaCircle css={`transform: scale(0.5)`} />
                }
                <div>
                    <Name className="name" onClick={this.onClick}>{this.props.name}</Name>
                    {this.state.isCollapsed ? null : this.renderChildren()}
                </div>
            </Root>
        );
    }
}