(function () {
    'use strict';
    const navButtons = document.querySelectorAll('body nav a');
    for (const link of navButtons) {
        if (location.href === link.href) {
            link.classList.add('active');
            break;
        }
    }
})();