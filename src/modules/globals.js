/***********************
 *  Global Vars
 ***********************/

let mode = process.env.INITIAL_MODE; // Startmodus: "CheckCredit" / "Payment" / "Mark"
let currency = process.env.CURRENCY; // "Stecker-Dollar" / "Euro"
let paymentAccepted = false; // false: phase 1 of payment mode / true: phase 2 of payment mode
let amount = 50; // start amount
let transactionSelection = false; // false: phase 1 of mark mode, true: phase 2 of mark mode
let userTransactions = null; // array of all user transactions
let selectedTransaction = 0; // transaction that is actually shown on display (only phase 2)
let markedTransactionID = null; // transaction that should marked
let tmpUid = null;

module.exports = { mode, currency, paymentAccepted, amount,
    userTransactions, transactionSelection, selectedTransaction, markedTransactionID, tmpUid};