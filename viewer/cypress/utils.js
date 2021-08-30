export const hexToRGB = (string) => {
    if ((string.length !== 4 && string.length !== 7) || string[0] !== '#') {
        throw new Error('Incorrect hex color string: ' + string);
    }
    const componentLength = string.length === 4 ? 1 : 2;

    const arr = [];
    for (let i = 0; i < 3; i++) {
        arr.push(string.slice(i * componentLength + 1, componentLength * (i + 1) + 1));
    }
    const result = arr.map(color => Number.parseInt(color.length === 2 ? color : (color + color), 16)).join(', ');

    return `rgb(${result})`;
}

export const customId = id => `[data-djvujs-id="${id}"]`;
export const customClass = className => `[data-djvujs-class~="${className}"]`;

export const haveCustomId = id => $el => $el.is(customId(id));
export const haveCustomClass = className => $el => expect($el).to.match(customClass(className));
export const notHaveCustomClass = className => $el => expect($el).not.to.match(customClass(className));

export const getByCustomId = id => cy.get(customId(id));
export const getByCustomClass = className => cy.get(customClass(className));

export const renderViewer = () => {
    cy.window().then(win => {
        win.viewer && win.viewer.destroy();
        win.viewer = new win.DjVu.Viewer({ language: 'en', theme: 'light' });
        win.viewer.render(win.document.getElementById('root'));
    });
};

export function loadDocument() {
    cy.clearLocalStorage();
    cy.window().then(win => {
        win.viewer.loadDocumentByUrl('DjVu3Spec.djvu', {
            name: "test_document",
            locale: 'en',
        });
    });
}