import styled, { css } from "styled-components";
import { FiChevronsDown } from "react-icons/fi";

const hiddenStyle = css`
    bottom: calc(100% + var(--app-padding));
    right: 0;
    transform: rotate(180deg);
    transition: transform 1s, bottom 0.5s, right 0.5s 0.5s;
`;

const Root = styled.div`
    --size: 28px;
    width: var(--size);
    height: var(--size);
    font-size: calc(var(--size) * 0.7);
    position: absolute;
    z-index: 1;
    background: var(--background-color);
    border-radius: 100px;
    border: 1px solid var(--color);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 1s, bottom 0.5s 0.5s, right 0.5s;

    right: 0;
    bottom: calc(100% + var(--app-padding));
    ${p => p.theme.appWidth > 400 ? `
        right: 25%;
        bottom: 50%;
        transform: translateX(50%) translateY(50%);
    ` : ''};

    ${p => p.$hidden ? hiddenStyle : ''};
`;

export default ({ isToolbarHidden, onClick }) => {
    return (
        <Root $hidden={isToolbarHidden} onClick={onClick}>
            <FiChevronsDown />
        </Root>
    );
}