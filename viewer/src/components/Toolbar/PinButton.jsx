import { TiPin } from 'react-icons/ti';
import styled from "styled-components";

const Root = styled(TiPin)`
    font-size: calc(var(--button-basic-size) * 1.2);
    margin-right: 1em;
    cursor: pointer;
    ${p => !p.$pinned ? 'transform: rotate(45deg)' : ''};

    :hover {
        transform: scale(1.1) ${p => !p.$pinned ? 'rotate(45deg)' : ''};
    }
`;

export default ({ isPinned, onClick }) => {
    return (
        <Root $pinned={isPinned} onClick={onClick} />
    );
};