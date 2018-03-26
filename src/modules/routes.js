/***********************
 *   API Routes Module
 ***********************/
const request = require('request');
const dotenv = require('dotenv').config();

const LED = require('./leds');
const LCD = require('./lcd');
const RFID = require('./rfid_reader');
const Helper = require('./helper');
const Config = require('./globals');
const ErrString = require('./error_strings');


function checkCredit(uid) {

    RFID.stopDetection();

    const options = {
        url: process.env.PROTOCOL + '://' + process.env.HOST + ':' + process.env.PORT + '/api/card/' + uid,
        method: 'GET',
        headers: {
            'Accept': 'application/x-www-form-urlencoded',
            'Accept-Charset': 'utf-8',
            'Terminal': process.env.TERMINAL
        }
    };


    request(options, function (err, res, body) {

        if (!err && res !== undefined) {

            let json = JSON.parse(body);

            // Error
            if (json.status === false) {
                errorHandling(json.message);
                LED.turnOnLED_APIError(false);
            }
            // Success
            else if (json.status === true) {
                console.log("Guthaben: " + Helper.currencyConverter(json.data, Config.currency, false));

                LCD.printMessage("Dein Guthaben: ", Helper.currencyConverter(json.data, Config.currency, false));
                LED.turnOnLED_APISuccess(false);
            }
        }
        else{
            console.log(err);

            LCD.printMessage("Error: API", "Connect. pruefen");
            LED.turnOnLED_APIError(false);
        }

        // Restart Detection
        setTimeout(function () {
            LCD.lcd.clear();
            RFID.startDetection();
        }, 2500);
    });
}

function addTransaction(uid) {

    RFID.stopDetection();

    const options = {
        url: process.env.PROTOCOL + '://' + process.env.HOST + ':' + process.env.PORT + '/api/transaction/pay',
        method: 'POST',
        headers: {
            'Accept': 'application/x-www-form-urlencoded',
            'Accept-Charset': 'utf-8',
            'Terminal': process.env.TERMINAL
        },
        form: {
            credits: "-" + Config.amount,
            cardUID: uid
        }
    };
    
    request(options, function (err, res, body) {
        if (!err && res !== undefined) {
            let json = JSON.parse(body);
    
            // Error
            if (json.status === false) {
                errorHandling(json.message);
                setTimeout(function () {
                    LED.turnOnLED_APIError(false);
                },100);
    
                Config.mode = "Payment"; // don't leave paymode
            }
            // Success
            else if (json.status === true) {
                console.log("Bezahlung erfolgreich");
                console.log("verbleibendes Guthaben " + Helper.currencyConverter(json.data, Config.currency, false));
                LCD.printMessage("Bez. erfolgreich ", "Guthaben: " + Helper.currencyConverter(json.data, Config.currency, false));
    
                Config.paymentAccepted = false;
                Config.amount = 50;
                Config.mode = "CheckCredit"; // leave paymode
                LED.turnOnLED_APISuccess(false);
            }
        }
        else{
            console.log(err);
    
            LCD.printMessage("Error: API", "Connect. pruefen");
            LED.turnOnLED_APIError(false);
        }
    
        // Restart Detection
        setTimeout(function () {
            LCD.lcd.clear();
            RFID.startDetection();
        }, 3000);
    });
}

function getUserTransactions(uid) {

    RFID.stopDetection();

    const options = {
        url: process.env.PROTOCOL + '://' + process.env.HOST + ':' + process.env.PORT + '/api/card/' + uid  + '/transactions',
        method: 'GET',
        headers: {
            'Accept': 'application/x-www-form-urlencoded',
            'Accept-Charset': 'utf-8',
            'Terminal': process.env.TERMINAL
        }
    };

    request(options, function (err, res, body) {
        if (!err && res !== undefined) {
            let json = JSON.parse(body);

            // Error
            if (json.status === false) {
                errorHandling(json.message);
                LED.turnOnLED_APIError(false);
                
                setTimeout(function () {
                    LED.turnOnLED_MarkMode(true);
                    RFID.startDetection(Config.mode);
                },2000);
            }
            // Success
            else if (json.status === true) {
                LED.turnOnLED_APISuccess(false);

                setTimeout(function () {
                    LED.turnOnLED_MarkMode(false);
                },2000);

                if(json.data.length === 0){
                    console.log("Keine Transaktionen vorhanden")
                }
                else{
                    Config.userTransactions = json.data;
                    Config.transactionSelection = true;
                    Config.tmpUid = uid;
                    showSelectedUserTransaction();
                }
            }
        }
        else{
            console.log(err);

            LCD.printMessage("Error: API", "Connect. pruefen");
            LED.turnOnLED_APIError(false);

            // Restart Detection
            setTimeout(function () {
                RFID.startDetection();
            }, 3000);
        }
    });
}

function markUserTransaction(uid, tid) {

    const options = {
        url: process.env.PROTOCOL + '://' + process.env.HOST + ':' + process.env.PORT + '/api/transaction/' + tid,
        method: 'PATCH',
        headers: {
            'Accept': 'application/x-www-form-urlencoded',
            'Accept-Charset': 'utf-8',
            'Terminal': process.env.TERMINAL
        }
    };

    request(options, function (err, res, body) {
        if (!err && res !== undefined) {
            let json = JSON.parse(body);

            // Error
            if (json.status === false) {
                errorHandling(json.message);
                LED.turnOnLED_APIError(false);

                setTimeout(function () {
                    LED.turnOnLED_MarkMode(false);
                    Config.transactionSelection = true;
                },2000);
            }
            // Success
            else if (json.status === true) {
                LED.turnOnLED_APISuccess(false);

                LED.turnOnLED_APISuccess(false);
                LCD.printMessage("Trans. erfolgr.", "markiert");

                setTimeout(function () {
                    // show transaction selection again
                    Config.transactionSelection = true;
                    showSelectedUserTransaction();
                    LED.turnOnLED_MarkMode(false);
                },2000);
            }
        }
        else{
            console.log(err);

            LCD.printMessage("Error: API", "Connect. pruefen");
            LED.turnOnLED_APIError(false);

            // Restart Detection
            setTimeout(function () {
                LCD.lcd.clear();
                RFID.startDetection();
            }, 3000);
        }
    });
}

function showSelectedUserTransaction() {
    Config.markedTransactionID = Config.userTransactions[Config.selectedTransaction].ID;
    LCD.printMessage(Helper.formatDate(Config.userTransactions[Config.selectedTransaction].Date), Helper.currencyConverter(Config.userTransactions[Config.selectedTransaction].Value, Config.currency, true));
}

function errorHandling(errno) {

    if(errno) {
        console.log(errno);

        /*General Error*/
        if(errno.search(/errno:2000/i) !== -1){
            LCD.printMessage(ErrString.general["2000"][1], ErrString.general["2000"][2]);
        }
        else if(errno.search(/errno:2001/i) !== -1){
            LCD.printMessage(ErrString.general["2001"][1], ErrString.general["2001"][2]);
        }
        else if(errno.search(/errno:2002/i) !== -1){
            LCD.printMessage(ErrString.general["2002"][1], ErrString.general["2002"][2]);
        }
        else if(errno.search(/errno:2003/i) !== -1){
            LCD.printMessage(ErrString.general["2003"][1], ErrString.general["2003"][2]);
        }
        else if(errno.search(/errno:2004/i) !== -1){
            LCD.printMessage(ErrString.general["2004"][1], ErrString.general["2004"][2]);
        }
        else if(errno.search(/errno:2005/i) !== -1){
            LCD.printMessage(ErrString.general["2005"][1], ErrString.general["2005"][2]);
        }

        /*Database Error*/
        else if(errno.search(/errno:3000/i) !== -1){
            LCD.printMessage(ErrString.database["3000"][1], ErrString.database["3000"][2]);
        }

        /*Card Error*/
        else if(errno.search(/errno:4000/i) !== -1){
            LCD.printMessage(ErrString.card["4000"][1], ErrString.card["4000"][2]);
        }
        else if(errno.search(/errno:4001/i) !== -1){
            LCD.printMessage(ErrString.card["4001"][1], ErrString.card["4001"][2]);
        }
        else if(errno.search(/errno:4002/i) !== -1){
            LCD.printMessage(ErrString.card["4002"][1], ErrString.card["4002"][2]);
        }
        else if(errno.search(/errno:4003/i) !== -1){
            LCD.printMessage(ErrString.card["4003"][1], ErrString.card["4003"][2]);
        }
        else if(errno.search(/errno:4004/i) !== -1){
            LCD.printMessage(ErrString.card["4004"][1], ErrString.card["4004"][2]);
        }
        else if(errno.search(/errno:4005/i) !== -1){
            LCD.printMessage(ErrString.card["4005"][1], ErrString.card["4005"][2]);
        }

        /*User Error*/
        else if(errno.search(/errno:5000/i) !== -1){
            LCD.printMessage(ErrString.user["5000"][1], ErrString.user["5000"][2]);
        }
        else if(errno.search(/errno:5001/i) !== -1){
            LCD.printMessage(ErrString.user["5001"][1], ErrString.user["5001"][2]);
        }
        else if(errno.search(/errno:5002/i) !== -1){
            LCD.printMessage(ErrString.user["5002"][1], ErrString.user["5002"][2]);
        }
        else if(errno.search(/errno:5003/i) !== -1){
            LCD.printMessage(ErrString.user["5003"][1], ErrString.user["5003"][2]);
        }
        else if(errno.search(/errno:5004/i) !== -1){
            LCD.printMessage(ErrString.user["5004"][1], ErrString.user["5004"][2]);
        }
        else if(errno.search(/errno:5005/i) !== -1){
            LCD.printMessage(ErrString.user["5005"][1], ErrString.user["5005"][2]);
        }

        /*Terminal Error*/
        else if(errno.search(/errno:6000/i) !== -1){
            LCD.printMessage(ErrString.terminal["6000"][1], ErrString.terminal["6000"][2]);
        }
        else if(errno.search(/errno:6001/i) !== -1){
            LCD.printMessage(ErrString.terminal["6001"][1], ErrString.terminal["6001"][2]);
        }
        else if(errno.search(/errno:6002/i) !== -1){
            LCD.printMessage(ErrString.terminal["6002"][1], ErrString.terminal["6002"][2]);
        }
        else if(errno.search(/errno:6003/i) !== -1){
            LCD.printMessage(ErrString.terminal["6003"][1], ErrString.terminal["6003"][2]);
        }
        else if(errno.search(/errno:6004/i) !== -1){
            LCD.printMessage(ErrString.terminal["6004"][1], ErrString.terminal["6004"][2]);
        }
        else if(errno.search(/errno:6005/i) !== -1){
            LCD.printMessage(ErrString.terminal["6005"][1], ErrString.terminal["6005"][2]);
        }


        /*Terminal Error*/
        else if(errno.search(/errno:7000/i) !== -1){
            LCD.printMessage(ErrString.transaction["7000"][1], ErrString.transaction["7000"][2]);
        }
        else if(errno.search(/errno:7001/i) !== -1){
            LCD.printMessage(ErrString.transaction["7001"][1], ErrString.transaction["7001"][2]);
        }
        else if(errno.search(/errno:7002/i) !== -1){
            LCD.printMessage(ErrString.transaction["7002"][1], ErrString.transaction["7002"][2]);
        }
        else if(errno.search(/errno:7003/i) !== -1){
            LCD.printMessage(ErrString.transaction["7003"][1], ErrString.transaction["7003"][2]);
        }
        else if(errno.search(/errno:7004/i) !== -1){
            LCD.printMessage(ErrString.transaction["7004"][1], ErrString.transaction["7004"][2]);
        }
        else if(errno.search(/errno:7005/i) !== -1){
            LCD.printMessage(ErrString.transaction["7005"][1], ErrString.transaction["7005"][2]);
        }
        else if(errno.search(/errno:7006/i) !== -1){
            LCD.printMessage(ErrString.transaction["7006"][1], ErrString.transaction["7006"][2]);
        }
        else if(errno.search(/errno:7007/i) !== -1){
            LCD.printMessage(ErrString.transaction["7007"][1], ErrString.transaction["7007"][2]);
        }

        /*else*/
        else {
            LCD.printMessage("Error", "");
        }
    }
    else{
        LCD.printMessage("Error: ", "kein Fehlercode");
    }
}

//export all functions
module.exports = { checkCredit, addTransaction, getUserTransactions, markUserTransaction, showSelectedUserTransaction };