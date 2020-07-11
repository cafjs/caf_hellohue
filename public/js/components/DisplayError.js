'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

const ERROR_MSG = `

Suggestion:
Upgrade the firmware and reset the lamp
using the original Philips app,
and then turn the bulb on/off by
disconnecting the power supply.
`;

class DisplayError extends React.Component {

    constructor(props) {
        super(props);
        this.doDismissError = this.doDismissError.bind(this);
    }

    doDismissError(ev) {
        AppActions.disconnect(this.props.ctx);
        AppActions.resetError(this.props.ctx);
    }

    render() {
        return cE(rB.Modal, {show: !!this.props.error,
                             onHide: this.doDismissError,
                             animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-warning text-warning',
                      closeButton: true},
                     cE(rB.Modal.Title, null, 'Error')
                    ),
                  cE(rB.ModalBody, null,
                     cE('p', null, 'Message: ' + ((this.props.error &&
                                                   this.props.error.message) ||
                                                  '')),
                     cE(rB.Alert, {bsStyle: 'danger'}, ERROR_MSG)
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doDismissError}, 'Continue')
                    )
                 );
    }
};

module.exports = DisplayError;
