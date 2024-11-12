const sheetHeaders = ["Date", "Who", "Amount", "Type", "Detail"];
const sheetHeadersConfig = [
  "Name",
  "Type",
  "Frequency",
  "Amount",
  "Description",
  "Date",
];
const sheetHeadersTransactions = [
  "Date",
  "Category",
  "Type",
  "Account",
  "Description",
  "Amount",
];
const sheetHeadersAccounts = [
  "Account",
  "Initial Amount",
  "Current Amount",
];
const sheetHeadersVariables = [
  "Transaction Types",
  "Categories",
];

const defaultTypes = [];
const docName = "MyBillTracker";
const sheetTitle = "Bills";
const sheetTitleConfig = "Config";
const sheetTitleTransactions = "Transactions";
const sheetTitleAccounts = "Accounts ";
const sheetTitleVariables = "Variables";
const sheetScope = "profile email https://www.googleapis.com/auth/spreadsheets";

export {
  sheetHeaders,
  defaultTypes,
  docName,
  sheetTitle,
  sheetScope,
  sheetTitleConfig,
  sheetHeadersConfig,
  sheetTitleTransactions,
  sheetTitleAccounts,
  sheetTitleVariables,
  sheetHeadersTransactions,
  sheetHeadersAccounts,
  sheetHeadersVariables,
};
