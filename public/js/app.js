/*!
Copyright 2020 Caf.js Labs and contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const ReactServer = require('react-dom/server');
const AppSession = require('./session/AppSession');
const MyApp = require('./components/MyApp');
const redux = require('redux');
const AppReducer = require('./reducers/AppReducer');
const AppActions = require('./actions/AppActions');

const cE = React.createElement;

const main = exports.main = function(data) {
    const ctx =  {
        store: redux.createStore(AppReducer)
    };

    if (typeof window !== 'undefined') {
        return (async function() {
            try {
                await AppSession.connect(ctx);
                ReactDOM.hydrate(cE(MyApp, {ctx: ctx}),
                                 document.getElementById('content'));
            } catch (err) {
                document.getElementById('content').innerHTML =
                    '<H1>Cannot connect: ' + err + '<H1/>';
                console.log('Cannot connect:' + err);
            }
        })();
    } else {
        // server side rendering
        AppActions.initServer(ctx, data);
        return ReactServer.renderToString(cE(MyApp, {ctx: ctx}));
    }
};
