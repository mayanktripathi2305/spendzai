const fs = require("fs");
const pdfParse = require("pdf-parse");

exports.parseICICIBankStatementComercial = async (req, res) => {
  try {
    const file = req.files?.pdfInput;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const fileBuffer = fs.readFileSync(file.tempFilePath);
    const data = await pdfParse(fileBuffer);
    const lines = data.text.split("\n").map(l => l.trim()).filter(Boolean);
    // console.log("🔍 Lines extracted:", lines.length);

// Footer/dump line patterns to ignore
const isNoiseLine = (line) => {
  const text = line.toLowerCase();
  return (
    text.startsWith("total :") ||
    text.includes("authenticated intimation") ||
    text.includes("page ") ||
    text.includes("end of statement") ||
    text.includes("team icici") ||
    text.includes("sr") ||
    text.includes("card blocking") ||
    text.includes("corporate office") ||
    text.includes("https://") ||
    text.includes("please provide your complete icici bank account") ||
    text.includes("legends for transactions")
  );
};

const isTransactionStart = (line) =>
  /^\d{2}-\d{2}-\d{4}\d{2}-\d{2}-\d{4}$/.test(line.replace(/\s+/g, ""));

const transactionStartRegex = /\d{2}-\d{2}-\d{4}\d{2}-\d{2}-\d{4}/g;

const groupedTransactions = [];
let currentGroup = [];

for (let i = 0; i < lines.length; i++) {
  const rawLine = lines[i].trim();

  if (isNoiseLine(rawLine)) {
    if (currentGroup.length) {
      groupedTransactions.push(currentGroup);
      currentGroup = [];
    }
    continue;
  }

  const matches = [...rawLine.matchAll(transactionStartRegex)];

  if (matches.length === 0) {
    // No date in line → continue current group
    currentGroup.push(rawLine);
  } else {
    // For each date block found in the line
    for (let m = 0; m < matches.length; m++) {
      const start = matches[m].index;
      const end = matches[m + 1] ? matches[m + 1].index : rawLine.length;
      const chunk = rawLine.slice(start, end).trim();

      if (currentGroup.length) {
        groupedTransactions.push(currentGroup);
      }
      currentGroup = [chunk];
    }
  }
}

// Push the last group
if (currentGroup.length) groupedTransactions.push(currentGroup);



console.log("🧾 Total transactions grouped:", groupedTransactions);

// Helper to clean amount/balance
function cleanNumber(value) {
  return value.replace(/[^0-9.]/g, '');
}

function parseTransaction(group) {
  try {
    // Step 1: Flatten the group into a single clean string
    let flat = group.join(" ").replace(/\s+/g, " ").trim();

    // Step 2: Extract transactionDate and valueDate
    const transactionDate = flat.slice(0, 10);
    const valueDate = flat.slice(10, 20);
    flat = flat.slice(20).trim();

    // Step 3: Extract particulars (everything before location keyword)
    // const locKeywordMatch = flat.match(/\b(RPC|MARGHERITA)\b/i);
    // const locKeywordMatch = flat.match(/(RPC|MARGHERITA)/i);
    const locKeywordMatch = flat.match(/(RPC|MARGHERITA|NARIMAN POINT)/i);


    if (!locKeywordMatch) {
      console.warn("❌ No location keyword found:", flat);
      return null;
    }

    const particulars = flat.slice(0, locKeywordMatch.index).trim();
    flat = flat.slice(locKeywordMatch.index).trim(); // Remaining: location + amount + balance
    console.log("Flat part is : ",flat)

    // Step 4: Extract location
    let location = "";

    if (flat.startsWith("MARGHERITA")) {
      location = "MARGHERITA";
      flat = flat.slice("MARGHERITA".length).trim();
    } else if (/^RPC\s*-\s*LUCKNOW\s*-\s*0116/i.test(flat)) {
      location = "RPC - LUCKNOW - 0116";
      flat = flat.replace(/^RPC\s*-\s*LUCKNOW\s*-\s*0116/i, "").trim();
    } else if(flat.startsWith("NARIMAN POINT")){
      location = "NARIMAN POINT";
      flat = flat.slice("NARIMAN POINT".length).trim();
    }
    else {
      const locMatch = flat.match(/^[A-Z\s\-.]+(?=\d)/i);
      if (!locMatch) {
        console.warn("❌ Failed to extract generic RPC location:", flat);
        return null;
      }
      location = locMatch[0].trim();
      flat = flat.slice(location.length).trim();
    }
    // const knownLocations = ["MARGHERITA", "RPC - LUCKNOW - 0116", "NARIMAN POINT"];
    // for (const loc of knownLocations) {
    //   if (flat.startsWith(loc)) {
    //     location = loc;
    //     flat = flat.slice(loc.length).trim();
    //     break;
    //   }
    // }

    // Step 5: Extract amount and balance
    const numberMatches = flat.match(/([\d,]+\.\d{2})/g);
    if (!numberMatches || numberMatches.length < 2) {
      console.warn("❌ Amount or balance missing in:", flat);
      return null;
    }

    const amountRaw = numberMatches[0];
    const balanceRaw = numberMatches[numberMatches.length - 1];

    const amount = cleanNumber(amountRaw);
    const balance = cleanNumber(balanceRaw);

    // Step 6: Determine deposit or withdrawal
    let deposit = null;
    let withdrawal = null;
    if (particulars.toLowerCase().startsWith("neft")) {
      deposit = amount;
    } else {
      withdrawal = amount;
    }

    return {
      transactionDate,
      valueDate,
      particulars,
      location,
      deposit,
      withdrawal,
      balance
    };
  } catch (err) {
    console.error("❌ Parsing error:", err.message, group);
    return null;
  }
}


// Process all grouped transactions and filter out invalid ones
const parsedTransactions = groupedTransactions
  .map((group) => {
    try {
      return parseTransaction(group);
    } catch (err) {
      console.error("❌ Error parsing transaction group:", err.message, group);
      return null;
    }
  })
  .filter(Boolean); // Remove any nulls (unparsed groups)









    // Filter out failed parses
    const transactions = parsedTransactions.filter(Boolean);

    return res.status(200).json({ data: transactions });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return res.status(500).json({ message: "Unexpected error", error: err.message });
  }
};

function cleanNumber(value) {
  if (!value) return null;
  return value.replace(/[^0-9.]/g, '');
}
