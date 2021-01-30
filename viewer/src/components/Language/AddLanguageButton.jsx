import React from "react";
import Constants from "../../constants/Constants";
import { IoAddCircleOutline } from "react-icons/io5";
import { useTranslation } from "../Translation";

export default ({ className }) => {
    const t = useTranslation();

    return (
        <a
            className={className}
            href={Constants.TRANSLATION_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={t("Add more")}
            css={`
                margin: 0 1rem;
                color: var(--color) !important;
                display: inline-block;
                height: 1em;
                width: 1em;

                :hover {
                    transform: scale(1.2);
                }
            `}
        >
            <IoAddCircleOutline />
        </a>
    );
}