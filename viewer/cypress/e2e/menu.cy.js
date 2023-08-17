import { customClass, customId, loadDocument, renderViewer } from "../utils";
import { helpWindowShouldBeOpen, initialScreenShouldBeVisible, optionsWindowShouldBeOpen } from "../shared";

const menuShouldNotBeVisible = () => cy.get(customId('menu')).should('not.be.visible');

describe('Document menu opens and closes', () => {
    beforeEach(() => {
        cy.visit('/');
        renderViewer();
        loadDocument();
    });

    it('Menu opens and closes via menu button', () => {
        cy.contains("Menu").should('not.be.visible');
        cy.get(customId('menu_button')).click();
        cy.contains("Menu").should('be.visible');
        cy.get(customId('menu_button')).click();
        menuShouldNotBeVisible();
    });

    it('Menu can be closed with the close button', () => {
        cy.get(customId('menu_button')).click().wait(500);
        cy.get(customId('menu')).should('be.visible')
            .find(customClass('close_button')).first().click();
        menuShouldNotBeVisible();
    });
});

describe('Document menu controls', () => {
    beforeEach(() => {
        cy.visit('/');
        renderViewer();
        loadDocument();
        cy.get(customId('menu_button')).click().wait(500);
    });

    it('Options inside menu and menu closes', () => {
        cy.contains('Options').click();
        optionsWindowShouldBeOpen();
        menuShouldNotBeVisible();
    });

    it('Help button inside menu', () => {
        cy.contains('About').click();
        helpWindowShouldBeOpen();
        menuShouldNotBeVisible();
    });

    it('Print document', () => {
        cy.contains('Print').click();
        menuShouldNotBeVisible();
        cy.get(customClass('modal_window')).within(() => {
            cy.contains('Pages must be rendered before printing').should('be.visible');
            cy.contains('From').should('be.visible');
            cy.contains('to').should('be.visible');
            cy.contains('Prepare pages for printing').click();
        });

        cy.contains('Prepare pages for printing').should('not.exist');
        cy.get(customClass('modal_window'))
            .contains('Preparing pages for printing...').should('be.visible');
    });

    it('Close document', () => {
        cy.contains('test_document').should('be.visible');
        cy.contains('Close').click();
        cy.get(customId('menu')).should('not.exist');
        initialScreenShouldBeVisible();
    });
});