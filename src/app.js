const LED = require('./modules/leds');
const LCD = require('./modules/lcd');
const RFID = require('./modules/rfid_reader');
const Routes = require('./modules/routes');
const Helper = require('./modules/helper');
const Config = require('./modules/globals');

// Boot Message
LCD.showBootMessage();

// small start delay
setTimeout(function () {

    // Buttons
    const button = require('rpi-gpio-buttons')([5, 7, 29, 31]); // set button pins
    button.setTiming({pressed: 1500, debounce: 10}); // set timing value for pressed event

    // Button Mapping
    button.on('clicked', function (pin) {
        switch (pin) {
            case 5: // + Button
                if (Config.mode === "CheckCredit" || (Config.mode === "Mark" && !Config.transactionSelection && !Config.markedTransactionID)) {
                    payMode();
                }
                else if (Config.mode === "Payment" && !Config.paymentAccepted && Config.amount < process.env.TRANSAKTION_CURRENCY_LIMIT) {
                    Config.paymentAccepted = false;
                    Config.amount += 50;
                    console.log("Betrag: " + Helper.currencyConverter(Config.amount, Config.currency, false));
                    LCD.printMessage("Bezahlung", "Betrag: " + Helper.currencyConverter(Config.amount, Config.currency, false));
                }
                else if (Config.mode === "Mark" && Config.transactionSelection){
                    if(Config.selectedTransaction < Config.userTransactions.length-1){
                        Config.selectedTransaction++;
                        Routes.showSelectedUserTransaction();
                    }
                }
                break;
            case 7: // - Button
                if (Config.mode === "CheckCredit" || (Config.mode === "Mark" && !Config.transactionSelection && !Config.markedTransactionID)) {
                    payMode();
                }
                else if (Config.mode === "Payment" && !Config.paymentAccepted && Config.amount > 50) {
                    Config.paymentAccepted = false;
                    Config.amount -= 50;
                    console.log("Betrag: " + Helper.currencyConverter(Config.amount, Config.currency, false));
                    LCD.printMessage("Bezahlung", "Betrag: " + Helper.currencyConverter(Config.amount, Config.currency, false));
                }
                else if (Config.mode === "Mark" && Config.transactionSelection){
                    if(Config.selectedTransaction > 0){
                        Config.selectedTransaction--;
                        Routes.showSelectedUserTransaction();
                    }
                }
                break;
            case 29: // OK Button
                if (Config.mode === "Payment" && !Config.paymentAccepted && Config.amount > 0) {
                    console.log(Helper.currencyConverter(Config.amount, Config.currency, false) + " buchen?");
                    LCD.printMessage("Bezahlung", Helper.currencyConverter(Config.amount, Config.currency, false) + " buchen?");
                    Config.paymentAccepted = true;
                }
                else if (Config.mode === "Payment" && Config.paymentAccepted) {
                    console.log("Betrag bestätigt. Bitte Transponder an das Terminal halten.");
                    RFID.startDetection(Config.mode);
                }
                else if (Config.mode === "Mark" && Config.transactionSelection) {
                    Config.transactionSelection = false;
                    console.log("Soll Transaktion wirklich markiert werden?");
                    LCD.printMessage("Trans. wirklich", "markieren?");
                }
                else if (Config.mode === "Mark" && !Config.transactionSelection && Config.markedTransactionID) {
                    Routes.markUserTransaction(Config.tmpUid, Config.markedTransactionID);
                }
                break;
            case 31: // Markierenmodus/ Abbrechen Button
                if(Config.mode === "CheckCredit"){
                    cancelMode();
                }
                else if (Config.mode === "Payment" && !Config.paymentAccepted) {
                    cancelMode();
                }
                else if (Config.mode === "Payment" && Config.paymentAccepted) {
                    Config.paymentAccepted = false;
                    console.log("Betrag: " + Helper.currencyConverter(Config.amount, Config.currency, false));
                    LCD.printMessage("Bezahlung", "Betrag: " + Helper.currencyConverter(Config.amount, Config.currency, false));
                    setTimeout(function () {
                        LED.turnOnLED_PayMode(false);
                    },500);
                }
                else if (Config.mode === "Mark" && (!Config.userTransactions || Config.transactionSelection)) {
                    cancelMode();
                    setTimeout(function () {
                        LED.turnOnLED_CreditMode(false);
                    },500);
                }
                else if (Config.mode === "Mark" && !Config.transactionSelection) {
                    Config.transactionSelection = true;
                    LCD.lcd.clear();
                    Routes.showSelectedUserTransaction();
                }
                break;
        }
    });

    button.on('pressed', function (pin) {
        switch (pin) {
            case 5: // + Button
                if (Config.mode === "Payment" && !Config.paymentAccepted) {
                    Config.paymentAccepted = false;
                    Config.amount = 1000; // max. value
                    console.log("Betrag: " + Helper.currencyConverter(Config.amount, Config.currency, false));
                    LCD.printMessage("Bezahlung", "Betrag: " + Helper.currencyConverter(Config.amount, Config.currency, false));
                }
                break;
            case 7: // - Button
                if (Config.mode === "Payment" && !Config.paymentAccepted) {
                    Config.paymentAccepted = false;
                    Config.amount = 50; // min. value
                    console.log("Betrag: " + Helper.currencyConverter(Config.amount, Config.currency, false));
                    LCD.printMessage("Bezahlung", "Betrag: " + Helper.currencyConverter(Config.amount, Config.currency, false));
                }
                break;
            case 31: // Markierenmodus/ Abbrechen Button
                markMode();
                break;
        }
    });

    /***********************
     *  Start program
     ***********************/
    function startProgram() {
        console.log("Applikation gestartet");
        RFID.startDetection(Config.mode);
    }

    startProgram();

    /***********************
     *  Bezahlen Modus
     ***********************/

    function payMode() {
        console.log("Bezahlen-Modus");
        console.log("Betrag: " + Helper.currencyConverter(Config.amount, Config.currency));

        Config.mode = "Payment";
        Config.amount = 50;
        RFID.stopDetection();
        LED.turnOnLED_PayMode(false);
        LCD.printMessage("Bezahlung", "Betrag: " + Helper.currencyConverter(Config.amount, Config.currency));
    }

    /***********************
     *  Markieren Modus
     ***********************/

    function markMode() {
        console.log("Markieren-Modus");
        Config.mode = "Mark";

        RFID.startDetection(Config.mode);
    }

    /***********************
     *  Abbrechen Modus
     ***********************/

    function cancelMode() {
        console.log("Abbruch");
        Config.mode = "CheckCredit";

        RFID.startDetection(Config.mode);
    }
},2000);