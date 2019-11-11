const Gpio = require('pigpio').Gpio;

class Actuator {
    constructor(config) {
        this.config = config;
        if (!this.config.trim) this.config.trim = 0;
        this.gpio = new Gpio(this.config.pin, {mode: Gpio.OUTPUT}); 
        // initialize to middle
        this.setValue(0); 
        this.setSensorValue(0);
    }

    setRemapMaxValue(value) {
        this.config.remapValues[1] = value;
    }
    setRemapMinValue(value) {
        this.config.remapValues[0] = value;
    }
    setTrimValue(value) {
        this.config.trim = value;
        this.setValue(this.value);
    }
    setSensorTargets(value) {
        this.config.sensorTargets = Object.assign(this.config.sensorTargets, value);
    }
    setBreakIntensity(value) {
        this.config.breakIntensity = value;
    }

    setValue(value) {
        this.value = value;
        this.gpio.servoWrite(this.remap(this.value));
    }
    setSensorValue(value) {
        this.sensorValue = value;
    }
    getValue() {
        return this.value;
    }
    remap(value) {
        value = this.applySensorCorrection(value);

        const remap = this.config.remapValues;
        if (!remap) return value;

        if (value < -1) return remap[0];
        if (value > 1) return remap[1];

        return Math.round(1500 + this.config.trim + value * (value < 0 ? 1500 - remap[0] : remap[1] - 1500 ));
    }

    isSensorValueSuperior(target) {
        if (!this.sensorValue) return false;

        return this.config.sensorMode === 'invert' ? this.sensorValue < target : this.sensorValue > target;        
    }
    applySensorCorrection(value) {
        if (!(this.sensorMode !== 'none') || !this.config.sensorTargets) return value;

        const target = this.config.sensorTargets[`_${value.toString().substring(2, 6)}`];
        if (target && this.isSensorValueSuperior(target)) {
            const diff = (target - this.sensorValue) / this.config.breakIntensity;
            value = value - diff;
            if (value < -1) value = -1;
        }
        return value;
    }
}

module.exports = { Actuator };