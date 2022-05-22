import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { styledInput } from '../cssMixins';

const Root = styled.span`
    flex: 0 0 auto;
    min-width: 4em;
    max-width: 8em;
    height: 90%;
    line-height: normal;
    box-sizing: border-box;
    white-space: nowrap;
    position: relative;
    text-align: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    & > * {
        text-align: center;
        box-sizing: border-box;
    }

    & > input {
        ${styledInput};
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }
`;

export default class PageNumber extends React.Component {

    static propTypes = {
        pageNumber: PropTypes.number.isRequired,
        pagesQuantity: PropTypes.number,
        setNewPageNumber: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            tempValue: null
        };
    }

    componentDidUpdate() { // тупо костыль, так как Firefox на autoFocus кидает Blur сразу же
        if (this.input) {
            setTimeout(() => {
                try {
                    if (this.input) {
                        this.input.focus();
                        this.input.select();
                        this.input = null;
                    }
                } catch (e) { }
            }, 10);
        }
    }

    setNewPageNumber(number) {
        if (!this.props.pagesQuantity) {
            return;
        }
        if (number < 1) {
            number = 1;
        } else if (number > this.props.pagesQuantity) {
            number = this.props.pagesQuantity;
        }
        if (number !== this.props.pageNumber) {
            this.props.setNewPageNumber(number, true);
        }
    }

    startPageNumberEditing = () => {
        this.setState({ isEditing: true })
    };

    finishPageNumberEditing = (e) => {
        this.setState({
            isEditing: false,
            tempValue: null
        });
        var value = +e.target.value;
        this.setNewPageNumber(value);

    };

    onKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.finishPageNumberEditing(e);
        }
    };

    onChange = (e) => {
        this.setState({ tempValue: e.target.value })
    };

    inputRef = node => {
        this.input = node;
    }

    render() {
        return (
            <Root>
                {this.state.isEditing ?
                    <input
                        onKeyDown={this.onKeyDown}
                        onBlur={this.finishPageNumberEditing}
                        type="number"
                        min="1"
                        onChange={this.onChange}
                        value={this.state.tempValue === null ? this.props.pageNumber : this.state.tempValue}
                        ref={this.inputRef}
                    /> : null}
                <span
                    onClick={this.startPageNumberEditing}
                    style={this.state.isEditing ? { visibility: 'hidden', zIndex: -1 } : null}
                >
                    {this.props.pageNumber + (this.props.pagesQuantity ? " / " + this.props.pagesQuantity : "")}
                </span>
            </Root>
        )
    }
}