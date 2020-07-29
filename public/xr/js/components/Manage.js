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
const aframe = require('aframe');
const {Entity, Scene} = require('aframe-react');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

const HANDLE_SWITCH =  'Manage_1_handleSwitch';
const HANDLE_COLOR =  'Manage_1_handleColor';
const HANDLE_BRIGHTNESS =  'Manage_1_handleBrightness';

class Manage extends React.Component {

    constructor(props) {
        super(props);
        this.switchRef =  React.createRef();
        this.colorRef =  React.createRef();
        this.handleSwitch = this.handleSwitch.bind(this);
        this.handleColor = this.handleColor.bind(this);
        /*This is bad... It seems there is no way to define handlers without
          polluting the global space...*/
        if (typeof window !== 'undefined') {
            window[HANDLE_SWITCH] = this.handleSwitch;
            window[HANDLE_COLOR] = this.handleColor;
        }
    }

    handleSwitch() {
        const isOn = !this.props.isOn;
        if (this.switchRef.current) {
            const text = isOn ? 'Turn OFF' : 'Turn ON';
            this.switchRef.current.el.components['gui-button'].setText(text);
        }
        AppActions.switchLight(this.props.ctx, isOn);
    }

    handleColor() {
        const isColor = !this.props.isColor;
        if (this.colorRef.current) {
            const text = isColor ? 'White' : 'Color';
            this.colorRef.current.el.components['gui-button'].setText(text);
        }

        AppActions.setLocalState(this.props.ctx, {isColor});
        if (!isColor) {
            if (typeof this.props.colorTemperature === 'number') {
                AppActions.setColorTemperature(this.props.ctx,
                                               this.props.colorTemperature);
            }
        } else {
            if (this.props.color && typeof this.props.color.g === 'number') {
                AppActions.setColor(this.props.ctx, this.props.color);
            }
        }
    }

    componentDidUpdate() {
        if (this.switchRef.current && this.switchRef.current.el &&
            this.switchRef.current.el.components['gui-button']) {
            const text = this.props.isOn ? 'Turn OFF' : 'Turn ON';
            const target = this.switchRef.current.el.components['gui-button'];
            target && target.data && target.setText(text); // ensure initialized
        }

        if (this.colorRef.current && this.colorRef.current.el &&
            this.colorRef.current.el.components['gui-button']) {
            const text = this.props.isColor ? 'White' : 'Color';
            const target = this.colorRef.current.el.components['gui-button'].
            target && target.data && target.setText(text);// ensure initialized
        }
    }

    render() {
        return cE(Entity, {
            primitive: 'a-gui-flex-container',
            'flex-direction': 'column',
            'justify-content': 'center',
            width : 2.2,
            height: 1,
            position: {x:0.1, y: 3.15, z: -4},
            rotation: {x:0, y: 0, z: 0}
        },
                  cE(Entity, {
                      primitive: 'a-gui-button',
                      width: 2.0,
                      height: 0.50,
                      ref: this.switchRef,
                      value: (this.props.isOn ? 'Turn OFF' : 'Turn ON'),
                      onclick: HANDLE_SWITCH
                  }),
                  cE(Entity, {
                      primitive: 'a-gui-button',
                      width: 2.0,
                      height: 0.50,
                      ref: this.colorRef,
                      value: (this.props.isColor ? 'White' : 'Color'),
                      onclick: HANDLE_COLOR
                   })
                 );
    }
}


module.exports = Manage;
