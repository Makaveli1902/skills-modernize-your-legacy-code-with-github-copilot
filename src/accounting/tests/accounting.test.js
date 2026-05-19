"use strict";

// Mock prompt-sync before requiring index.js so interactive prompts are controlled in tests
jest.mock("prompt-sync", () => {
  return () => jest.fn();
});

const promptSync = require("prompt-sync");
const mockPrompt = promptSync();

// Reset module registry before each test to restore storageBalance to its initial value (1000.00)
beforeEach(() => {
  jest.resetModules();
  jest.mock("prompt-sync", () => {
    return () => mockPrompt;
  });
});

function loadModule() {
  return require("../index.js");
}

// TC-01: View initial balance
test("TC-01: initial balance is 1000.00", () => {
  const { dataProgram } = loadModule();
  expect(dataProgram("READ")).toBe(1000.0);
});

// TC-02: Credit account with valid amount
test("TC-02: credit 200.00 increases balance to 1200.00", () => {
  mockPrompt.mockReturnValueOnce("200.00");
  const { operations, dataProgram } = loadModule();
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  operations("CREDIT");

  expect(dataProgram("READ")).toBe(1200.0);
  expect(consoleSpy).toHaveBeenCalledWith(
    "Amount credited. New balance: 1200.00"
  );

  consoleSpy.mockRestore();
});

// TC-03: Debit account with valid amount (sufficient funds)
test("TC-03: debit 100.00 decreases balance to 900.00", () => {
  mockPrompt.mockReturnValueOnce("100.00");
  const { operations, dataProgram } = loadModule();
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  operations("DEBIT");

  expect(dataProgram("READ")).toBe(900.0);
  expect(consoleSpy).toHaveBeenCalledWith(
    "Amount debited. New balance: 900.00"
  );

  consoleSpy.mockRestore();
});

// TC-04: Debit account with insufficient funds
test("TC-04: debit 2000.00 is rejected with insufficient funds message and balance unchanged", () => {
  mockPrompt.mockReturnValueOnce("2000.00");
  const { operations, dataProgram } = loadModule();
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  operations("DEBIT");

  expect(dataProgram("READ")).toBe(1000.0);
  expect(consoleSpy).toHaveBeenCalledWith("Insufficient funds for this debit.");

  consoleSpy.mockRestore();
});

// TC-05: Multiple credits and debits reflect correct final balance
test("TC-05: multiple operations produce correct final balance", () => {
  // credit 100 → 1100, debit 50 → 1050, credit 200 → 1250, debit 100 → 1150
  mockPrompt
    .mockReturnValueOnce("100.00")
    .mockReturnValueOnce("50.00")
    .mockReturnValueOnce("200.00")
    .mockReturnValueOnce("100.00");

  const { operations, dataProgram } = loadModule();
  jest.spyOn(console, "log").mockImplementation(() => {});

  operations("CREDIT");
  operations("DEBIT");
  operations("CREDIT");
  operations("DEBIT");

  expect(dataProgram("READ")).toBe(1150.0);

  jest.restoreAllMocks();
});

// TC-06: Invalid menu option
test("TC-06: invalid menu option displays error message then exits", () => {
  // First prompt returns invalid choice "5", second returns "4" to exit
  mockPrompt
    .mockReturnValueOnce("5")
    .mockReturnValueOnce("4");

  const { main } = loadModule();
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  main();

  expect(consoleSpy).toHaveBeenCalledWith(
    "Invalid choice, please select 1-4."
  );

  consoleSpy.mockRestore();
});

// TC-07: Exit application
test("TC-07: selecting exit displays goodbye message and terminates", () => {
  mockPrompt.mockReturnValueOnce("4");
  const { main } = loadModule();
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  main();

  expect(consoleSpy).toHaveBeenCalledWith(
    "Exiting the program. Goodbye!"
  );

  consoleSpy.mockRestore();
});
