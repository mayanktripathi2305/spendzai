const { getDocument } = require('pdfjs-dist');

module.exports = async function parsePdfWithPassword(buffer, password) {
  const loadingTask = getDocument({ data: buffer, password });
  const pdfDoc = await loadingTask.promise;

  let text = '';
  const numPages = pdfDoc.numPages;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    text += pageText + '\n';
  }

  return text;
};
