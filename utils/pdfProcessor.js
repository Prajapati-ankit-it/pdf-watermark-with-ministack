const { PDFDocument, rgb, degrees } = require('pdf-lib');

exports.modifyPDF = async (buffer, config = {}) => {
  const { header, footer, watermark } = config;

  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();

    if (header) {
      page.drawText(header, {
        x: 50,
        y: height - 30,
        size: 12,
        color: rgb(0, 0, 0)
      });
    }

    if (footer) {
      page.drawText(footer, {
        x: 50,
        y: 20,
        size: 12
      });
    }

    if (watermark) {
      page.drawText(watermark, {
        x: width / 2 - 50,
        y: height / 2,
        size: 30,
        color: rgb(0.8, 0.8, 0.8),
        rotate: degrees(45)
      });
    }
  });

  return await pdfDoc.save();
};