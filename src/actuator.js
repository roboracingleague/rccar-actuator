const Gpio = require('pigpio').Gpio;
const Controller = require('node-pid-controller');

class Actuator {
    constructor(config) {
        this.config = config;
        this.gpio = new Gpio(this.config.pin, {mode: Gpio.OUTPUT}); 
        // initialize to middle
        this.setValue(0); 
        this.setSensorValue(0);
        //
        if (this.config.sensorMode && this.config.sensorMode !== 'none') {
            this.pid = new Controller({
                k_p: 0.25,
                k_i: 0.01,
                k_d: 0.01,
                dt: 0.5
            });
        }  
    }

    setRemapMaxValue(value) {
        config.remapValues[1] = value;
    }

    setValue(value) {
        this.value = value;
        if (this.pid) {
            ctr.setTarget(value);
        } else {
            this.gpio.servoWrite(this.remap(this.value));            
        }
    }
    setSensorValue(value) {
        this.sensorValue = value;
    }
    getValue() {
        return this.value;
    }
    remap(value) {
        const remap = this.config.remapValues;
        if (!remap) return value;

        if (value < -1) return remap[0];
        if (value > 1) return remap[1];

        return Math.round(1500 + value * (value < 0 ? 1500 - remap[0] : remap[1] - 1500 ));
    }
    updatePID() {
        let newInput = this.pid.update(value);
        if (this.config.sensorMode === 'invert') newInput = newInput * (-1);
        if (Math.abs(newInput) > this.config.remapPIDMax) newInput = this.config.remapPIDMax;

        this.gpio.servoWrite(this.remap(newInput/this.config.remapPIDMax));
    }
}

module.exports = { Actuator };