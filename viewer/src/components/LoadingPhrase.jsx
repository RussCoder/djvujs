import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from './Translation';

export default ({ style, className }) => {
    const t = useTranslation();

    return (
        <span style={style} className={className}>
            <FontAwesomeIcon
                icon={faSpinner}
                pulse={true}
            />
            <span style={{marginLeft: '0.5em'}}>{t('Loading')}...</span>
        </span>
    );
};