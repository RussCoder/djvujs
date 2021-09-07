import { TiPin } from 'react-icons/ti';
import styled from "styled-components";
import { useTranslation } from "../Translation";

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
    const t = useTranslation();

    return (
        <Root
            $pinned={isPinned}
            onClick={onClick}
            data-djvujs-id="pin_button"
            title={t(isPinned ? 'Toolbar is always shown' : 'Toolbar automatically hides')}
        />
    );
};