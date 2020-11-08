import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { iconButton } from './cssMixins';

export const ControlButton = styled(FontAwesomeIcon)`
    ${iconButton};
    margin: 0 0.5em;
`;