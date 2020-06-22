# Caf.js

Co-design permanent, active, stateful, reliable cloud proxies with your web app and devices.

See https://www.cafjs.com

## Hello Hue

Controlling a Philips Hue Bluetooth Color bulb with just a browser that supports the Web Bluetooth API, e.g., Chrome. Share a URL for remote and simultaneous interactions with the bulb.

Note that for security reasons the Philips Hue bulb will not allow more than one client pairing and bonding with it at the same time. Therefore, in order to change bridging devices, use the official app to force pairing, update firmware (highly recommended), and then reset to factory settings the bulb.

You may need to plug/unplug the bulb to make it discoverable.

After reset there are no previous keys and your phone/Raspberry PI/... will be able to pair and bond.

Thankfully, it seems that the official app can always brute force pairing and do a full reset. May be there is some magic key hard wired in the firmware :-)

See https://support.google.com/googlenest/thread/21899999?hl=en for details.
