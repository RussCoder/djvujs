import { customClass } from "./utils";

export function helpWindowShouldBeOpen() {
    cy.get(customClass('modal_window')).should('be.visible').within(() => {
        cy.contains('DjVu.js Viewer');
        cy.contains('Hotkeys');
        cy.contains('Controls');
    });
}

export function optionsWindowShouldBeOpen() {
    cy.get(customClass('modal_window')).should('be.visible').within(() => {
        cy.contains('Options');
        cy.contains('Language');
        cy.contains('Color theme');
    });
}

export function closeModalWindow() {
    cy.get(customClass('modal_window')).as('modal_window').should('be.visible')
        .find(customClass('close_button')).click();
}

export function initialScreenShouldBeVisible() {
    cy.contains("DjVu.js Viewer").should('be.visible');
    cy.contains("powered with DjVu.js").should('be.visible');
    cy.get(customClass('help_button')).should('be.visible');
    cy.get(customClass('options_button')).should('be.visible');
}