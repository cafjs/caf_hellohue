if (typeof window !== 'undefined') {
    const app = require('./app');
    window.addEventListener('DOMContentLoaded', () => {
        app.main();
    });
};
