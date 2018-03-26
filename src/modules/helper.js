/***********************
 *  Helper Module
 ***********************/

function currencyConverter(amount, currency, sign) {
    if(currency === "Euro"){
        if(amount > 0 && sign) {
            return "+" + (amount/100).toFixed(2) + "Eur";
        }
        else {
            return (amount/100).toFixed(2) + "Eur";
        }
    }
    else if(currency === "Stecker-Dollar"){
        if(amount > 0 && sign){
            return "+" + amount/50 + "SD";
        }
        else{
            return amount/50 + "SD";
        }
    }
}

function formatDate(date) {
    let newDate = new Date(date);

    let hour = addZero(newDate.getHours());
    let minutes = addZero(newDate.getMinutes());
    let day = addZero(newDate.getDate());
    let month = addZero(newDate.getMonth() + 1);
    let year = addZero(newDate.getFullYear());

    return day + '.' + month + '.' + year + ',' + hour + '.' + minutes;
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

//export all functions
module.exports = { currencyConverter, formatDate };