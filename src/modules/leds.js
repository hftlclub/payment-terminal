/***********************
 *       LED Module
 ***********************/

const Gpio = require('onoff').Gpio;
const blinkIntervalDelay = 1500;
let blinkInterval;

// RGB-LED GPIO Config
const redLED = new Gpio(16, 'out'); // red
const greenLED = new Gpio(20, 'out'); // green
const blueLED = new Gpio(12, 'out'); // blue

// config LED Colors
function turnOnLED_CreditMode(blink){
    turnOnCyanLED(blink);
}

function turnOnLED_PayMode(blink){
    turnOnMagentaLED(blink);
}

function turnOnLED_MarkMode(blink){
    turnOnWhiteLED(blink);
}

function turnOnLED_APISuccess(blink){
    turnOnGreenLED(blink);
}

function turnOnLED_APIError(blink){
    turnOnRedLED(blink);
}

//********************************

/**
 * @param blink: (boolean) permanent or blink light
 */
function turnOnRedLED(blink){
   if(blink){
        blinkInterval = setInterval(function () {
            redLED.writeSync(1);
            greenLED.writeSync(0);
            blueLED.writeSync(0);

            setTimeout(function () {
                redLED.writeSync(0);
                greenLED.writeSync(0);
                blueLED.writeSync(0);
            },blinkIntervalDelay/2);
        },blinkIntervalDelay);
    }
    else{
        clearInterval(blinkInterval);
        redLED.writeSync(1);
        greenLED.writeSync(0);
        blueLED.writeSync(0);
    }
}
/**
 * @param blink: (boolean) permanent or blink light
 */
function turnOnGreenLED(blink){
   if(blink){
        blinkInterval = setInterval(function () {
            redLED.writeSync(0);
            greenLED.writeSync(1);
            blueLED.writeSync(0);

            setTimeout(function () {
                redLED.writeSync(0);
                greenLED.writeSync(0);
                blueLED.writeSync(0);
            },blinkIntervalDelay/2);
        },blinkIntervalDelay);
    }
    else{
        clearInterval(blinkInterval);
        redLED.writeSync(0);
        greenLED.writeSync(1);
        blueLED.writeSync(0);
    }
}
/**
 * @param blink: (boolean) permanent or blink light
 */
function turnOnBlueLED(blink){
    if(blink){
        blinkInterval = setInterval(function () {
            redLED.writeSync(0);
            greenLED.writeSync(0);
            blueLED.writeSync(1);

            setTimeout(function () {
                redLED.writeSync(0);
                greenLED.writeSync(0);
                blueLED.writeSync(0);
            },blinkIntervalDelay/2);
        },blinkIntervalDelay);
    }
    else{
        clearInterval(blinkInterval);
        redLED.writeSync(0);
        greenLED.writeSync(0);
        blueLED.writeSync(1);
    }
}

/**
 * @param blink: (boolean) permanent or blink light
 */
function turnOnMagentaLED(blink){
    if(blink){
        blinkInterval = setInterval(function () {
            redLED.writeSync(1);
            greenLED.writeSync(0);
            blueLED.writeSync(1);

            setTimeout(function () {
                redLED.writeSync(0);
                greenLED.writeSync(0);
                blueLED.writeSync(0);
            },blinkIntervalDelay/2);
        },blinkIntervalDelay);
    }
    else{
        clearInterval(blinkInterval);
        redLED.writeSync(1);
        greenLED.writeSync(0);
        blueLED.writeSync(1);
    }
}

/**
 * @param blink: (boolean) permanent or blink light
 */
function turnOnWhiteLED(blink){
    if(blink){
        blinkInterval = setInterval(function () {
            redLED.writeSync(1);
            greenLED.writeSync(1);
            blueLED.writeSync(1);

            setTimeout(function () {
                redLED.writeSync(0);
                greenLED.writeSync(0);
                blueLED.writeSync(0);
            },blinkIntervalDelay/2);
        },blinkIntervalDelay);
    }
    else {
        clearInterval(blinkInterval);
        redLED.writeSync(1);
        greenLED.writeSync(1);
        blueLED.writeSync(1);
    }
}

/**
 * @param blink: (boolean) permanent or blink light
 */
function turnOnCyanLED(blink){
    if(blink){
        blinkInterval = setInterval(function () {
            redLED.writeSync(0);
            greenLED.writeSync(1);
            blueLED.writeSync(1);

            setTimeout(function () {
                redLED.writeSync(0);
                greenLED.writeSync(0);
                blueLED.writeSync(0);
            },blinkIntervalDelay/2);
        },blinkIntervalDelay);
    }
    else {
        clearInterval(blinkInterval);
        redLED.writeSync(0);
        greenLED.writeSync(1);
        blueLED.writeSync(1);
    }
}

/**
 * @param blink: (boolean) permanent or blink light
 */
function turnOnLightGreenLED(blink){
    if(blink){
        blinkInterval = setInterval(function () {
            redLED.writeSync(1);
            greenLED.writeSync(1);
            blueLED.writeSync(0);

            setTimeout(function () {
                redLED.writeSync(0);
                greenLED.writeSync(0);
                blueLED.writeSync(0);
            },blinkIntervalDelay/2);
        },blinkIntervalDelay);
    }
    else {
        clearInterval(blinkInterval);
        redLED.writeSync(1);
        greenLED.writeSync(1);
        blueLED.writeSync(0);
    }
}

function turnOffLEDs() {
    clearInterval(blinkInterval);

    redLED.writeSync(0);
    greenLED.writeSync(0);
    blueLED.writeSync(0);
}

module.exports = { turnOnLED_APISuccess, turnOnLED_APIError, turnOffLEDs,
    turnOnLED_CreditMode, turnOnLED_PayMode, turnOnLED_MarkMode };