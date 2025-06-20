const fs = require("fs");
const pdfParse = require("pdf-parse");

exports.parseKotakBankStatementSavings = async (req, res) => {
  try {
    const file = req.files?.pdfInput;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const fileBuffer = fs.readFileSync(file.tempFilePath);
    const data = await pdfParse(fileBuffer);
    const rawText = data.text;
    // console.log("Raw text : ",rawText)

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ message: "No text found in PDF. Possibly scanned image." });
    }

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    // console.log("Lines : ",lines)
    const transactions = parseKotakTransactions(lines);
    console.log("Transaction : ",transactions?.slice(0,5))

    return res.status(200).json({ data: transactions });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return res.status(500).json({ message: "Unexpected error", error: err.message });
  }
};


// function parseKotakTransactions(lines) {
//   const transactions = [];
//   const ignoredKeywords = [
//     'Opening Balance', 'Closing Balance', 'Statement Summary',
//     'Total Withdrawal', 'Total Deposit', 'Withdrawal Count',
//     'Deposit Count', 'End of Statement', 'Page',
//     'Cust Reln No', 'Account No', 'IFSC Code', 'Branch Address',
//     'Period:', 'DateNarrationChq/Ref No', 'Withdrawal(Dr)/',
//     'Deposit(Cr)', 'Balance', 'This is system generated'
//   ];

//   const isIgnorable = (line) => ignoredKeywords.some(k => line.includes(k));

//   // Show sample lines for debugging
//   const relevantLines = lines.filter(line => !isIgnorable(line));
//   console.log("First 5 transaction lines:", relevantLines.slice(0, 5));

//   // Main transaction pattern - adjust based on your actual data
//   const transactionPattern = /^(\d{2}-\d{2}-\d{4})\s+(.*?)\s+((?:UPI|IMPS|NEFT|RTGS|NACH)[- ]?\d{6,18})?\s+(\d{1,3}(?:,\d{3})*\.\d{2})\((Dr|Cr)\)/i;

//   for (const line of relevantLines) {
//     const match = line.match(transactionPattern);
//     if (!match) {
//       console.log("No match for line:", line);
//       continue;
//     }

//     const [, date, narration, refNo, amountStr, typeRaw] = match;
//     const amount = parseFloat(amountStr.replace(/,/g, ''));
//     const type = typeRaw.toLowerCase() === 'dr' ? 'debit' : 'credit';

//     // Clean narration - remove any remaining amount-like numbers
//     const cleanNarration = narration.replace(/\d{6,}/g, '') // Remove long numeric sequences
//                                    .replace(/\s+/g, ' ')
//                                    .trim();

//     transactions.push({
//       date,
//       narration: cleanNarration || 'Payment',
//       refNo: refNo || 'N/A',
//       amount,
//       type,
//       balance: null
//     });
//   }

//   console.log(`\n✅ Total Transactions Parsed: ${transactions.length}`);
//   console.log("Sample parsed transactions:", transactions.slice(0, 5));
//   return transactions;
// }











const parseKotakTransactions = (lines) => {
  const transactions = [];

  const isStartOfTxn = line => /^\d{2}-\d{2}-\d{4}/.test(line);
const ignoredPhrases = [
  'Opening Balance', 'Closing Balance', 'Statement Summary',
  'Total Withdrawal', 'Total Deposit', 'Withdrawal Count',
  'Deposit Count', 'End of Statement', 'Page',
  'Cust Reln No', 'Account No', 'IFSC Code', 'Branch Address',
  'Period:', 'DateNarrationChq/Ref No Withdrawal(Dr)/ Deposit(Cr) Balance'
];

  let reconstructedLines = [];
  let current = '';

  for (let line of lines) {
    if (!line || ignoredPhrases.some(p => line.includes(p))) continue;

    if (isStartOfTxn(line)) {
      if (current) reconstructedLines.push(current.trim());
      current = line;
    } else {
      current += ' ' + line;
    }
  }
  if (current) reconstructedLines.push(current.trim());

  // --- 🔧 Clean up: fix space issues (before regex)
  const fixedLines = reconstructedLines.map(line => {
    return line
      // Space after date
      .replace(/^(\d{2}-\d{2}-\d{4})/, '$1 ')
      // Space before UPI-xxxx
      .replace(/([^\s])(UPI-\d+)/, '$1 $2')
      // Space before IMPS-, NEFTINW-, NACHDB etc
      .replace(/([^\s])(IMPS-\d+|NEFTINW-\w+|NACH(?:DB|DR)\d+)/, '$1 $2')
      // Space before amount
      .replace(/(\d{11})(\d{1,3},\d{3}\.\d{2})\((Dr|Cr)\)/, '$1 $2($3)')
      // Space before balance
      .replace(/(\)\s?)(\d{1,3},\d{3,}?\.\d{2})\((Cr|Dr)\)/, '$1 $2($3)')
      .replace(/\s+/, ' ')
      .trim();
  });

  //   const txnRegex = /^(\d{2}-\d{2}-\d{4})\s+(.*?)\s+(UPI-\d+|IMPS-\d+|NEFTINW-\w+|NACH(?:DB|DR)\d+)?\s+([\d,]+\.\d{2})\(?(Dr|Cr)\)?\s+([\d,]+\.\d{2})\(?(Cr|Dr)\)?$/;
  const txnRegex = /^(\d{2}-\d{2}-\d{4})\s+(.*?)\s+(UPI-\d{9,}|IMPS-\d+|NEFTINW-\w+|NACH(?:DB|DR|DD)\d+)?\s*([\d,]+\.\d{2})\s*\((Dr|Cr)\)\s*([\d,]+\.\d{2})\s*\((Cr|Dr)\)/;



  for (const line of fixedLines) {
    const match = line.match(txnRegex);
    if (match) {
      let [_, date, narration, refNo, amountRaw, typeRaw, balanceRaw] = match;

      // Clean ref if stuck in narration
      if (!refNo && narration.includes("UPI-")) {
        const parts = narration.split(/(UPI-\d+)/);
        narration = parts[0].trim();
        refNo = parts[1];
      }

      transactions.push({
        date,
        narration: narration.trim(),
        refNo: refNo || null,
        amount: parseFloat(amountRaw.replace(/,/g, '')),
        type: typeRaw.toLowerCase() === 'dr' ? 'debit' : 'credit',
        balance: parseFloat(balanceRaw.replace(/,/g, '')),
      });
    } else {
    //   console.log("❌ Final unmatched line:", line);
    }
  }

  return transactions;
};

