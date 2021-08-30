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