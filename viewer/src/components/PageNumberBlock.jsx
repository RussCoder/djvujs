import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Consts from '../constants/consts';
import Actions from '../actions/actions';

class PageNumberBlock extends React.Component {

    static propTypes = {
        pageNumber: PropTypes.number,
        pagesCount: PropTypes.number
    };

    setNewPageNumber(number) {
        if (number >= 1 && number <= this.props.pagesCount) {
            this.props.setNewPageNumber(number);
        }
    }

    onInputChange = (e) => {
        this.setNewPageNumber(+e.target.value);
    };

    goToNextPage = () => {
        this.setNewPageNumber(this.props.pageNumber + 1);
    };

    goToPrevPage = () => {
        this.setNewPageNumber(this.props.pageNumber - 1);
    };

    render() {
        return (
            <div className="page_number_block">
                <input
                    type="button"
                    className="navbut prev"
                    value="&#9668;"
                    onClick={this.goToPrevPage}
                />
                <input
                    className="page_number"
                    type="number"
                    onChange={this.onInputChange}
                    value={this.props.pageNumber}
                />
                <input
                    type="button"
                    className="navbut next"
                    value="&#9658;"
                    onClick={this.goToNextPage}
                />
            </div>
        );
    }
}

export default connect(state => {
    return {
        pageNumber: state.currentPageNumber,
        pagesCount: state.pagesCount
    };
},
    {
        setNewPageNumber: Actions.setNewPageNumberAction
    }
)(PageNumberBlock);