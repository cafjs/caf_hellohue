'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class Devices extends React.Component {

    constructor(props) {
        super(props);
        this.doURL = this.doURL.bind(this);
        this.doUser = this.doUser.bind(this);
        this.doAR = this.doAR.bind(this);
        this.doDisconnect = this.doDisconnect.bind(this);
    }

    doURL() {
        AppActions.setLocalState(this.props.ctx, {displayURL: true});
    }

    doUser() {
        AppActions.setLocalState(this.props.ctx, {displayUser: true});
    }

    doAR() {
        AppActions.setLocalState(this.props.ctx, {displayAR: true});
    }

    doDisconnect() {
        AppActions.disconnect(this.props.ctx);
    }

    render() {
        return this.props.selectedDevice ?
            cE(rB.Form, {horizontal: true},
               cE(rB.FormGroup, {controlId: 'buttonsId'},
                  cE(rB.Col, {smOffset: 3, sm: 6, xs: 12},
                     cE(rB.ButtonGroup, null, [
                         cE(rB.Button, {
                             key: 32,
                             bsStyle: 'primary',
                             onClick: this.doURL
                         }, 'URL'),
                         cE(rB.Button, {
                             key: 33,
                             bsStyle: 'info',
                             onClick: this.doUser
                         }, 'User View'),
                         this.props.inIFrame ?
                             null :
                             cE(rB.Button, {
                                 key: 34,
                                 bsStyle: 'primary',
                                 onClick: this.doAR
                             }, 'AR View'),
                         cE(rB.Button, {
                             key: 35,
                             bsStyle: 'danger',
                             onClick: this.doDisconnect
                         }, 'Disconnect')
                     ].filter(x => !!x))
                    )
                 ),
               cE(rB.FormGroup, {controlId: 'deviceId'},
                  cE(rB.Col, {componentClass:rB.ControlLabel, sm: 3, xs: 8},
                     'Device ID'),
                  cE(rB.Col, {sm: 3, xs: 8},
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
                 )
              ) :
            cE('div', null, 'None');
    }
}

module.exports = Devices;
