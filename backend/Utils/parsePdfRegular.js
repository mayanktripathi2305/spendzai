const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');

module.exports = async function parsePdfRegular(buffer) {
  // const loadingTask = pdfjsLib.getDocument({ data: buffer });
//   const uint8Array = new Uint8Array(buffer);
// const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
const loadingTask = pdfjsLib.getDocument({
  data: new Uint8Array(buffer),
  standardFontDataUrl: path.join(__dirname, '../node_modules/pdfjs-dist/standard_fonts/')
});


  const pdf = await loadingTask.promise;

  let allText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');
    allText += text + '\n';
  }

  return allText;
};
