/***********************
 *  LCD Display Module
 ***********************/

let Lcd = require('lcd'),
    lcd = new Lcd({
        rs: 27, // means GPIO Pin 27 (not Pin 27)
        e: 24,
        data: [23, 17, 18, 22],
        cols: 8,
        rows: 2
    });

function showBootMessage() {
    lcd.on('ready', function() {
        lcd.setCursor(0, 1);
        lcd.print("booting");
        for(let i = 1; i <= 3; i++){
            setTimeout(function(){
               lcd.print(".")
            },500*i);
        }
    });
}

function printMessage(messageL1, messageL2) {
    lcd.clear(function () {
        lcd.setCursor(0, 0);
        lcd.print(messageL1, function (err) {
            if (err) {
                throw err;
            }

        lcd.setCursor(0, 1);
        lcd.print(messageL2, function (err) {
            if (err) {
                throw err;
            }
        });
        });
    });
}

// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', function() {
    lcd.clear();
    lcd.close();
    process.exit();
});

//export all functions
module.exports = { lcd, showBootMessage, printMessage };