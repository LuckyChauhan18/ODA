const { google } = require('googleapis');

/**
 * Loads credentials from either:
 *  1. GOOGLE_CREDENTIALS_BASE64 — base64-encoded JSON key file (preferred, avoids newline issues)
 *  2. Individual env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY (fallback)
 */
const getSheetsClient = () => {
  const sheetId = (process.env.GOOGLE_SHEET_ID || '').trim().replace(/^["']|["']$/g, '');

  if (!sheetId) {
    console.warn('GOOGLE_SHEET_ID is not configured. Skipping Google Sheets sync.');
    return null;
  }

  let credentials;

  // Method 1: Base64-encoded full JSON key file (most reliable)
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    try {
      const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64.trim(), 'base64').toString('utf8');
      credentials = JSON.parse(decoded);
      console.log('Google Sheets: Loaded credentials from GOOGLE_CREDENTIALS_BASE64');
    } catch (err) {
      console.error('Failed to decode GOOGLE_CREDENTIALS_BASE64:', err.message);
      return null;
    }
  }

  // Method 2: Individual env vars (fallback)
  if (!credentials) {
    const email = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim().replace(/^["']|["']$/g, '');
    let privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').trim().replace(/^["']|["']$/g, '');

    if (!email || !privateKey) {
      console.warn('Google Sheets credentials not configured. Skipping sync.');
      return null;
    }

    // Normalize PEM key
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    const base64Body = privateKey
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s+/g, '');
    const lines = [];
    for (let i = 0; i < base64Body.length; i += 64) {
      lines.push(base64Body.slice(i, i + 64));
    }
    privateKey = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;

    credentials = { client_email: email, private_key: privateKey };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error creating Google Sheets auth client:', error);
    return null;
  }
};

/**
 * Appends a new order row to the Google Sheet
 */
const syncOrderToSheet = async (order, user) => {
  const sheets = getSheetsClient();
  if (!sheets) return;

  const sheetId = (process.env.GOOGLE_SHEET_ID || '').trim().replace(/^["']|["']$/g, '');

  const address = `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}, ${order.shippingAddress.country}`;
  const items = order.orderItems.map((item) => `${item.name} (x${item.quantity})`).join(', ');

  const rowValues = [
    order._id.toString(),
    new Date(order.createdAt).toLocaleString(),
    user.name,
    user.email,
    address,
    items,
    `Rs. ${order.totalPrice.toLocaleString()}`,
    order.paymentMethod,
    order.status,
  ];

  try {
    // Check if the sheet is empty to write headers
    const currentValues = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A1:A1',
    });

    if (!currentValues.data.values || currentValues.data.values.length === 0) {
      const headers = [
        'Order ID',
        'Date/Time',
        'Customer Name',
        'Customer Email',
        'Shipping Address',
        'Items Ordered',
        'Total Price',
        'Payment Method',
        'Status'
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'A1:I1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers],
        },
      });
    }

    // Append the row values
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A:I',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });
    console.log(`Order ${order._id} synchronized to Google Sheets successfully.`);
  } catch (error) {
    console.error('Failed to append order to Google Sheet:', error);
  }
};

/**
 * Updates the status of an existing order in the Google Sheet
 */
const updateOrderInSheet = async (orderId, newStatus) => {
  const sheets = getSheetsClient();
  if (!sheets) return;

  const sheetId = (process.env.GOOGLE_SHEET_ID || '').trim().replace(/^["']|["']$/g, '');

  try {
    // First, find the row of the order
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A:A',
    });

    const rows = response.data.values;
    if (!rows) return;

    // Find row index (0-indexed, but Google Sheets ranges are 1-indexed)
    const rowIndex = rows.findIndex((row) => row[0] === orderId.toString());
    if (rowIndex === -1) {
      console.warn(`Order ID ${orderId} not found in Google Sheets. Cannot update status.`);
      return;
    }

    const sheetRowNumber = rowIndex + 1;

    // Update Status column (Column I, which is the 9th column)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `I${sheetRowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newStatus]],
      },
    });
    console.log(`Order ${orderId} status updated to '${newStatus}' in Google Sheets.`);
  } catch (error) {
    console.error('Failed to update order status in Google Sheet:', error);
  }
};

module.exports = {
  syncOrderToSheet,
  updateOrderInSheet,
};
