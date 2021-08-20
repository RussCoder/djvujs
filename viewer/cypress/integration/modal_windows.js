import { customClass, customId, renderViewer } from "../utils";

describe('Modal windows', () => {
    before(() => cy.visit('/'));
    beforeEach(renderViewer);

    it('A click on the dark layer closes the modal window', () => {
        cy.get(customClass('help_button')).click();
        cy.get(customClass('modal_window')).as('modal_window').should('be.visible');
        cy.get(customId('root')).click(5, 5);
        cy.get('@modal_window').should('not.exist');
    });

    it('The close button closes the modal window', () => {
        cy.get(customClass('help_button')).click();
        cy.get(customClass('modal_window')).as('modal_window').should('be.visible')
            .find(customClass('close_button')).click();
        cy.get("@modal_window").should('not.exist');
    });

    it('Options window', () => {
        cy.get(customClass('options_button')).click();
        cy.get(customClass('modal_window')).should('be.visible').within(() => {
            cy.contains('Options');
            cy.contains('Language');
            cy.contains('Color theme');
        });
    });

    it('Help window', () => {
        cy.get(customClass('help_button')).click();
        cy.get(customClass('modal_window')).should('be.visible').within(() => {
            cy.contains('DjVu.js Viewer');
            cy.contains('Hotkeys');
            cy.contains('Controls');
        });
    });
});