'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const urlParser = require('url');

class DisplayAR extends React.Component {

    constructor(props) {
        super(props);
        this.doDismissAR = this.doDismissAR.bind(this);

        if ((typeof window !== "undefined") &&
            window.location && window.location.href) {
            const myURL = urlParser.parse(window.location.href);
            myURL.pathname = '/ar/index.html';
            myURL.hash = myURL.hash.replace('session=default', 'session=ar');
            myURL.hash = myURL.hash.replace('session=standalone',
                                            'session=ar');
            delete myURL.search; // delete cacheKey
            this.arURL = urlParser.format(myURL);
        }
    }

    doDismissAR(ev) {
        AppActions.setLocalState(this.props.ctx, {displayAR: false});
    }

    render() {
        return cE(rB.Modal, {show: !!this.props.displayAR,
                             onHide: this.doDismissAR,
                             animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-warning text-warning',
                      closeButton: true},
                     cE(rB.Modal.Title, null, 'AR View')
                    ),
                  cE(rB.ModalBody, null,
                     !this.props.inIFrame && !!this.props.displayAR ?
                     cE('iframe', {
                         frameBorder: 0,
                         scrolling: 'no',
                         allow: 'xr-spatial-tracking',
                         allowFullScreen: true,
                         src: this.arURL
                     }, null) :
                     cE('div', null)
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doDismissAR}, 'Continue')
                    )
                 );
    }
};

module.exports = DisplayAR;
