import { customId, customClass, renderViewer, loadDocument } from "../utils";

describe('Full page mode', () => {
    beforeEach(() => {
        cy.visit('/');
        renderViewer();
    });

    it('Full page mode button works', () => {
        cy.window().then(win => {
            const check = (chainer) => {
                cy.get(customId('root')).then($el => $el.get(0).getBoundingClientRect()).as('boundingRect');
                cy.get("@boundingRect").its("width").should(chainer, win.innerWidth);
                cy.get("@boundingRect").its("height").should(chainer, win.innerHeight);
            };

            check('be.lessThan');
            cy.get(customClass('full_page_button')).click();
            check('eq');
            cy.get(customClass('full_page_button')).click();
            check('be.lessThan');
        })
    });
});

// Doesn't work in Cypress's Electron, only in Firefox
describe.skip('Fullscreen mode unavailable', () => {
    beforeEach(() => {
        cy.visit('/');
        renderViewer();
    });

    it('Fullscreen button on initial screen', () => {
        cy.get(customClass('fullscreen_button')).should('not.exist');
    });

    it('Fullscreen button in menu', () => {
        loadDocument();
        cy.get(customId('menu_button')).click();
        cy.get(customId('menu')).within(() => {
            cy.contains('Fullscreen mode').should('not.exist');
            cy.get(customClass('fullscreen_button')).should('not.exist');
        });
    });
});

describe('Fullscreen mode', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.window().then(win => {
            win.parent.document
                .querySelector('.aut-iframe')
                .setAttribute('allow', 'fullscreen');
            win.location.reload();
            cy.document().its('fullscreenEnabled').should('be.true');
        });
        renderViewer();
    });

    // Browser doesn't allow to toggle fullscreen programmatically without a user gesture.
    it.skip('Fullscreen mode', () => {
        cy.window().then(win => {
            const check = (chainer) => {
                cy.get(customId('root')).then($el => $el.get(0).getBoundingClientRect()).as('boundingRect');
                cy.get("@boundingRect").its("width").should(chainer, win.screen.width);
                cy.get("@boundingRect").its("height").should(chainer, win.screen.width);
            };

            check('be.lessThan');
            cy.get(customClass('fullscreen_button')).click();
            cy.document().its('fullscreenElement').should('not.equal', null);
            cy.get(customClass('fullscreen_button')).click().wait(2000);
            check('eq');
            cy.get(customClass('fullscreen_button')).click();
            check('be.lessThan');
        })
    });

    it('Fullscreen button on initial screen', () => {
        cy.get(customClass('fullscreen_button')).should('be.visible');
    });

    it('Fullscreen button in menu', () => {
        loadDocument();
        cy.get(customId('menu_button')).click();
        cy.get(customId('menu')).within(() => {
            cy.contains('Fullscreen mode').should('be.visible');
            cy.get(customClass('fullscreen_button')).should('be.visible');
        });
    });
});