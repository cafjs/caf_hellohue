'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const urlParser = require('url');

const FLAT = 0;
const VR = 1;
const AR = 2;

class DisplayURL extends React.Component {

    constructor(props) {
        super(props);
        this.doDismissURL = this.doDismissURL.bind(this);
        this.doCopyURL = this.doCopyURL.bind(this);
        this.doEmail = this.doEmail.bind(this);
        this.handleIsXR = this.handleIsXR.bind(this);

        if ((typeof window !== "undefined") &&
            window.location && window.location.href) {
            const myURL = urlParser.parse(window.location.href);
            myURL.pathname = '/user/index.html';
            myURL.hash = myURL.hash.replace('session=default', 'session=user');
            myURL.hash = myURL.hash.replace('session=standalone',
                                            'session=user');
            delete myURL.search; // delete cacheKey
            this.userURL = urlParser.format(myURL);

            myURL.pathname = '/vr/index.html';
            myURL.hash = myURL.hash.replace('session=user', 'session=vr');
            this.vrURL = urlParser.format(myURL);

            myURL.pathname = '/ar/index.html';
            myURL.hash = myURL.hash.replace('session=vr', 'session=ar');
            this.arURL = urlParser.format(myURL);

        }
    }

    doDismissURL(ev) {
        AppActions.setLocalState(this.props.ctx, {displayURL: false});
    }

    doEmail(ev) {
        const myURL = this.props.isVR ?
              this.vrURL :
              (this.props.isAR ? this.arURL : this.userURL);
        const body = encodeURIComponent(myURL);
        const subject = encodeURIComponent('URL for device interaction');
        const mailtoURL = 'mailto:?subject=' + subject + '&body=' + body;
        window.open(mailtoURL);
        this.doDismissURL();
    }

    doCopyURL(ev) {
        const myURL = this.props.isVR ?
              this.vrURL :
              (this.props.isAR ? this.arURL : this.userURL);

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
        if (e === FLAT) {
            AppActions.setLocalState(this.props.ctx, {isVR: false,
                                                      isAR: false});
        } else if (e === VR) {
            AppActions.setLocalState(this.props.ctx, {isVR: true,
                                                      isAR: false});
        } else if (e === AR) {
            AppActions.setLocalState(this.props.ctx, {isVR: false,
                                                      isAR: true});
        }
    }

    render() {
        const type = this.props.isVR ?
              VR :
              (this.props.isAR ? AR : FLAT);

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
                           cE(rB.Col, {sm: 4, xs: 6},
                              cE(rB.ControlLabel, null, '2D/VR/AR')
                             ),
                           cE(rB.Col, {sm: 4, xs: 6},
                              cE(rB.ToggleButtonGroup, {
                                  type: 'radio',
                                  name : 'isXR',
                                  value: type,
                                  onChange: this.handleIsXR
                              },
                                 cE(rB.ToggleButton, {value: FLAT}, '2D'),
                                 cE(rB.ToggleButton, {value: VR}, 'VR'),
                                 cE(rB.ToggleButton, {value: AR}, 'AR')
                                )
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'urlId'},
                           cE(rB.Col, {sm: 12},
                              cE(rB.FormControl.Static,
                                 {style: {wordWrap: "break-word"}},
                                 this.props.isVR ?
                                 this.vrURL :
                                 (this.props.isAR ? this.arURL :
                                  this.userURL)
                                )
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
