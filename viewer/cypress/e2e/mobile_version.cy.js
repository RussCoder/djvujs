import { customClass, customId, loadDocument, renderViewer } from "../utils";

describe('Adaptive layout', () => {
    beforeEach(() => {
        cy.visit('/');
        renderViewer();
        loadDocument();
    });

    it('Dynamic layout change', () => {

        const checkVisibility = (hidden = false) => {
            cy.get(customId('toolbar')).within(() => {
                cy.get(customId('view_mode_buttons')).should(`be.${hidden ? 'not.' : ''}visible`);
                cy.get(customId('cursor_mode_buttons')).should(`be.${hidden ? 'not.' : ''}visible`);
                cy.get(customId('scale_gizmo')).should(`be.${hidden ? 'not.' : ''}visible`);
                cy.get(customId('rotation_control')).should(`be.${hidden ? 'not.' : ''}visible`);
                cy.get(customId('pin_button')).should(hidden ? 'not.exist' : `be.visible`);
                cy.get(customClass('right_panel') + '>' + customClass('full_page_button'))
                    .should(hidden ? 'not.exist' : `be.visible`);
            });
            cy.contains('Contents').should(`be.${hidden ? 'not.' : ''}visible`);
        }

        checkVisibility();
        cy.viewport(700, 800);
        checkVisibility(true);

        cy.get(customId('contents_button')).should('be.visible');
        cy.get(customId('page_number_block')).should('be.visible');
        cy.get(customId('page_number_block')).should('be.visible');
        cy.get(customId('hide_button')).should('be.visible');
        cy.get(customId('menu_button')).should('be.visible');
    });
});

describe('Mobile version', {
    viewportWidth: 700,
    viewportHeight: 800,
}, () => {
    beforeEach(() => {
        cy.visit('/');
        renderViewer();
        loadDocument();
    });

    it('Hide button', () => {
        cy.get(customId('toolbar')).should('be.visible');
        cy.get(customId('hide_button')).should('be.visible').click();
        cy.get(customId('toolbar')).should('not.be.visible');
        cy.get(customId('hide_button')).should('be.visible').click();
        cy.get(customId('toolbar')).should('be.visible');
    });

    it('Contents button', () => {
        cy.contains('Contents').should('not.be.visible');
        cy.get(customId('contents_button')).click();
        cy.contains('Contents').should('be.visible');
        cy.get(customId('contents_button')).click();
        cy.contains('Contents').should('not.be.visible');
    });

    it('Mobile menu', () => {
        cy.get(customId('menu_button')).click();
        cy.get(customId('menu')).should('be.visible').within(() => {
            cy.contains('View mode').should('be.visible');
            cy.contains('Scale').should('be.visible');
            cy.contains('Rotation').should('be.visible');
            cy.contains('Cursor mode').should('be.visible');
            cy.contains('Full page mode').should('be.visible');
        });
    });
});


