// const fs = require('fs');
// const fsPromises = fs.promises;
// const path = require('path'); // This was missing
// const { PDFDocument } = require('pdf-lib');
// const PDFParser = require('pdf2json');

// // Safe decodeURIComponent wrapper
// function safeDecode(text) {
//   try {
//     return decodeURIComponent(text);
//   } catch {
//     return text;
//   }
// }

// async function decryptAndSavePDF(buffer, password, filePath) {
//   try {
//     const pdfDoc = await PDFDocument.load(buffer, { password, ignoreEncryption: false });
//     const decryptedBytes = await pdfDoc.save();
//     await fsPromises.writeFile(filePath, decryptedBytes);
//   } catch (err) {
//     if (
//       err.name === 'EncryptedPDFError' ||
//       err.message.toLowerCase().includes('encrypted') ||
//       err.message.toLowerCase().includes('password')
//     ) {
//       throw new Error('Invalid PDF password or password missing');
//     }
//     throw err;
//   }
// }

// function groupTextByRows(texts) {
//   const rowMap = new Map();

//   texts.forEach(item => {
//     const y = Math.round(item.y * 100) / 100;
//     if (!rowMap.has(y)) rowMap.set(y, []);
//     rowMap.get(y).push({ x: item.x, text: item.R[0].T });
//   });

//   return Array.from(rowMap.values())
//     .map(items => items.sort((a, b) => a.x - b.x).map(i => i.text))
//     .filter(row => row.length > 3);
// }

// function parsePDF(filePath) {
//   return new Promise((resolve, reject) => {
//     try {
//       const pdfParser = new PDFParser();

//       pdfParser.on('pdfParser_dataReady', pdfData => {
//         const pages = pdfData.FormImage.Pages;
//         const allRows = [];

//         pages.forEach(page => {
//           const rows = groupTextByRows(page.Texts);
//           rows.forEach(row => {
//             allRows.push({
//               date: safeDecode(row[0] || ''),
//               description: safeDecode(row[1] || ''),
//               debit: safeDecode(row[2] || ''),
//               credit: safeDecode(row[3] || ''),
//               balance: safeDecode(row[4] || ''),
//             });
//           });
//         });

//         resolve(allRows);
//       });

//       pdfParser.on('pdfParser_dataError', err => reject(err.parserError));
//       pdfParser.loadPDF(filePath);
//     } catch (err) {
//       reject(err);
//     }
//   });
// }

// exports.parseBankStatement2 = async (req, res) => {
//   try {
//     const pdfFile = req.files?.pdfInput;
//     const password = req.body?.password ?? '84679919';

//     if (!pdfFile) {
//       return res.status(400).json({ error: 'No PDF file uploaded.' });
//     }

//     if (pdfFile.mimetype !== 'application/pdf') {
//       return res.status(400).json({ error: 'Uploaded file is not a PDF.' });
//     }

//     const uploadsDir = path.join(__dirname, 'uploads');
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir);
//     }

//     const filePath = path.join(uploadsDir, pdfFile.name);
//     await pdfFile.mv(filePath);

//     const buffer = await fsPromises.readFile(filePath);

//     if (password.trim() !== '') {
//       console.log(`Decrypting PDF with password: "${password}"`);
//       try {
//         await decryptAndSavePDF(buffer, password, filePath);
//         console.log('PDF decrypted successfully.');
//       } catch (err) {
//         if (err.message.toLowerCase().includes('password')) {
//           await fsPromises.unlink(filePath);
//           return res.status(401).json({ error: 'Invalid PDF password.' });
//         }
//         throw err;
//       }
//     }

//     const allRows = await parsePDF(filePath);
//     await fsPromises.unlink(filePath);

//     return res.status(200).json({ message: 'Parsed successfully', data: allRows });
//   } catch (err) {
//     console.error('PDF parse failed:', err);
//     return res.status(500).json({ error: 'Failed to parse PDF.' });
//   }
// };






const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const PDFParser = require('pdf2json');

// Safe decodeURIComponent wrapper
function safeDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

// Group texts by rows based on Y position
function groupTextByRows(texts) {
  const rowMap = new Map();

  texts.forEach(item => {
    const y = Math.round(item.y * 100) / 100;
    if (!rowMap.has(y)) rowMap.set(y, []);
    rowMap.get(y).push({ x: item.x, text: item.R[0].T });
  });

  return Array.from(rowMap.values())
    .map(items => items.sort((a, b) => a.x - b.x).map(i => i.text))
    .filter(row => row.length > 3);
}

// Parse PDF file using pdf2json
function parsePDF(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataReady', pdfData => {
      const pages = pdfData?.FormImage?.Pages;
      const allRows = [];

      pages.forEach(page => {
        const rows = groupTextByRows(page.Texts);
        rows.forEach(row => {
          allRows.push({
            date: safeDecode(row[0] || ''),
            description: safeDecode(row[1] || ''),
            debit: safeDecode(row[2] || ''),
            credit: safeDecode(row[3] || ''),
            balance: safeDecode(row[4] || ''),
          });
        });
      });

      resolve(allRows);
    });

    pdfParser.on('pdfParser_dataError', err => reject(err.parserError));
    pdfParser.loadPDF(filePath);
  });
}

// Express controller to parse only normal PDFs (no password)
exports.parseBankStatement2 = async (req, res) => {
  try {
    const pdfFile = req.files?.pdfInput;
    console.log("Pdf recieved is : ",pdfFile)

    if (!pdfFile) {
      return res.status(400).json({ error: "No PDF file uploaded." });
    }

    if (pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: "Uploaded file is not a PDF." });
    }

    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const filePath = path.join(uploadsDir, pdfFile.name);

    // Save uploaded file
    await pdfFile.mv(filePath);

    // Parse the PDF directly
    const allRows = await parsePDF(filePath);

    // Cleanup
    await fsPromises.unlink(filePath);

    return res.status(200).json({ message: 'Parsed successfully', data: allRows });
  } catch (err) {
    console.error('PDF parse failed:', err);
    return res.status(500).json({ error: 'Failed to parse PDF.' });
  }
};
