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
}

module.exports = { Actuator };