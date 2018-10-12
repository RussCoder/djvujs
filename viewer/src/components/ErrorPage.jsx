import React from 'react';
import PropTypes from 'prop-types';

export default class ErrorPage extends React.Component {
    static propTypes = {
        error: PropTypes.object.isRequired,
        pageNumber: PropTypes.number.isRequired,
    };

    formErrorDetails() {
        return (
            <ul className="error_details">
                {Object.keys(this.props.error).filter(key => {
                    var type = typeof this.props.error[key];
                    return type === 'number' || type === 'string';
                }).map((key, i) => {
                    return (
                        <li key={i}>
                            <span className="key">{key}:</span>{this.props.error[key]}
                        </li>
                    );
                })}
            </ul>
        );
    }

    render() {
        return (
            <div className="error_page">
                <div className="header">{`Error on Page №${this.props.pageNumber}`}</div>
                <div className="body">
                    <div className="message">Error details: </div>                
                        {this.formErrorDetails()}  
                </div>
            </div>
        )
    }
}