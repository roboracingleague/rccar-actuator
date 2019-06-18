const Gpio = require('pigpio').Gpio;

class Actuator {
    constructor(config) {
        this.config = config;
        this.gpio = new Gpio(this.config.pin, {mode: Gpio.OUTPUT}); 
        // initialize to middle
        this.setValue(1500);      
    }
    setValue(usValue) {
        this.gpio.servoWrite(usValue);
    }
    remap(value) {
        const remap = this.config.remapValues;
        if (!remap) return value;

        if (value < -1) return remap[0];
        if (value > 1) return remap[1];

        return 1500 + value * (value < 0 ? 1500 - remap[0] : remap[1] - 1500 );
    }
}

module.exports = { Actuator };