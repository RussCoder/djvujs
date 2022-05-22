import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight } from "react-icons/all";

import Actions from '../../actions/actions';
import PageNumberElement from './PageNumber';
import { get } from '../../reducers';
import { TranslationContext } from "../Translation";
import styled, { css } from 'styled-components';
import { controlButton } from "../cssMixins";

const Root = styled.div`
    margin: 0 0.5em;
    flex: 0 0 auto;
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const navButtonStyle = css`
    ${controlButton};
    margin: 0 0.1em;
    border-radius: 100%;
    cursor: pointer;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 0 1px gray;
    }

    &:active {
        background: #555;
        color: white;
    }
`;

class PageNumberBlock extends React.Component {

    static propTypes = {
        pageNumber: PropTypes.number,
        pagesQuantity: PropTypes.number
    };

    static contextType = TranslationContext;

    setNewPageNumber(number, isNext = true) {
        if (number >= 1 && number <= this.props.pagesQuantity) {
            this.props.setNewPageNumber(number, true);
        } else {
            this.props.setNewPageNumber(isNext ? 1 : this.props.pagesQuantity, true);
        }
    }

    onInputChange = (e) => {
        this.setNewPageNumber(+e.target.value);
    };

    goToNextPage = () => {
        this.setNewPageNumber(this.props.pageNumber + 1, true);
    };

    goToPrevPage = () => {
        this.setNewPageNumber(this.props.pageNumber - 1, false);
    };

    render() {
        const t = this.context;

        return (
            <Root
                title={t("Click on the number to enter it manually")}
                data-djvujs-id="page_number_block"
            >
                <FaRegArrowAltCircleLeft
                    onClick={this.goToPrevPage}
                    css={navButtonStyle}
                />

                <PageNumberElement {...this.props} />

                <FaRegArrowAltCircleRight
                    onClick={this.goToNextPage}
                    css={navButtonStyle}
                />
            </Root>
        );
    }
}

export default connect(state => {
    return {
        pageNumber: get.currentPageNumber(state),
        pagesQuantity: get.pagesQuantity(state)
    };
},
    {
        setNewPageNumber: Actions.setNewPageNumberAction
    }
)(PageNumberBlock);