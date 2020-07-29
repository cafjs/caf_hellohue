"use strict";

const React = require('react');
const ReactDOM = require('react-dom');
const redux = require('redux');
const AppReducer = require('./reducers/AppReducer');
const AppActions = require('./actions/AppActions');
const AppSession = require('./session/AppSession');

const cE = React.createElement;
const MyApp = require('./components/MyApp');

const main = exports.main = async function(data) {
    if (typeof window !== 'undefined') {
        const ctx =  {
            store: redux.createStore(AppReducer)
        };
        try {
            await AppSession.connect(ctx);
            ReactDOM.render(cE(MyApp, {ctx: ctx}),
                            document.getElementById('content'));
        } catch (err) {
            document.getElementById('content').innerHTML =
                '<H1>Cannot connect: ' + err + '<H1/>';
            console.log('Cannot connect:' + err);
        }
    }
    // no server side rendering
};
