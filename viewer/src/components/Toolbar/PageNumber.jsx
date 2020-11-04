import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { styledInput } from '../cssMixins';

const style = css`
    flex: 1 1 auto;
    min-width: 1em;
    max-width: 8em;
    white-space: nowrap;
`;

const Input = styled.input`
    ${style};
    ${styledInput};
    max-width: 4em;
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

    onKeyPress = (e) => {
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
        if (this.state.isEditing) {
            return (
                <Input
                    onKeyPress={this.onKeyPress}
                    onBlur={this.finishPageNumberEditing}
                    type="number"
                    onChange={this.onChange}
                    value={this.state.tempValue === null ? this.props.pageNumber : this.state.tempValue}
                    ref={this.inputRef}
                />
            );
        } else {
            var st = this.props.pagesQuantity ? " / " + this.props.pagesQuantity : "";
            return (
                <span
                    onClick={this.startPageNumberEditing}
                    css={style}
                >
                    {this.props.pageNumber + st}
                </span>
            );
        }
    }
}