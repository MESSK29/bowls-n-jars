# Easiest Google Sheets Setup (No Billing Account Required)

If Google Cloud is asking for billing details and you want to bypass that entirely, the easiest alternative is to use **Google Apps Script**. This method is 100% free, requires no credit cards, and doesn't require setting up a Google Cloud Project.

I have updated your backend to support this method automatically!

## Step 1: Open Your Spreadsheet
1. Open your master Google Spreadsheet: [Customer Call Feedback Spreadsheet](https://docs.google.com/spreadsheets/d/1PVNheYY0oJ943t8u6EX_tCghzb_gylIWBCYLihHyN0Y/edit?usp=sharing).
2. In the top menu bar, click on **Extensions** > **Apps Script**.

## Step 2: Paste the Script
1. A new tab will open with a code editor.
2. Delete any default code inside (like `function myFunction() {}`).
3. Open the `google_apps_script.js` file I just created for you in your project folder.
4. **Copy all the code** from that file and **Paste** it into the Apps Script editor.
5. Click the **Save** icon (the floppy disk) at the top.

## Step 3: Deploy the Script as a Web App
1. In the top right corner of the Apps Script editor, click the blue **Deploy** button > **New deployment**.
2. Click the **Select type** gear icon (⚙️) on the left side of the popup and choose **Web app**.
3. **Description**: `Customer Calls API`
4. **Execute as**: `Me (your email)`
5. **Who has access**: Change this to **Anyone** (This is crucial, otherwise Render can't reach it).
6. Click **Deploy**. 

## Step 4: Authorize and Copy the URL
1. Google will ask you to authorize the script. Click **Authorize access**.
2. Select your Google account.
3. You might see a warning saying "Google hasn't verified this app". Click **Advanced** at the bottom, then click **Go to Untitled project (unsafe)**.
4. Click **Allow**.
5. You will now see a deployment screen with a **Web app URL**. It starts with `https://script.google.com/macros/s/...`.
6. **Copy this Web app URL**.

## Step 5: Put the URL in Render
1. Log in to your **Render** dashboard and go to your Backend Service.
2. Click on **Environment** in the left sidebar.
3. Click **Add Environment Variable**.
4. **Key**: `GOOGLE_APPS_SCRIPT_URL`
5. **Value**: Paste the long Web app URL you just copied.
6. Make sure `GOOGLE_SHEETS_SPREADSHEET_ID` is also there with the value `1PVNheYY0oJ943t8u6EX_tCghzb_gylIWBCYLihHyN0Y`.
7. Click **Save Changes**.

## Step 6: Test It!
1. Go back to your Admin Dashboard.
2. Click **Generate Google Sheet**.
3. Your backend will now talk directly to the spreadsheet using the Web App URL, completely bypassing the Google Cloud Service Account requirement!
