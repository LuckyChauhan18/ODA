const { google } = require('googleapis');

const cleanEnvVar = (val) => {
  if (!val) return '';
  let cleaned = val.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
};

const getSheetsClient = () => {
  const email = cleanEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  const privateKey = cleanEnvVar(process.env.GOOGLE_PRIVATE_KEY);
  const sheetId = cleanEnvVar(process.env.GOOGLE_SHEET_ID);

  if (!email || !privateKey || !sheetId) {
    console.warn('Google Sheets credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID) are not configured in .env. Skipping Google Sheets synchronization.');
    return null;
  }

  // Format private key correctly (rebuild PEM string to be 100% resilient to formatting errors)
  let formattedKey = privateKey.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
  const base64Content = formattedKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');

  const lines = [];
  for (let i = 0; i < base64Content.length; i += 64) {
    lines.push(base64Content.slice(i, i + 64));
  }
  
  formattedKey = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: email,
        private_key: formattedKey,
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

  const sheetId = cleanEnvVar(process.env.GOOGLE_SHEET_ID);

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

  const sheetId = cleanEnvVar(process.env.GOOGLE_SHEET_ID);

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
