const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');

exports.parseBankStatement = async (req, res) => {
  try {
    const pdfInput = req.files?.pdfInput;
    const password = req.body?.password || null;

    if (!pdfInput) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const buffer = fs.readFileSync(pdfInput.tempFilePath);
    const uint8Array = new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      password: password,
      standardFontDataUrl: path.join(__dirname, '../node_modules/pdfjs-dist/standard_fonts/')
    });

    const pdf = await loadingTask.promise;

    let rawText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      rawText += pageText + '\n';
    }

    // DEBUG raw output
    console.log("=== RAW PDF TEXT ===");
    console.log(rawText);

    const lines = rawText.split('\n');
    const transactions = parseTransactionsFromText(rawText);
console.log("Extracted transactions:", transactions);


    // Sample regex: adjust to match your exact PDF format
    // const rowRegex = /(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+(\w*)\s+(\w*)\s+(.*?)\s+([\d,.-]*)\s+([\d,.-]*)\s+([\d,.-]+)/;

    // for (let line of lines) {
    //   const match = line.match(rowRegex);
    //   if (match) {
    //     transactions.push({
    //       postDate: match[1],
    //       txnDate: match[2],
    //       branchCode: match[3] || null,
    //       chequeNumber: match[4] || null,
    //       description: match[5].trim(),
    //       debit: match[6] ? parseFloat(match[6].replace(/,/g, '')) : 0,
    //       credit: match[7] ? parseFloat(match[7].replace(/,/g, '')) : 0,
    //       balance: match[8] ? parseFloat(match[8].replace(/,/g, '')) : 0,
    //     });
    //   }
    // }
    console.log("transaction is : ",transactions)

    return res.status(200).json({
      success: true,
      message: 'PDF parsed successfully',
      transactions,
    });

  } catch (error) {
    console.error("Controller error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// function parseTransactionsFromText(text) {
//   const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
//   const transactions = [];
//   const datePattern = /^\d{2}\/\d{2}\/\d{2,4}$/;

//   for (const line of lines) {
//     const parts = line.split(/\s+/);

//     if (!datePattern.test(parts[0]) || !datePattern.test(parts[1])) {
//       console.log("Skipping line - does not start with two dates:", line);
//       continue;
//     }

//     const postDate = parts[0];
//     const txnDate = parts[1];

//     const numbers = parts.slice(-3).filter(val => /^\d+\.\d{2}$/.test(val));
//     const balance = numbers.length >= 1 ? parseFloat(numbers[numbers.length - 1]) : null;
//     const credit = numbers.length >= 2 ? parseFloat(numbers[numbers.length - 2]) : null;
//     const debit = numbers.length === 3 ? parseFloat(numbers[0]) : (numbers.length === 2 ? null : null);

//     if (debit === null && credit === null) {
//       console.warn("Invalid line - missing both debit and credit:", line);
//       continue;
//     }

//     const remainingParts = parts.slice(2, parts.length - numbers.length);
//     const branchCode = remainingParts[0] || null;
//     const chequeNumber = remainingParts[1] || null;
//     const description = remainingParts.slice(2).join(' ') || null;

//     transactions.push({
//       postDate,
//       txnDate,
//       branchCode,
//       chequeNumber,
//       description,
//       debit,
//       credit,
//       balance
//     });
//   }

//   return transactions;
// }


function parseTransactionsFromText(text) {
  const transactions = [];

  const txnRegex = /(\d{2}\/\d{2}\/\d{2})\s+(\d{2}\/\d{2}\/\d{2})\s+([A-Za-z0-9\/ :.-]{0,50})\s+([A-Za-z0-9\/ :.-]{0,50})\s+([A-Za-z0-9\/ :._-]{0,100})\s+(\d{1,8}\.\d{2})?\s*(\d{1,8}\.\d{2})?\s*(\d{1,8}\.\d{2})/g;

  let match;
  while ((match = txnRegex.exec(text)) !== null) {
    const debit = match[6] ? parseFloat(match[6]) : null;
    const credit = match[7] ? parseFloat(match[7]) : null;

    if (debit === null && credit === null) {
      console.warn("Line with missing debit and credit:", match[0]);
    }

    transactions.push({
      postDate: match[1],
      txnDate: match[2],
      branchCode: match[3]?.trim() || null,
      chequeNumber: match[4]?.trim() || null,
      description: match[5]?.trim() || null,
      debit,
      credit,
      balance: match[8] ? parseFloat(match[8]) : null,
    });
  }

  return transactions;
}








// const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');

// exports.parseBankStatement=async (req,res)=> {
//     const pdfBuffer = req.files?.pdfInput;
//   const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
//   const pdf = await loadingTask.promise;

//   let allRows = [];

//   for (let i = 1; i <= pdf.numPages; i++) {
//     const page = await pdf.getPage(i);
//     const content = await page.getTextContent();

//     const tokens = content.items.map(item => ({
//       text: item.str.trim(),
//       x: item.transform[4],
//       y: item.transform[5],
//     }));

//     // 1. Group tokens into rows by y (vertical position)
//     const rows = groupTokensByY(tokens, 3); // threshold = 3 units

//     // 2. For each row, sort tokens by x (horizontal position)
//     rows.forEach(row => row.sort((a, b) => a.x - b.x));

//     // 3. Map tokens to columns based on their x positions
//     rows.forEach(row => {
//       const mappedRow = mapTokensToColumns(row);
//       allRows.push(mappedRow);
//     });
//   }

//   return res.status(200).json({allRows});
// }

// // Helper to group tokens by y position
// function groupTokensByY(tokens, threshold) {
//   tokens.sort((a, b) => b.y - a.y); // sort top to bottom
//   const rows = [];

//   tokens.forEach(token => {
//     let matchedRow = rows.find(row => Math.abs(row[0].y - token.y) < threshold);
//     if (matchedRow) matchedRow.push(token);
//     else rows.push([token]);
//   });

//   return rows;
// }

// // Example mapping based on x ranges for your columns
// function mapTokensToColumns(rowTokens) {
//   // Define your expected columns and approximate x ranges here:
//   // You need to tweak these based on your PDF’s layout
//   const columns = [
//     { name: "postDate", minX: 10, maxX: 80 },
//     { name: "txnDate", minX: 80, maxX: 150 },
//     { name: "branchCode", minX: 150, maxX: 210 },
//     { name: "chequeNumber", minX: 210, maxX: 270 },
//     { name: "description", minX: 270, maxX: 500 },
//     { name: "debit", minX: 500, maxX: 570 },
//     { name: "credit", minX: 570, maxX: 640 },
//     { name: "balance", minX: 640, maxX: 710 },
//   ];

//   const result = {};

//   columns.forEach(col => {
//     // find tokens in this column's x range
//     const texts = rowTokens
//       .filter(token => token.x >= col.minX && token.x < col.maxX)
//       .map(t => t.text);
//     // join multiple tokens with space for columns like description
//     result[col.name] = texts.join(' ') || null;
//   });

//   return result;
// }

