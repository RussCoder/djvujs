import React from 'react';
import PropTypes from 'prop-types';

export default class PageNumber extends React.Component {

    static propTypes = {
        pageNumber: PropTypes.number.isRequired,
        pagesCount: PropTypes.number,
        setNewPageNumber: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            tempValue: null
        };
    }

    setNewPageNumber(number) {
        if (!this.props.pagesCount) {
            return;
        }
        if (number < 1) {
            number = 1;
        } else if (number > this.props.pagesCount) {
            number = this.props.pagesCount;
        }
        if (number !== this.props.pageNumber) {
            this.props.setNewPageNumber(number);
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

    render() {
        if (this.state.isEditing) {
            return (
                <input
                    onKeyPress={this.onKeyPress}
                    onBlur={this.finishPageNumberEditing}
                    className="page_number"
                    type="number"
                    onChange={this.onChange}
                    value={this.state.tempValue === null ? this.props.pageNumber : this.state.tempValue}
                    onFocus={e => e.target.select()}
                    autoFocus
                />
            );
        } else {
            var st = this.props.pagesCount ? " / " + this.props.pagesCount : "";
            return (
                <span
                    onClick={this.startPageNumberEditing}
                    className="page_number"
                >
                    {this.props.pageNumber + st}
                </span>
            );
        }
    }
}