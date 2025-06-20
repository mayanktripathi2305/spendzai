
const pdfParse = require("pdf-parse");
// const pdfjs = require('pdfjs-dist');

// // Set the PDF.js worker path
// pdfjs.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.js');

exports.extractBankData = async (req, res) => {
  try {
    const file = req.files?.pdfInput;
    if (!file) return res.status(400).json({ error: "No PDF uploaded." });
    const password = req.body?.password
    console.log("Password :  ",password)
    

    const dataBuffer = file.tempFilePath;
    const parsed = await pdfParse(dataBuffer);
    // const parsed = await pdfParse(dataBuffer,password);
    const lines = parsed.text.split('\n').map(line => line.trim()).filter(Boolean);
    // console.log("Lines are : ",lines)

    const transactions = [];
    const groupedLines = [];

    // Step 1: Group lines by transactions
    let currentGroup = [];
    for (const line of lines) {
      const dateMatch = line.match(/^(\d{2}-\d{2}-\d{4})/);
      if (dateMatch) {
        if (currentGroup.length > 0) groupedLines.push(currentGroup);
        currentGroup = [line];
      } else {
        currentGroup.push(line);
      }
    }
    if (currentGroup.length > 0) groupedLines.push(currentGroup);


    for (const group of groupedLines) {
  const fullText = group.join(' ').replace(/\s+/g, ' ');
  const dateMatch = fullText.match(/^(\d{2}-\d{2}-\d{4})/);
  if (!dateMatch) continue;

  const date = dateMatch[1];
  let rest = fullText.replace(date, '').trim();

  // Initialize refNo and narration
  let refNo = null;
  let narration = "";

  // Find refNo and safely split narration
  const refPatterns = [
    /(UPI|IMPS)-\d{12}/,
    /NEFTINW-[A-Za-z0-9]{10}/,
    /NACH[A-Za-z0-9]{16}/
  ];

  for (const pattern of refPatterns) {
    const match = rest.match(pattern);
    if (match) {
      refNo = match[0];
      const [beforeRef, afterRef] = rest.split(refNo);
      narration = beforeRef.trim();
      rest = `${afterRef}`.trim(); // remaining part for amount
      break;
    }
  }

  // Extract amount and type
  const amountMatch = rest.match(/(\d{1,3}(?:,\d{3})*\.\d{2})\s*\((Dr|Cr)\)/);
  if (!amountMatch) continue;

  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  const type = amountMatch[2] === 'Dr' ? 'debit' : 'credit';

  // Final transaction object
  transactions.push({
    date,
    narration,
    refNo,
    amount,
    type
  });
}

  return res.status(200).json({ data: transactions });
  } catch (error) {
    console.error("❌ Error parsing PDF:", error);
    return res.status(500).json({ error: error?.message });
  }
};






async function renderPage(pageData) {
  const renderOptions = {
    normalizeWhitespace: false,
    disableCombineTextItems: false
  };
  
  return pageData.getTextContent(renderOptions)
    .then(textContent => {
      return textContent.items.map(item => item.str).join(' ');
    });
}

















