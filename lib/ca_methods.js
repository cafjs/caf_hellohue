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
const assert = require('assert');
const caf = require('caf_core');
const caf_comp = caf.caf_components;
const myUtils = caf_comp.myUtils;
const app = require('../public/js/app.js');

const APP_SESSION = 'default'; //main app
const STANDALONE_SESSION = 'standalone'; //main app in standalone mode
const IOT_SESSION = 'iot'; // device
const USER_SESSION = 'user'; // third-party app

const notifyIoT = function(self, msg) {
    self.$.session.notify([msg], IOT_SESSION);
};

// state not needed by clients
const CLEANUP_KEYS = ['acks', 'fullName', 'config', 'trace__iot_sync__',
                      '__ca_version__', '__ca_uid__'];

const PHILIPS_HUE = 'PHILIPS_HUE';
const MAGIC_LIGHT = 'MAGIC_LIGHT';
const SUPPORTED_DEVICES = {PHILIPS_HUE, MAGIC_LIGHT};

const cleanState = (self) => myUtils.deepClone(self.state,
                                               x => CLEANUP_KEYS.includes(x));
const notifyWebApp = function(self, msg) {
    const state = cleanState(self);
    const mySession = self.$.session.getSessionId();
    msg && self.$.log && self.$.log.debug(msg);

    (mySession !== APP_SESSION) && self.$.session.notify([state], APP_SESSION);
    (mySession !== STANDALONE_SESSION) &&
        self.$.session.notify([state], STANDALONE_SESSION);
    (mySession !== USER_SESSION) &&
        self.$.session.notify([state], USER_SESSION);
};

const doBundle = function(self, command, ...args) {
    const bundle = self.$.iot.newBundle();
    if (args.length === 0) {
        bundle[command](0);
    } else {
        bundle[command](0, args);
    }
    self.$.iot.sendBundle(bundle, self.$.iot.NOW_SAFE);
    notifyIoT(self, command);
};

const stripDashes = function(str) {
    return (typeof str === 'string') ?
        str.split('-').join('') :
        str;
};

exports.methods = {
    // Methods called by framework
    async __ca_init__() {
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        this.$.session.limitQueue(1, STANDALONE_SESSION); // ditto
        this.$.session.limitQueue(1, IOT_SESSION); // ditto
        this.$.session.limitQueue(1, USER_SESSION); // ditto

        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();

        // methods called by the iot device
        this.state.trace__iot_sync__ = '__ca_traceSync__';

        // example config
        this.state.config = {};

        Object.keys(SUPPORTED_DEVICES).forEach(x => {
            const device = this.$.props[x];
            this.state.config[x] = {
                serviceDiscover: stripDashes(device.serviceDiscover),
                serviceControl: stripDashes(device.serviceControl),
                charLight: stripDashes(device.charLight),
                charBrightness: stripDashes(device.charBrightness),
                charColor: stripDashes(device.charColor)
            };
        });

        // example initial state
        this.state.devices = {};
        this.state.selectedDevice = null;
        this.state.daemon = 0;

        this.state.color = {r: 255, g: 255, b: 255};
        this.state.colorTemperature = 0;
        this.state.isOn = false;
        this.state.isColor = false;
        this.state.brightness = 0;
        this.state.error = null;
        this.state.deviceType = this.$.props.defaultDeviceType;

        return [];
    },

    async __ca_pulse__() {
        this.$.log && this.$.log.debug('calling PULSE!!! ');
        this.$.react.render(app.main, [this.state]);
        return [];
    },

    //External methods

    async hello(key, tokenStr) {
        tokenStr && this.$.iot.registerToken(tokenStr);
        key && this.$.react.setCacheKey(key);
        return this.getState();
    },

    // Example external methods

    /* Typical lifecycle:
     *
     * 1 Find devices exporting a service.
     * 2 Connect to one of them and start listening to device notifications,
     *  e.g., heart beat rates....
     * 3 Do some device operation, e.g., start blinking or stop blinking.
     * 4 Disconnect from device stopping notifications
     */

    async findDevices() {
        this.state.selectedDevice && this.disconnect(); // #devices <= 1
        doBundle(this, 'findDevices',
                 this.state.deviceType || this.$.props.defaultDeviceType,
                 this.state.config);
        notifyWebApp(this, 'Finding device');
        return this.getState();
    },

    async connect(deviceId, deviceAd) {
        if (this.state.devices[deviceId]) {
            this.state.selectedDevice = {id: deviceId, ad: deviceAd};
            doBundle(this, 'connect', deviceId);
            notifyWebApp(this, 'Connecting device');
            return this.getState();
        } else {
            const err = new Error('Cannot connect, device missing');
            err.deviceId = deviceId;
            return [err];
        }
    },

    async disconnect() {
        doBundle(this, 'disconnect');
        this.state.selectedDevice = null;
        notifyWebApp(this, 'Disconnecting device');
        return this.getState();
    },

    async reset() {
        doBundle(this, 'reset');
        this.state.selectedDevice = null;
        notifyWebApp(this, 'Resetting');
        return this.getState();
    },

    async switchLight(isOn) {
        assert(typeof isOn === 'boolean', 'isOn not boolean');
        this.state.isOn = isOn;
        doBundle(this, 'switchLight', isOn, cleanState(this));
        notifyWebApp(this, 'New inputs');
        return this.getState();
    },

    async setDeviceType(deviceType) {
        if (!SUPPORTED_DEVICES[deviceType]) {
            const err = new Error('Device type not supported');
            err.deviceType = deviceType;
            err.supportedDevices = SUPPORTED_DEVICES;
            return [err];
        } else {
            this.state.deviceType = deviceType;
            notifyWebApp(this, 'New device type');
            return this.getState();
        }
    },

    async setBrightness(level) {
        assert(typeof level === 'number', 'level not a number');
        this.state.brightness = level;
        doBundle(this, 'setBrightness', level, cleanState(this));
        notifyWebApp(this, 'New inputs');
        return this.getState();
    },

    async setColorTemperature(level) {
        assert(typeof level === 'number', 'level not a number');
        this.state.colorTemperature = level;
        this.state.isColor = false;
        doBundle(this, 'setColorTemperature', level, cleanState(this));
        notifyWebApp(this, 'New inputs');
        return this.getState();
    },

    async setColor(color) {
        assert(typeof color.r === 'number', 'r not a number');
        assert(typeof color.g === 'number', 'g not a number');
        assert(typeof color.b === 'number', 'b not a number');
        this.state.color = color;
        this.state.isColor = true;
        doBundle(this, 'setColor', color, cleanState(this));
        notifyWebApp(this, 'New inputs');
        return this.getState();
    },

    async setBrowserDaemon(daemon) {
        const old = this.state.daemon;
        this.state.daemon = daemon;
        return old !== daemon ?
            this.reset() :
            this.getState();
    },

    async setError(error) {
        if (typeof error === 'string') {
            error = JSON.parse(error);
        }
        error && assert(typeof error === 'object' &&
                        typeof error.message === 'string',
                        'error.message not a string');
        this.state.error = error;
        notifyWebApp(this, 'New Errors');
        return this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, this.state];
    },

    // Methods called by the IoT device

    // sync state during device initialization.
    async syncState(state) {
        if (typeof state.isOn === 'boolean') {
            this.state.isOn = state.isOn;
        }
        if (typeof state.brightness === 'number') {
            this.state.brightness = state.brightness;
        }
        if (typeof state.colorTemperature === 'number') {
            this.state.colorTemperature = state.colorTemperature;
        }
        if (state.color && (typeof state.color === 'object')) {
            this.state.color = state.color;
        }
        if (state.devices && (typeof state.devices === 'object')) {
            this.state.devices = state.devices;
        }
        notifyWebApp(this, 'New inputs');
        return this.getState();
    },

    // called when periodically the device contacts the CA
    async __ca_traceSync__() {
        const $$ = this.$.sharing.$;
        const now = (new Date()).getTime();
        this.$.log.debug(this.state.fullName + ':Syncing!!:' + now);
        const oldDevices = this.state.devices;
        this.state.devices = $$.toCloud.get('devices');

        if (this.state.selectedDevice &&
            !this.state.devices[this.state.selectedDevice.id]) {
            // Invariant: `selectedDevice` is always visible to the device
            this.state.selectedDevice = null;
        }

        if (!myUtils.deepEqual(oldDevices, this.state.devices)) {
            notifyWebApp(this, 'New inputs');
        }

        return [];
    }
};

caf.init(module);
