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

const myUtils = require('caf_iot').caf_components.myUtils;
const colorUtil = require('./colorUtil');

const cleanupDeviceInfo = function(devices) {
    const result = {};
    Object.keys(devices).forEach((x) => {
        result[x] = {
            uuid: devices[x].uuid,
            advertisement: myUtils.deepClone(devices[x].advertisement)
        };
    });
    return result;
};

const UPPER_BITS_MASK = 0xFF00;
const LOWER_BITS_MASK = 0xFF;

const patchUInt16 = function(buf, offset, val) {
    const lowerBits = val & LOWER_BITS_MASK;
    const upperBits = (val & UPPER_BITS_MASK)>>>8;
    // Little Endian...
    buf[offset] = lowerBits;
    buf[offset+1] = upperBits;
};

exports.methods = {
    async __iot_setup__() {
        // Example of how to store device state in the cloud, i.e.,
        // the value of `index` from last run downloaded from the cloud.
        const lastIndex = this.toCloud.get('index');
        this.state.index = (lastIndex ? lastIndex : 0);

        this.state.index = 0;
        this.scratch.devices = {};
        this.state.selectedDevice = null;
        this.state.devicesInfo = {};
        return [];
    },

    async __iot_loop__() {
        this.$.log && this.$.log.debug(
            'Time offset ' +
                (this.$.cloud.cli && this.$.cloud.cli.getEstimatedTimeOffset())
        );

        this.toCloud.set('index', this.state.index);
        this.state.index = this.state.index + 1;

        const now = (new Date()).getTime();
        this.$.log && this.$.log.debug(now + ' loop: ' + this.state.index);

        if (!myUtils.deepEqual(this.toCloud.get('devices'),
                               this.state.devicesInfo)) {
            this.toCloud.set('devices', this.state.devicesInfo);
        }

        return [];
    },

    async __iot_error__(err) {
        const now = (new Date()).getTime();
        this.$.log && this.$.log.warn(now +  ': Got exception: ' +
                                      myUtils.errToPrettyStr(err));
        const serializableError = JSON.parse(myUtils.errToStr(err));
        serializableError.message = serializableError.error ?
            serializableError.error.message :
            'Cannot Perform Bluetooth Operation';

        await this.$.cloud.cli.setError(serializableError).getPromise();
        return [];
    },

    async findDevices(config) {
        const now = (new Date()).getTime();
        this.$.log && this.$.log.debug(now + ' findDevices() config:' +
                                       JSON.stringify(config));
        this.state.config = config;

        // forget old devices
        this.scratch.devices = {};
        this.state.devicesInfo = {};

        const services = [config.serviceDiscover, config.serviceControl];
        if (typeof window !== 'undefined') {
            // Wait for user click
            await this.$.gatt.findServicesWeb(
                services, '__iot_foundDevice__', 'confirmScan',
                'afterConfirmScan'
            );
        } else {
            this.$.gatt.findServices(services, '__iot_foundDevice__');
        }
        return [];
    },

    async __iot_foundDevice__(serviceId, device) {
        const services = Array.isArray(serviceId) ?
              serviceId.map(x => x.toLowerCase()) :
              [serviceId.toLowerCase()];

        if (services.includes(this.state.config.serviceDiscover
                              .toLowerCase()) ||
            (services.includes(this.state.config.serviceControl
                               .toLowerCase()))) {
            this.scratch.devices[device.uuid] = device;
            this.state.devicesInfo = cleanupDeviceInfo(this.scratch.devices);
            const state = {devices: this.state.devicesInfo};
            await this.$.cloud.cli.syncState(state).getPromise();
        } else {
            this.$.log && this.$.log.debug(
                'Ignoring device with serviceID: ' +
                    JSON.stringify(serviceId) + ' as opposed to ' +
                    this.state.config.serviceDiscover + ' or ' +
                    this.state.config.serviceControl
            );
        }
        return [];
    },

    async connect(deviceId) {
        this.$.log && this.$.log.debug('Selected device ' + deviceId);
        if (this.state.selectedDevice) {
            // Only one connected device
            await this.disconnect();
        }
        this.state.selectedDevice = deviceId;

        if (this.scratch.devices[deviceId]) {
            try {
                const {characteristics} =
                          await this.$.gatt.findCharacteristics(
                              this.state.config.serviceControl,
                              this.scratch.devices[deviceId],
                              [this.state.config.charLight,
                               this.state.config.charBrightness,
                               this.state.config.charColor]
                          );
                [this.scratch.charLight, this.scratch.charBrightness,
                 this.scratch.charColor] = characteristics;
                const state = {};
                const on = await this.$.gatt.dirtyRead(this.scratch.charLight);
                state.isOn = !!on[0];
                const brightness = await this.$.gatt.dirtyRead(
                    this.scratch.charBrightness
                );
                state.brightness = brightness[0];
                await this.$.cloud.cli.syncState(state).getPromise();
                return [];
            } catch (err) {
                return [err];
            }
        } else {
            this.$.log && this.$.log.debug('select: Ignoring unknown device ' +
                                           deviceId);
            return [];
        }
    },

    async switchLight(isOn) {
        if (this.scratch.charLight) {
            const buf = Uint8Array.from(isOn ? [0x01] : [0x00]);
            this.$.log && this.$.log.debug('switchLight ' +
                                           (isOn ? 'on' : 'off'));
            await this.$.gatt.write(this.scratch.charLight, buf);
        }
        return [];
    },

    async setBrightness(level) {
        if (this.scratch.charBrightness) {
            // level between 1 and 254 for philips hue
            level = colorUtil.clipBrightness(level);
            const buf = Uint8Array.from([level & LOWER_BITS_MASK]);
            this.$.log && this.$.log.debug('setBrightness ' + level);
            await this.$.gatt.write(this.scratch.charBrightness, buf);
        }
        return [];
    },

    async setColorTemperature(level) {
        if (this.scratch.charColor) {
            const buf = Uint8Array.from([0x01, 0x01, 0x01, 0x03, 0x02, 0xc7,
                                         0x01, 0x05, 0x02, 0x01, 0x00]);
            // level between 150 and 500 for philips hue
            level = colorUtil.clipTemperature(level);
            patchUInt16(buf, 5, level);
            this.$.log && this.$.log.debug('setColorTemperature ' + level);
            await this.$.gatt.write(this.scratch.charColor, buf);
        }
        return [];
    },

    async setColor(color) {
        if (this.scratch.charColor) {
            color = colorUtil.clipColor(color);
            const buf = Uint8Array.from([0x01, 0x01, 0x01, 0x04, 0x04,
                                         0x10, 0x27, 0xe2, 0x50,
                                         0x05, 0x02, 0x01, 0x00]);
            const [x, y] = colorUtil.rgbToXY(color.r, color.g, color.b);
            patchUInt16(buf, 5, x);
            patchUInt16(buf, 7, y);
            this.$.log && this.$.log.debug('setColor ' +
                                           JSON.stringify(color));
            await this.$.gatt.write(this.scratch.charColor, buf);
        }
        return [];
    },

    async disconnect() {
        this.$.log && this.$.log.debug('Calling disconnect()');
        const device = this.state.selectedDevice &&
                this.scratch.devices[this.state.selectedDevice];
        if (device) {
            this.$.log && this.$.log.debug('Disconnect device ' +
                                           this.state.selectedDevice);
            await this.$.gatt.disconnect(device);
        }
        this.state.selectedDevice = null;
        return [];
    },

    async reset() {
        this.$.log && this.$.log.debug('Calling reset()');
        await this.disconnect();
        await this.$.gatt.reset();
        this.scratch.devices = {};
        this.state.devicesInfo = {};
        return [];
    }
};
