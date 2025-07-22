import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { format } from "date-fns";

import GOOGLE_SHEETS_CONFIG from "@/config/google-sheets.config";
import { RowData } from "@/types/google-sheets.types";
import MESSAGES from "@/constants/messages.constants";
import {
  UF_SHEET_NAME_PREFIX,
  UF_SHEET_TEMPLATE_NAME,
} from "@/constants/google-sheets.constants";
import { DEFAULT_DATE_FORMAT } from "@/constants/date-formats.constants";
import { constructMessage } from "src/utils/messages.utils";
import { PromiseReturnType } from "@/types/type.types";
import { getStartOfWeekDate } from "@/utils/dates.utils";

class GoogleSheetsService {
  private readonly authClient: JWT = new JWT({
    email: GOOGLE_SHEETS_CONFIG.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_SHEETS_CONFIG.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(
      /\\n/g,
      "\n",
    ),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  public async getClient() {
    return this.authClient;
  }

  public async getSpreadsheet(spreadsheetId: string) {
    const spreadsheet = new GoogleSpreadsheet(spreadsheetId, this.authClient);

    await spreadsheet.loadInfo();

    return spreadsheet;
  }

  public async createUFSheet(spreadsheetId: string): PromiseReturnType<void> {
    const spreadsheet = await this.getSpreadsheet(spreadsheetId);

    const templateSheet = spreadsheet.sheetsByTitle[UF_SHEET_TEMPLATE_NAME];

    if (!templateSheet) {
      return {
        success: false,
        errorMessage: `Template sheet ${UF_SHEET_TEMPLATE_NAME} not found.`,
      };
    }

    const startOfWeek = getStartOfWeekDate();

    const sheetName = `${UF_SHEET_NAME_PREFIX}${format(
      startOfWeek,
      DEFAULT_DATE_FORMAT,
    )}`;

    const sheet = spreadsheet.sheetsByTitle[sheetName];

    if (sheet) {
      return {
        success: false,
        errorMessage: constructMessage(
          MESSAGES.CREATE_UF_SHEET_ALREADY_EXISTS,
          sheetName,
        ),
      };
    }

    await templateSheet.duplicate({
      title: sheetName,
    });

    return {
      success: true,
      data: undefined,
    };
  }

  public async createUFAttackRecord(
    spreadsheet: GoogleSpreadsheet,
    rowData: RowData,
  ): PromiseReturnType<void> {
    const sheet = await this.getWeekUFSheet(spreadsheet);
    
    if (!sheet) {
      return {
        success: false,
        errorMessage: MESSAGES.UF_SHEET_NOT_FOUND,
      };
    }

    const rows = await sheet.getRows();

    const existingRow = rows.find(row => row.get("name") === rowData.name);

    if (existingRow) {
      existingRow.set("attempts", rowData.attempts);
      existingRow.set("date", rowData.date);
      await existingRow.save();
      return {
        success: true,
        data: undefined,
      };
    }

    await sheet.addRow([rowData.name, rowData.attempts, rowData.date]);
    return {
      success: true,
      data: undefined,
    };
  }

  private async getWeekUFSheet(
    spreadsheet: GoogleSpreadsheet,
  ): Promise<GoogleSpreadsheetWorksheet | null> {
    const startOfWeek = getStartOfWeekDate();
    const sheetName = `${UF_SHEET_NAME_PREFIX}${format(
      startOfWeek,
      DEFAULT_DATE_FORMAT,
    )}`;

    const sheet = spreadsheet.sheetsByTitle[sheetName];

    if (!sheet) {
      return null;
    }

    return sheet;
  }
}

export default new GoogleSheetsService();
