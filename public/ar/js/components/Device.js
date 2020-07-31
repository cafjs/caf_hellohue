const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const Slider = require('react-slider').default;
const SliderPicker = require('react-color').SliderPicker;

class Device extends React.Component {

    constructor(props) {
        super(props);
        this.handleIsOn = this.handleIsOn.bind(this);
        this.handleIsColor = this.handleIsColor.bind(this);

        this.handleBrightness = this.handleBrightness.bind(this);
        this.handleColorTemperature = this.handleColorTemperature.bind(this);
        this.handleColor = this.handleColor.bind(this);
        this.handleColorLocal = this.handleColorLocal.bind(this);
    }

    handleIsOn(e) {
        AppActions.switchLight(this.props.ctx, e);
    }

    handleIsColor(e) {
        AppActions.setLocalState(this.props.ctx, {isColor: e});
        if (!e) {
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

    handleBrightness(brightness) {
        AppActions.setBrightness(this.props.ctx, brightness);
        AppActions.setLocalState(this.props.ctx, {brightness});
    }

    handleColorTemperature(colorTemperature) {
        AppActions.setColorTemperature(this.props.ctx, colorTemperature);
        AppActions.setLocalState(this.props.ctx, {colorTemperature});
    }

    handleColor(color, ev) {
        AppActions.setColor(this.props.ctx, color.rgb);
        AppActions.setLocalState(this.props.ctx, {color: color.rgb});

    }

    handleColorLocal(color, ev) {
        AppActions.setLocalState(this.props.ctx, {color: color.rgb});
    }

    render() {
        return cE(rB.Form, {horizontal: true},
                  /*
                  cE(rB.FormGroup, {controlId: 'deviceId'},
                     cE(rB.Col, {componentClass:rB.ControlLabel, sm: 3, xs: 12},
                        'Device ID'),
                     cE(rB.Col, {sm: 3, xs: 12},
                        cE(rB.FormControl.Static, null,
                           this.props.selectedDevice.id)
                       ),
                     cE(rB.Col, {componentClass:rB.ControlLabel, sm: 3, xs: 12},
                        'Advertisement'),
                     cE(rB.Col, {sm: 3, xs: 12},
                        cE(rB.FormControl.Static,
                           {style: {wordWrap: "break-word"}},
                           JSON.stringify(this.props.selectedDevice.ad))
                       )
                    ),*/
                  cE(rB.FormGroup, {controlId: 'switchId'},
                     cE(rB.Col, {sm:3, xs: 3},
                        cE(rB.ControlLabel, null, 'Light')
                       ),
                     cE(rB.Col, {sm:3, xs: 9},
                        cE(rB.ToggleButtonGroup, {
                            type: 'radio',
                            name : 'light',
                            value: this.props.isOn,
                            onChange: this.handleIsOn
                        },
                           cE(rB.ToggleButton, {value: false}, 'Off'),
                           cE(rB.ToggleButton, {value: true}, 'On')
                          )
                       )
                    ),
                  cE(rB.FormGroup, {controlId: 'brightnessId'},
                     cE(rB.Col, {sm:3, xs: 3},
                        cE(rB.ControlLabel, null, 'Brightness')
                       ),
                     cE(rB.Col, {sm:6, xs: 9},
                        cE(Slider, {
                            className:'horizontal-slider',
                            thumbClassName: 'example-thumb',
                            trackClassName: 'example-track',
                            //snapDragDisabled: true,
                            value: this.props.brightness,
                            onAfterChange: this.handleBrightness,
                            min: 1,
                            max: 254,
                            renderThumb: (props, state) => {
                                let val = (state.valueNow-1)/253;
                                val = Math.round(100.0*val);
                                return cE('div', props, val + '%');
                            }
                        })
                       )
                    ),
                  cE(rB.FormGroup, {controlId: 'colorId'},
                     cE(rB.Col, {sm:3, xs: 3},
                        cE(rB.ControlLabel, null, 'Color')
                       ),
                     cE(rB.Col, {sm:3, xs: 9},
                        cE(rB.ToggleButtonGroup, {
                            type: 'radio',
                            name : 'color',
                            value: this.props.isColor,
                            onChange: this.handleIsColor
                        },
                           cE(rB.ToggleButton, {value: false}, 'Off'),
                           cE(rB.ToggleButton, {value: true}, 'On')
                          )
                       )
                    ),
                  (this.props.isColor ?
                   cE(rB.FormGroup, {controlId: 'colorId'},
                      cE(rB.Col, {sm:3, xs: 3},
                         cE(rB.ControlLabel, null, 'Color (RGB)')
                        ),
                      cE(rB.Col, {sm:9, xs: 9},
                         cE(SliderPicker, {
                             width: '100%',
                             styles: {default: {hue: {height: '16px'},
                                                Hue: {height: '20px'}}},
                             color: this.props.color || {},
                             onChangeComplete: this.handleColor,
                             onChange: this.handleColorLocal
                         })
                        )
                     ) :
                   cE(rB.FormGroup, {controlId: 'colortempId'},
                      cE(rB.Col, {sm:3, xs: 3},
                         cE(rB.ControlLabel, null, 'Temperature')
                        ),
                      cE(rB.Col, {sm:6, xs: 9},
                         cE(Slider, {
                             className:'horizontal-slider',
                             thumbClassName: 'example-thumb',
                             trackClassName: 'example-track',
                             //snapDragDisabled: true,
                             value: this.props.colorTemperature,
                             onAfterChange: this.handleColorTemperature,
                             min: 150,
                             max: 500,
                             renderThumb: (props, state) => {
                                 let val = state.valueNow;
                                 return cE('div', props, val);
                             }
                         })
                        )
                     )
                  )
                 );
    }
};

module.exports = Device;
