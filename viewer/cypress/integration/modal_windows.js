import { customClass, customId, renderViewer } from "../utils";
import { closeModalWindow, helpWindowShouldBeOpen, optionsWindowShouldBeOpen } from "../shared";

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
        closeModalWindow();
        cy.get("@modal_window").should('not.exist');
    });

    it('Options window', () => {
        cy.get(customClass('options_button')).click();
        optionsWindowShouldBeOpen();
    });

    it('Help window', () => {
        cy.get(customClass('help_button')).click();
        helpWindowShouldBeOpen();
    });
});