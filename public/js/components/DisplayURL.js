'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const urlParser = require('url');

class DisplayURL extends React.Component {

    constructor(props) {
        super(props);
        this.doDismissURL = this.doDismissURL.bind(this);
        this.doCopyURL = this.doCopyURL.bind(this);
        this.doEmail = this.doEmail.bind(this);
        this.handleIsXR = this.handleIsXR.bind(this);
        this.state = {};
        if ((typeof window !== "undefined") &&
            window.location && window.location.href) {
            const myURL = urlParser.parse(window.location.href);
            myURL.pathname = '/user/index.html';
            myURL.hash = myURL.hash.replace('session=default', 'session=user');
            myURL.hash = myURL.hash.replace('session=standalone',
                                            'session=user');
            delete myURL.search; // delete cacheKey
            this.state.userURL = urlParser.format(myURL);
            myURL.pathname = '/xr/index.html';
            myURL.hash = myURL.hash.replace('session=user', 'session=xr');
            this.state.xrURL = urlParser.format(myURL);
        }
    }

    doDismissURL(ev) {
        AppActions.setLocalState(this.props.ctx, {displayURL: false});
    }

    doEmail(ev) {
        const myURL = this.props.isXR ?
              this.state.xrURL :
              this.state.userURL;
        const body = encodeURIComponent(myURL);
        const subject = encodeURIComponent('URL for device interaction');
        const mailtoURL = 'mailto:?subject=' + subject + '&body=' + body;
        window.open(mailtoURL);
        this.doDismissURL();
    }

    doCopyURL(ev) {
        const myURL = this.props.isXR ?
              this.state.xrURL :
              this.state.userURL;

        if (myURL) {
            navigator.clipboard.writeText(myURL)
                .then(() => {
                    console.log('Text copied OK to clipboard');
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                });
        }
        this.doDismissURL();
    }

    handleIsXR(e) {
        AppActions.setLocalState(this.props.ctx, {isXR: e});
    }

    render() {
        return cE(rB.Modal, {show: !!this.props.displayURL,
                             onHide: this.doDismissURL,
                             animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-warning text-warning',
                      closeButton: true},
                     cE(rB.Modal.Title, null, 'URL')
                    ),
                  cE(rB.ModalBody, null,
                     cE(rB.Form, {horizontal: true},
                        cE(rB.FormGroup, {controlId: 'xrId'},
                           cE(rB.Col, {sm:3, xs: 6},
                              cE(rB.ControlLabel, null, 'VR/AR')
                             ),
                           cE(rB.Col, {sm:3, xs: 6},
                              cE(rB.ToggleButtonGroup, {
                                  type: 'radio',
                                  name : 'isXR',
                                  value: this.props.isXR,
                                  onChange: this.handleIsXR
                              },
                                 cE(rB.ToggleButton, {value: false}, 'Off'),
                                 cE(rB.ToggleButton, {value: true}, 'On')
                                )
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'urlId'},
                           cE(rB.Col, {sm: 12},
                              cE(rB.FormControl.Static,
                                 {style: {wordWrap: "break-word"}},
                                 this.props.isXR ?
                                 this.state.xrURL :
                                 this.state.userURL)
                             )
                          )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.ButtonGroup, null,
                        cE(rB.Button, {onClick: this.doCopyURL},
                           'Copy to Clipboard'),
                        cE(rB.Button, {bsStyle: 'danger',
                                       onClick: this.doEmail}, 'Email')
                       )
                    )
                 );
    }
};

module.exports = DisplayURL;
