import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faArrowAltCircleRight, faArrowAltCircleLeft } from '@fortawesome/fontawesome-free-regular';

import Actions from '../actions/actions';
import PageNumberElement from './PageNumber';
import { get } from '../reducers/rootReducer';

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
            <div
                className="page_number_block"
                title="Click on the number to enter it manually!"
            >
                <FontAwesomeIcon
                    icon={faArrowAltCircleLeft}
                    onClick={this.goToPrevPage}
                    className="navbut"
                />

                <PageNumberElement {...this.props} />

                <FontAwesomeIcon
                    icon={faArrowAltCircleRight}
                    onClick={this.goToNextPage}
                    className="navbut"
                />
            </div>
        );
    }
}

export default connect(state => {
    return {
        pageNumber: get.currentPageNumber(state),
        pagesCount: get.pagesCount(state)
    };
},
    {
        setNewPageNumber: Actions.setNewPageNumberAction
    }
)(PageNumberBlock);