import { customId, customClass, renderViewer } from "../utils";

describe('Full page mode', () => {
    before(() => cy.visit('/'));
    beforeEach(renderViewer);

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

describe('Work with a document', () => {
    before(() => {
        cy.visit('/');
        renderViewer();
    });

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.window().then(win => {
            win.viewer.loadDocumentByUrl('DjVu3Spec.djvu', {
                name: "My test document",
                locale: 'en',
            });
        });
    });

    it('Go to the next/previous page', () => {
        cy.contains('1 / 71').next('svg').click();
        cy.contains('2 / 71').prev('svg').click();
        cy.contains('1 / 71').prev('svg').click();
        cy.contains('71 / 71').next('svg').click();
        cy.contains('1 / 71');
    });
});