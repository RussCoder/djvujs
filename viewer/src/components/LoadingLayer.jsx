import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default class LoadingLayer extends React.Component {
    constructor(props) {
        super(props);
        this.showTimeout = null;
        this.rootRef = React.createRef();
    }

    componentDidMount() {
        this.showTimeout = setTimeout(() => {
            if (this.rootRef.current) this.rootRef.current.style.display = null;
            this.showTimeout = null;
        }, 500);
    }

    componentWillUnmount() {
        this.showTimeout && clearTimeout(this.showTimeout);
    }

    render() {
        return (
            <div
                className="loading_layer"
                style={{ display: 'none' }}
                ref={this.rootRef}
            >
                <div className="dark_layer" />
                <div className="message_wrapper">
                    <FontAwesomeIcon
                        icon={faSpinner}
                        pulse={true}
                    />
                    <span className="message">Loading...</span>
                </div>
            </div>
        );
    }
}