"use strict";

const prompt = require("prompt-sync")({ sigint: true });

let storageBalance = 1000.0;

function toTwoDecimals(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function dataProgram(operationType, balance) {
  if (operationType === "READ") {
    return storageBalance;
  }

  if (operationType === "WRITE") {
    storageBalance = toTwoDecimals(balance);
    return storageBalance;
  }

  return storageBalance;
}

function readAmount(promptLabel) {
  const rawValue = prompt(promptLabel).trim();
  const amount = Number(rawValue);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return toTwoDecimals(amount);
}

function operations(passedOperation) {
  const operationType = passedOperation;

  if (operationType === "TOTAL") {
    const finalBalance = dataProgram("READ");
    console.log(`Current balance: ${finalBalance.toFixed(2)}`);
    return;
  }

  if (operationType === "CREDIT") {
    const amount = readAmount("Enter credit amount: ");

    if (amount === null) {
      console.log("Invalid amount. Please enter a positive number.");
      return;
    }

    const finalBalance = dataProgram("READ");
    const updatedBalance = toTwoDecimals(finalBalance + amount);
    dataProgram("WRITE", updatedBalance);
    console.log(`Amount credited. New balance: ${updatedBalance.toFixed(2)}`);
    return;
  }

  if (operationType === "DEBIT") {
    const amount = readAmount("Enter debit amount: ");

    if (amount === null) {
      console.log("Invalid amount. Please enter a positive number.");
      return;
    }

    const finalBalance = dataProgram("READ");

    if (finalBalance >= amount) {
      const updatedBalance = toTwoDecimals(finalBalance - amount);
      dataProgram("WRITE", updatedBalance);
      console.log(`Amount debited. New balance: ${updatedBalance.toFixed(2)}`);
    } else {
      console.log("Insufficient funds for this debit.");
    }
  }
}

function main() {
  let continueFlag = "YES";

  while (continueFlag !== "NO") {
    console.log("--------------------------------");
    console.log("Account Management System");
    console.log("1. View Balance");
    console.log("2. Credit Account");
    console.log("3. Debit Account");
    console.log("4. Exit");
    console.log("--------------------------------");

    const userChoice = Number(prompt("Enter your choice (1-4): ").trim());

    switch (userChoice) {
      case 1:
        operations("TOTAL");
        break;
      case 2:
        operations("CREDIT");
        break;
      case 3:
        operations("DEBIT");
        break;
      case 4:
        continueFlag = "NO";
        break;
      default:
        console.log("Invalid choice, please select 1-4.");
    }
  }

  console.log("Exiting the program. Goodbye!");
}

if (require.main === module) {
  main();
}

module.exports = { dataProgram, operations, main, toTwoDecimals };
