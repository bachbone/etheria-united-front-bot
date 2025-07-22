import dotenv from "dotenv";

dotenv.config();

const config = {
  GOOGLE_SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID || "",
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "",
};

export default config;
