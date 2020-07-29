'use strict';

const AppConstants = require('../constants/AppConstants');
const json_rpc = require('caf_transport').json_rpc;
const caf_cli =  require('caf_cli');


const updateF = function(store, state) {
    const d = {
        type: AppConstants.APP_UPDATE,
        state: state
    };
    store.dispatch(d);
};

const errorF =  function(store, err) {
    const d = {
        type: AppConstants.APP_ERROR,
        error: err
    };
    store.dispatch(d);
};

const getNotifData = function(msg) {
    return json_rpc.getMethodArgs(msg)[0];
};

const notifyF = function(store, message) {
    const d = {
        type: AppConstants.APP_NOTIFICATION,
        state: getNotifData(message)
    };
    store.dispatch(d);
};

const wsStatusF =  function(store, isClosed) {
    const d = {
        type: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    store.dispatch(d);
};

const AppActions = {
    async init(ctx) {
        try {
            const tok =  caf_cli.extractTokenFromURL(window.location.href);
            const data = await ctx.session.hello(ctx.session.getCacheKey(), tok)
                    .getPromise();
            updateF(ctx.store, data);
        } catch (err) {
            errorF(ctx.store, err);
        }
    },
    message(ctx, msg) {
        notifyF(ctx.store, msg);
    },
    closing(ctx, err) {
        console.log('Closing:' + JSON.stringify(err));
        wsStatusF(ctx.store, true);
    },
    setLocalState(ctx, data) {
        updateF(ctx.store, data);
    },
    resetError(ctx) {
        AppActions.setError(ctx, null);
    }
};

const EXTERNAL_METHODS = [
    'switchLight', 'setBrightness', 'setColorTemperature', 'setColor',
    'setError', 'getState' // Add your methods here
];

EXTERNAL_METHODS.forEach(function(x) {
    AppActions[x] = async function() {
        const args = Array.prototype.slice.call(arguments);
        const ctx = args.shift();
        try {
            const data = await ctx.session[x].apply(ctx.session, args)
                  .getPromise();

            /* We set these values locally first, and we don't want late
               responses to move the gui back in time.*/
            if (x === 'setColor') {
                delete data.color;
            }
            if (x === 'setColorTemperature') {
                delete data.colorTemperature;
            }
            if (x === 'setBrightness') {
                delete data.brightness;
            }

            updateF(ctx.store, data);
        } catch (err) {
            errorF(ctx.store, err);
        }
    };
});


module.exports = AppActions;
