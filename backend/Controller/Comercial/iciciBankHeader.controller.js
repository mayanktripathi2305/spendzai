const pdfParse = require("pdf-parse");

function extractTransactions(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const transactions = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const dateMatch = line.match(/^(\d{2}-\d{2}-\d{4})(\d{2}-\d{2}-\d{4})$/);

    if (dateMatch) {
      const tranDate = dateMatch[1];

      let narration = "";
      let withdrawalAmount = null;
      let j = i + 1;

      while (
        j < lines.length &&
        !lines[j].match(/^\d{2}-\d{2}-\d{4}(\d{2}-\d{2}-\d{4})$/)
      ) {
        const moneyMatch = lines[j].match(/([\d,]+\.\d{2})\D*([\d,]+\.\d{2})/);

        if (moneyMatch) {
          const amt = parseFloat(moneyMatch[1].replace(/,/g, ""));
          const narrationLower = narration.toLowerCase();

// Remove whitespace for more accurate checks
const cleanNarration = narrationLower.replace(/\s+/g, "");

const isMakemytrip = cleanNarration.includes("makemytrip");
const isRazorpay = cleanNarration.includes("razorpay");
const isGoogle = cleanNarration.includes("google");
const isAgoda = cleanNarration.includes("agoda");
const isNodal = cleanNarration.includes("nodal");
const isRefund = cleanNarration.includes("refund");

// Salary might be DEBIT or CREDIT. Only consider it CREDIT if it doesn't start with IMPS/UPI
const isSalaryCredit = cleanNarration.includes("salary") && !cleanNarration.startsWith("upi") && !cleanNarration.startsWith("imps") && !cleanNarration.startsWith("mmt");

// final credit detection
const isCredit = isMakemytrip || isRazorpay || isGoogle || isAgoda || isNodal || isRefund || isSalaryCredit;


          if (!isCredit) {
            withdrawalAmount = amt;
            transactions.push({
              tranDate,
              narration: narration.trim(),
              withdrawals: withdrawalAmount
            });
          }

          break;
        } else {
          narration += lines[j] + " ";
        }

        j++;
      }

      i = j;
    } else {
      i++;
    }
  }

  return transactions;
}

exports.parseICICIBankStatement = async (req, res) => {
  try {
    const file = req.files?.pdfInput;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const data = await pdfParse(file.tempFilePath);
    const transactions = extractTransactions(data.text);

    console.log("✅ Total Debit Transactions:", transactions.length); // Should be 47
    console.log("Transaction is : ",transactions)
    res.json({ total: transactions.length, data: transactions });
  } catch (err) {
    console.error("❌ Error parsing PDF:", err);
    res.status(500).json({ message: "Error parsing PDF" });
  }
};




// const pdfParse = require("pdf-parse");
// const fs = require("fs");

// function extractTransactions(text) {
//   const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
//   const transactions = [];
//   let i = 0;

//   while (i < lines.length) {
//     const line = lines[i];
//     const dateMatch = line.match(/^(\d{2}-\d{2}-\d{4})(\d{2}-\d{2}-\d{4})$/); // 👈 fix

//     if (dateMatch) {
//       const tranDate = dateMatch[1];
//       const valueDate = dateMatch[2];

//       let narration = "";
//       let location = "";
//       let withdrawals = null;
//       let deposits = null;
//       let balance = null;

//       let j = i + 1;
//       while (
//         j < lines.length &&
//         !lines[j].match(/^\d{2}-\d{2}-\d{4}(\d{2}-\d{2}-\d{4})$/) // 👈 match compressed dates again
//       ) {
//         const moneyMatch = lines[j].match(/([\d,]+\.\d{2})([\d,]+\.\d{2})?\s+([\d,]+\.\d{2})\s+Cr?/);

//         if (moneyMatch) {
//           narration = narration.trim();
//           const amount1 = parseFloat(moneyMatch[1].replace(/,/g, ""));
//           const amount2 = moneyMatch[2] ? parseFloat(moneyMatch[2].replace(/,/g, "")) : null;
//           const balanceVal = parseFloat(moneyMatch[3].replace(/,/g, ""));

//           // Logic to assign amounts
//           if (amount2 === null) {
//             withdrawals = amount1;
//           } else {
//             withdrawals = amount1;
//             deposits = amount2;
//           }

//           balance = balanceVal;
//           location = lines[j - 1] || "";
//           break;
//         } else {
//           narration += lines[j] + " ";
//         }

//         j++;
//       }

//       transactions.push({
//         tranDate,
//         valueDate,
//         narration: narration.trim(),
//         location: location.trim(),
//         withdrawals,
//         deposits,
//         balance
//       });

//       i = j;
//     } else {
//       i++;
//     }
//   }

//   return transactions;
// }



// exports.parseICICIBankStatement = async (req, res) => {
//   try {
//     const file = req.files?.pdfInput;
//     if (!file) return res.status(400).json({ message: "No file uploaded" });

//     const data = await pdfParse(file.tempFilePath);
//     const transactions = extractTransactions(data.text);

//     console.log("Transactions : ",transactions?.slice(0,5))

//     res.json({ total: transactions.length,data: transactions });
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({ message: "Error parsing PDF" });
//   }
// };
