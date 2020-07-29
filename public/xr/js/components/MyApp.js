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
require('aframe-colorwheel-component/dist/aframe-colorwheel-component.js');
require('aframe-gui/dist/aframe-gui.js');

const {Entity, Scene} = require('aframe-react');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const AppStatus = require('./AppStatus');
const Manage = require('./Manage');
const ColorPicker = require('./ColorPicker');

const DEFAULT_COLOR = 'blue';


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

    enterVR(ev) {
        console.log('enter VR');
        //ev.currentTarget.removeAttribute('cursor');
    }

    exitVR(ev) {
        console.log('exit VR');
        //ev.currentTarget.setAttribute('cursor', 'rayOrigin' , 'mouse');
    }

    render() {
        this.state = this.state || {};
        const {r, g, b} = this.state.color;
        const color = this.state.isColor ?
            `rgb(${r},${g},${b})` :
            'rgb(255,255,255)';
        const intensity = this.state.isOn ?
              this.state.brightness / 125 :
              0;

        return cE(Scene, {
            cursor: 'rayOrigin: mouse',
            renderer: 'antialias: true',
            events : {
                'enter-vr': this.enterVR.bind(this),
                'exit-vr': this.exitVR.bind(this)
            }},
                  cE('a-assets', null,
                     cE('img', {
                         id: 'backgroundImg',
                         src: '../xr/assets/chess-world.jpg'
                     }),
                     cE('a-asset-item', {
                         id: 'lamp-obj',
                         src: '../xr/assets/lamp.obj'
                     }),
                     cE('a-asset-item', {
                         id: 'lamp-mtl',
                         src: '../xr/assets/lamp.mtl'
                     })
                    ),
                  cE(AppStatus, {
                          isClosed: this.state.isClosed
                      }),
                  cE(Entity, {
                      'obj-model': 'obj: #lamp-obj; mtl: #lamp-mtl',
                      position: {x: 0.5, y: 0.67, z: -2.8},
                      rotation: {x: 0, y: 90.0, z: 0},
                      scale: '0.001 0.001 0.001'
                  }),
                  cE(Entity, {
                      primitive: 'a-sky',
                      'phi-start': 180,
                      src: '#backgroundImg'
                  }),
                  cE(Entity, {
                      geometry : {primitive: 'box', width: 2.5, height: 0.2,
                                   depth: 1.5},
                       material: {color: 'white'},
                       position: {x: 0, y: 0, z: -2.8}
                  }),
                  cE(Entity, {
                      position: {x: 0.35, y: 1.0, z: -2.8},
                      rotation: {x: 0, y: 90.0, z: 0},
                      light: {type: 'spot', intensity: intensity,
                              color: color, angle: 75, penumbra: 1.0}
                  }),
                  cE(ColorPicker, {
                      ctx: this.props.ctx,
                      color: this.state.color,
                      isColor: this.state.isColor,
                  }),
                  cE(Manage, {
                      ctx: this.props.ctx,
                      isOn: this.state.isOn,
                      isColor: this.state.isColor,
                      color: this.state.color,
                      colorTemperature: this.state.colorTemperature,
                      brightness: this.state.brightness
                  }),
                  cE(Entity, {
                      light: 'type: ambient; intensity: 0.05'
                  }),
                  cE(Entity, {
                      light: 'type: directional; intensity: 0.15',
                      position: {x: 1.5, y: 2.0, z: 0.0}
                  }),
                  cE(Entity, {
                      'laser-controls' : 'hand: right',
                      raycaster: 'far: 10; showLine: true',
                      line:'color: ' + DEFAULT_COLOR + '; opacity: 0.75'
                  })
                 );
    }
};

module.exports = MyApp;
