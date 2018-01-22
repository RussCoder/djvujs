import Actions from './actions';

let tmpCanvas = document.createElement('canvas');

const getImageDataURL = (imageData) => {
    tmpCanvas.width = imageData.width;
    tmpCanvas.height = imageData.height;
    tmpCanvas.getContext('2d').putImageData(imageData, 0, 0);
    const dataUrl = tmpCanvas.toDataURL();
    tmpCanvas.width = tmpCanvas.height = 0; // free data
    return dataUrl;
};

const setDataUrlTimeout = (imageData, dispath) => {
    return setTimeout(() => {
        const dataUrl = getImageDataURL(imageData);
        dispath(Actions.dataUrlCreatedAction(dataUrl));
    }, 1000);
};

export default setDataUrlTimeout;

