if (typeof window !== 'undefined') {
    if (global) {
        global.TWEEN = require('@tweenjs/tween.js');
    }
    const app = require('./app');
    window.addEventListener('DOMContentLoaded', () => {
        app.main();
    });
};
