/***********************
 *  RFID Reader Module
 ***********************/

const mfrc522 = require("mfrc522-rpi");
mfrc522.initWiringPi(0); // Init WiringPi with SPI Channel 0

module.exports = { startDetection, stopDetection };

const LED = require('./leds');
const LCD = require('./lcd');
const Routes = require('./routes');
const Config = require('./globals');

let interval;
function detection() {

    if (interval) {
        stopDetection();
    }

    if(Config.mode === "CheckCredit"){
        LED.turnOnLED_CreditMode(false);
        LCD.lcd.clear();
        LCD.printMessage("Guthabenabfrage", "Warte auf Karte");
    }
    else if(Config.mode === "Payment"){
        LED.turnOnLED_PayMode(true);

        if(Config.paymentAccepted){
            LCD.lcd.clear();
            LCD.printMessage("Bezahlung", "Warte auf Karte");
        }
    }
    else if(Config.mode === "Mark"){
        LED.turnOnLED_MarkMode(true);
        LCD.lcd.clear();
        LCD.printMessage("Trans. markieren", "Warte auf Karte");
    }

    interval = setInterval(function () {

        //# reset card
        mfrc522.reset();

        //# Scan for cards
        let response = mfrc522.findCard();
        if (!response.status) {
            // console.log("No Card");
            return;
        }

        //# Get the UID of the card
        response = mfrc522.getUid();
        if (!response.status) {
            console.log("UID Scan Error");
            return;
        }
        const uid = response.data;

        //# Select the scanned card
        const memoryCapacity = mfrc522.selectCard(uid);

        //# This is the default key for authentication
        const key = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF];

        //# Authenticate on Block 8 with key and uid
        if (!mfrc522.authenticate(8, key, uid)) {
            console.log("Authentication Error");
            return;
        }

        // Generate UID Hex String
        let uidHexString = uid[0].toString(16) + "" + uid[1].toString(16)+ "" + uid[2].toString(16)+ "" + uid[3].toString(16)+ "" + uid[4].toString(16);

        // Generate User-ID String
        let userIDString = "";
        for(let i = 0; i < mfrc522.getDataForBlock(8).length; i++){
            userIDString += mfrc522.getDataForBlock(8)[i];
        }

        // Api Call
        if(Config.mode === "CheckCredit"){
            Routes.checkCredit(uidHexString);
        }
        else if(Config.mode === "Payment"){
            Routes.addTransaction(uidHexString, Config.amount);
        }
        else if(Config.mode === "Mark"){
            Routes.getUserTransactions(uidHexString);
        }

        //# Stop
        mfrc522.stopCrypto();

    },500);
}

function startDetection(){
    detection();
}

function stopDetection(){
    clearInterval(interval);
    LED.turnOffLEDs();
}