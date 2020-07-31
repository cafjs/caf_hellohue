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

class ColorPicker extends React.Component {

    constructor(props) {
        super(props);
        this.pickerRef = React.createRef();
        this.changeColor = this.changeColor.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
    }

    componentDidMount() {
        if (this.pickerRef.current) {
            const [sw] = document.getElementsByClassName('swatch-container');
            sw && this.pickerRef.current.el.removeChild(sw);
        }
    }

    componentDidUpdate() {
        if (this.pickerRef.current) {
            const [sw] = document.getElementsByClassName('swatch-container');
            sw && this.pickerRef.current.el.removeChild(sw);
        }
    }

    changeColor(ev) {
        if (ev && ev.detail && ev.detail.rgb) {
            console.log(JSON.stringify(ev.detail.rgb));
            if (this.props.isColor) {
                AppActions.setColor(this.props.ctx, ev.detail.rgb);
                AppActions.setLocalState(this.props.ctx,
                                         {color: ev.detail.rgb});
            } else {
                const brightness = Math.max(ev.detail.rgb.r, ev.detail.rgb.g,
                                            ev.detail.rgb.b);
                AppActions.setBrightness(this.props.ctx, brightness);
                AppActions.setLocalState(this.props.ctx, {brightness});
            }
        }
    }

    render() {
        return cE(Entity, {
            events: {
                changecolor: this.changeColor,
                loaded: this.componentDidUpdate
            },
            primitive: 'a-colorwheel',
            ref: this.pickerRef,
            position:  {x:0, y : 1.5, z: -4},
            rotation: {x:0, y: 0, z: 0},
            backgroundcolor: '#b1b1b1',
            wheelSize: 1,
            //showSelection: false,
            selectionSize: 0.001
        });
    }
};

module.exports = ColorPicker;
