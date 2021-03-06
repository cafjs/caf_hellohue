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
const rB = require('react-bootstrap');
const AppActions = require('../actions/AppActions');
const AppStatus = require('./AppStatus');

const DisplayError = require('./DisplayError');
const DisplayUser = require('./DisplayUser');
const DisplayURL = require('./DisplayURL');
const DisplayAR = require('./DisplayAR');
const DisplaySelectDevice = require('./DisplaySelectDevice');

const Finder = require('./Finder');
const Devices = require('./Devices');

const cE = React.createElement;

class MyApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.ctx.store.getState();
    }

    componentDidMount() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.props.ctx.store
                .subscribe(this._onChange.bind(this));
            this._onChange();
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    _onChange() {
        if (this.unsubscribe) {
            this.setState(this.props.ctx.store.getState());
        }
    }

    render() {
        const config = this.state.config[this.state.deviceType];
        const service = config.serviceDiscover || '?';
        const title = `${service}  (${this.state.deviceType})`;

        return cE('div', {className: 'container-fluid'},
                  cE(DisplayError, {
                      ctx: this.props.ctx,
                      error: this.state.error
                  }),
                  cE(DisplayUser, {
                      ctx: this.props.ctx,
                      selectedDevice: this.state.selectedDevice,
                      color: this.state.color,
                      colorTemperature: this.state.colorTemperature,
                      isOn: this.state.isOn,
                      isColor: this.state.isColor,
                      brightness: this.state.brightness,
                      displayUser: this.state.displayUser
                  }),
                  cE(DisplayAR, {
                      ctx: this.props.ctx,
                      inIFrame: this.state.inIFrame,
                      displayAR: this.state.displayAR
                  }),
                  cE(DisplayURL, {
                      ctx: this.props.ctx,
                      selectedDevice: this.state.selectedDevice,
                      isVR: this.state.isVR,
                      isAR: this.state.isAR,
                      displayURL: this.state.displayURL
                  }),
                  cE(DisplaySelectDevice, {
                      ctx: this.props.ctx,
                      devices: this.state.devices,
                      selectedDevice: this.state.selectedDevice,
                      displaySelectDevice: this.state.displaySelectDevice
                  }),
                  cE(rB.Panel, null,
                     cE(rB.Panel.Heading, null,
                        cE(rB.Panel.Title, null,
                           cE(rB.Grid, {fluid: true},
                              cE(rB.Row, null,
                                 cE(rB.Col, {sm:1, xs:1},
                                    cE(AppStatus, {
                                        isClosed: this.state.isClosed
                                    })
                                   ),
                                 cE(rB.Col, {
                                     sm: 5,
                                     xs:10,
                                     className: 'text-right'
                                 }, 'Hello Hue'),
                                 cE(rB.Col, {
                                     sm: 5,
                                     xs:11,
                                     className: 'text-right'
                                 }, this.state.fullName)
                                )
                             )
                          )
                       ),
                     cE(rB.Panel.Body, null,
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, title)
                             ),
                           cE(rB.Panel.Body, null,
                              cE(Finder, {
                                  ctx: this.props.ctx,
                                  inIFrame: this.state.inIFrame,
                                  daemon: this.state.daemon,
                                  deviceType: this.state.deviceType,
                                  devices: this.state.devices
                              })
                             )
                          ),
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, 'Connected Devices')
                             ),
                           cE(rB.Panel.Body, null,
                              cE(Devices, {
                                  ctx: this.props.ctx,
                                  inIFrame: this.state.inIFrame,
                                  selectedDevice: this.state.selectedDevice
                              })
                             )
                          )
                       )
                    )
                 );
    }
};

module.exports = MyApp;
