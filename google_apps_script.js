function doPost(e) {
  try {
    // 1. Parse the incoming JSON payload from the Python backend
    var data = JSON.parse(e.postData.contents);
    var worksheetName = data.worksheet_name;
    var values = data.values;
    
    // 2. Get the active spreadsheet this script is attached to
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(worksheetName);
    
    // 3. Create or clear the worksheet
    if (sheet) {
      sheet.clear();
    } else {
      sheet = ss.insertSheet(worksheetName);
    }
    
    // 4. Write all the data rows
    var numRows = values.length;
    var numCols = values[0].length;
    sheet.getRange(1, 1, numRows, numCols).setValues(values);
    
    // 5. Apply formatting (Bold headers, freeze top row, wrap long text)
    var headerRange = sheet.getRange(1, 1, 1, numCols);
    headerRange.setFontWeight("bold");
    ss.setFrozenRows(1);
    
    // Wrap conversation, feedback, notes, recording, transcript (columns 9 to 16)
    var wrapRange = sheet.getRange(1, 9, numRows, 8);
    wrapRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    
    // 6. Return success URL
    var sheetId = sheet.getSheetId();
    var sheetUrl = ss.getUrl() + "#gid=" + sheetId;
    
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "sheet_id": sheetId,
      "sheet_url": sheetUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
