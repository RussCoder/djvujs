import React from 'react';
import PageNumberBlock from './PageNumberBlock'
import ScaleGizmo from './ScaleGizmo';
import ViewModeButtons from './ViewModeButtons';
import CursorModeButtonGroup from './CursorModeButtonGroup';
import RotationControl from './RotationControl';
import styled from 'styled-components';

const Root = styled.div`
    flex: 0 0 auto;
    border: 1px solid var(--border-color);
    border-radius: 0.5em 0 0.5em 0;
    padding: 0.3em;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5em;
    width: 90%;
    height: 2em;
    text-align: center;
    max-width: 45em;

    .control_button {
        font-size: 2em;
    }

    .button_group {
        border-left: 1px solid gray;
        border-right: 1px solid gray;
        white-space: nowrap;
        padding: 0 0.1em;

        span {
            opacity: 0.5;
            display: inline-block;

            &.active {
                opacity: 1;
            }
        }
    }

    .view_mode_group {
        display: flex;
        align-items: center;
        height: 100%;

        span {
            opacity: 0.5;

            &.active {
                opacity: 1;
            }
        }

        .continuous_scroll_button {
            display: inline-flex;
            flex-direction: column;
            flex-wrap: nowrap;
            justify-content: center;
            overflow: hidden;
            max-height: 100%;
        }
    }
`;

export default () => (
    <Root>
        <ViewModeButtons />
        <CursorModeButtonGroup />
        <PageNumberBlock />
        <ScaleGizmo />
        <RotationControl />
    </Root>
);