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
        this.props.setNewPageNumber(number);
    }

    onInputChange = (e) => {
        this.setNewPageNumber(+e.target.value);
    };

    render() {
        return (
            <div className="page_number_block">
                <input type="button" className="navbut prev" value="&#9668;" />
                <input className="page_number" type="number" onChange={this.onInputChange} />
                <input type="button" className="navbut next" value="&#9658;" />
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