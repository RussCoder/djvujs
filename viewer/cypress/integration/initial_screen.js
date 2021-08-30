import { getByCustomId, haveCustomClass, hexToRGB, notHaveCustomClass, renderViewer } from "../utils";
import { initialScreenShouldBeVisible } from "../shared";

describe.only('Initial screen', () => {
    before(() => cy.visit('/'));

    beforeEach(renderViewer);

    it('Initial screen is visible', () => {
        initialScreenShouldBeVisible();
    });

    it('Dark and white theme', () => {
        getByCustomId('root').should('have.css', 'background-color', hexToRGB('#fcfcfc'));
        getByCustomId('light_theme_button').should(haveCustomClass('active'));
        getByCustomId('dark_theme_button').click();
        getByCustomId('root').should('have.css', 'background-color', hexToRGB('#1e1e1e'));
        getByCustomId('light_theme_button').click();
        getByCustomId('root').should('have.css', 'background-color', hexToRGB('#fcfcfc'));
    });

    it('Language switch', () => {
        cy.contains('English').should(haveCustomClass('selected'));
        cy.contains('Русский').click().should(haveCustomClass('selected'));
        cy.contains('изменение настроек').should('be.visible');
        cy.contains('English').should(notHaveCustomClass('selected'));
    });
});