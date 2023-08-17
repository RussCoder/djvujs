import {  customId, loadDocument, renderViewer } from "../utils";

describe('Toolbar controls', () => {
    beforeEach(() => {
        cy.visit('/');
        renderViewer();
        loadDocument();
    });

    it('Pin/Unpin toolbar', () => {
        cy.get(customId('toolbar')).should('be.visible');
        cy.get(customId('pin_button')).click();
        cy.get(customId('toolbar')).trigger('mouseout').wait(500);
        cy.get(customId('toolbar')).should('not.be.visible');
        cy.get(customId('root')).trigger('mouseover', 'bottom');
        cy.get(customId('toolbar')).should('be.visible');
        cy.get(customId('pin_button')).click();
        cy.get(customId('toolbar')).trigger('mouseout').wait(500);
        cy.get(customId('toolbar')).should('be.visible');
    });

    it('Contents button works', () => {
        cy.contains("Contents").should('be.visible');
        cy.get(customId('contents_button')).click().wait(500);
        cy.contains("Contents").should('not.be.visible');
        cy.get(customId('contents_button')).click();
        cy.contains("Contents").should('be.visible');
    });

    it('Go to the next/previous page', () => {
        cy.get(customId('page_number_block')).find('svg:first-of-type').as('prev');
        cy.get(customId('page_number_block')).find('svg:last-of-type').as('next');
        cy.contains('1 / 71').should('be.visible');
        cy.get('@next').click();
        cy.contains('2 / 71').should('be.visible');
        cy.get('@prev').click();
        cy.contains('1 / 71').should('be.visible');
        cy.get('@prev').click();
        cy.contains('71 / 71').should('be.visible');
        cy.get('@next').click();
        cy.contains('1 / 71').should('be.visible');
    });
});
