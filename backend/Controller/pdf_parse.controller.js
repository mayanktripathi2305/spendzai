const fs = require("fs");
const pdf = require("pdf-parse");
const path = require("path");

exports.parseBankStatement3 = async (req, res) => {
  try {
    const file = req.files?.pdfInput;
    console.log("FIle is : ",file)
    const password = "84679919";

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const dataBuffer = fs.readFileSync(file?.tempFilePath);

    const data = await pdf(dataBuffer, { password });
    
    const text = data.text;
    
    // Split the text by lines
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);

    // Custom logic to parse bank rows (assuming fixed columns like Date, Description, Debit, Credit, Balance)

    const transactions = [];

    for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match lines starting with postDate + txnDate (example: 17/04/2517/04/25)
    const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{2})\s*(\d{2}\/\d{2}\/\d{2})?/);
    if (dateMatch) {
        const [, postDate, txnDate] = dateMatch;

        let descriptionLines = [];
        let j = i + 1;
        let debit = null,
        credit = null,
        balance = null;

        while (j < lines.length) {
        const currentLine = lines[j];
        const amounts = currentLine.match(/([\d,]*\.\d{2})/g);

        if (amounts && amounts.length >= 2) {
            // Found amount line, stop description here
            if (amounts.length === 3) {
            [debit, credit, balance] = amounts;
            } else if (amounts.length === 2) {
            // Guess whether it's debit/balance or credit/balance
            [debit, balance] = amounts;
            }
            break;
        } else {
            // Preserve the description line exactly as in PDF
            descriptionLines.push(lines[j]);
            j++;
        }
        }

        if (balance) {
        transactions.push({
            postDate,
            txnDate: txnDate || postDate,
            description: descriptionLines.join("\n"), // preserve newlines if needed
            debit: debit ? parseFloat(debit.replace(/,/g, "")) : null,
            credit: credit ? parseFloat(credit.replace(/,/g, "")) : null,
            balance: balance ? parseFloat(balance.replace(/,/g, "")) : null,
        });

        i = j; // move to the line after amount line
        }
    }
    }






    console.log("Transactions is : ",transactions)

    fs.unlinkSync(file.tempFilePath); // clean up

    res.status(200).json({data: transactions });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error parsing PDF", error: error.message });
  }
};