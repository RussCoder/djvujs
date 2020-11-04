import React from 'react';
import PropTypes from 'prop-types';
import { TranslationContext } from "./Translation";
import styled from 'styled-components';

const Root = styled.div`
    background: pink;
    color: black;
    padding: 1em;
    font-family: monospace;
    border: 1px solid gray;
    overflow: auto;
    height: 100%;
    box-sizing: border-box;
`;

const Header = styled.div`
    text-align: center;
    font-weight: 600;
    font-size: 2em;
    margin: 0.5em;
`;

const ErrorDetails = styled.ul`
    list-style-position: inside;
    white-space: pre-wrap;
    margin: 0.5em;
    padding: 0.5em;
    border: 1px solid gray;
`;

export default class ErrorPage extends React.Component {
    static propTypes = {
        error: PropTypes.object.isRequired,
        pageNumber: PropTypes.number.isRequired,
    };

    static contextType = TranslationContext;

    formErrorDetails() {
        return (
            <ErrorDetails>
                {Object.keys(this.props.error).filter(key => {
                    const type = typeof this.props.error[key];
                    return type === 'number' || type === 'string';
                }).map((key, i) => {
                    return (
                        <li key={i}>
                            <span css={`font-weight: 600; margin: 0 0.5em;`}>{key}:</span>{this.props.error[key]}
                        </li>
                    );
                })}
            </ErrorDetails>
        );
    }

    render() {
        const t = this.context;

        return (
            <Root>
                <Header>{`${t("Error on page")} №${this.props.pageNumber}`}</Header>
                <div>
                    <div css={`font-size: 1.2em; margin: 0.2em;`}>{t("Error details")}:</div>
                    {this.formErrorDetails()}
                </div>
            </Root>
        );
    }
}