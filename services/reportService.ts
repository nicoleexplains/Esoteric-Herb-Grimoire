// services/reportService.ts

import type { FavoriteHerb } from '../types';

// Since we are using the global scripts from index.html, we declare the libraries
// to inform TypeScript about their existence on the window object.
declare const jspdf: any;
declare const html2canvas: any;

/**
 * Generates a rich HTML report and a plain text fallback, then copies
 * them to the clipboard using the async Clipboard API.
 * @param favorites - An array of favorite herb objects.
 */
export async function copyReportForDocs(favorites: FavoriteHerb[]): Promise<void> {
  if (favorites.length === 0) {
    return;
  }

  // 1. Generate Plain Text Fallback for maximum compatibility
  let plainTextReport = "My Esoteric Herb Grimoire\n\n---\n\n";
  favorites.forEach(herb => {
    plainTextReport += `## ${herb.name}\n`;
    plainTextReport += `*${herb.scientificName}*\n\n`;
    plainTextReport += `Magical Properties: ${herb.magicalProperties.join(', ')}\n`;
    plainTextReport += `Elemental Association: ${herb.elementalAssociation}\n`;
    plainTextReport += `Planetary Association: ${herb.planetaryAssociation}\n`;
    if (herb.deityAssociation && herb.deityAssociation.length > 0) {
      plainTextReport += `Deity Association: ${herb.deityAssociation.join(', ')}\n`;
    }
    plainTextReport += `\nLore:\n${herb.lore}\n`;
    plainTextReport += `\nRitual Usage:\n${herb.usage}\n\n`;
    plainTextReport += "---\n\n";
  });

  // 2. Generate Rich HTML Content for apps like Google Docs
  const htmlReport = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <h1 style="color: #4a0e6c; border-bottom: 2px solid #eee; padding-bottom: 10px;">My Esoteric Herb Grimoire</h1>
      ${favorites.map(herb => `
        <div style="margin-top: 2em; padding-bottom: 1em; border-bottom: 1px solid #eee;">
          <h2 style="font-size: 1.5em; color: #2d6a4f; margin-bottom: 0;">${herb.name}</h2>
          <p style="margin-top: 0; font-style: italic; color: #666;">${herb.scientificName}</p>
          <p><strong>Magical Properties:</strong> ${herb.magicalProperties.join(', ')}</p>
          <p><strong>Associations:</strong> Element of ${herb.elementalAssociation}, Planet of ${herb.planetaryAssociation}</p>
          ${(herb.deityAssociation && herb.deityAssociation.length > 0) ? `<p><strong>Deities:</strong> ${herb.deityAssociation.join(', ')}</p>` : ''}
          <h3>Arcane Lore</h3>
          <p>${herb.lore.replace(/\n/g, '<br>')}</p>
          <h3>Ritual Usage</h3>
          <p>${herb.usage.replace(/\n/g, '<br>')}</p>
        </div>
      `).join('')}
    </div>
  `;

  // 3. Use the Clipboard API to write both formats
  try {
    const htmlBlob = new Blob([htmlReport], { type: 'text/html' });
    const textBlob = new Blob([plainTextReport], { type: 'text/plain' });
    const clipboardItem = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob,
    });
    await navigator.clipboard.write([clipboardItem]);
  } catch (err) {
    console.error('Failed to copy rich text, falling back to plain text:', err);
    try {
      await navigator.clipboard.writeText(plainTextReport);
    } catch (fallbackErr) {
      console.error('Failed to copy plain text to clipboard:', fallbackErr);
      throw new Error('Could not copy report to clipboard.');
    }
  }
}

/**
 * Generates a multi-page PDF report by rendering each herb entry individually
 * to avoid canvas size limitations and ensure all content is included.
 * @param favorites - An array of favorite herb objects.
 */
export async function generatePdfReport(favorites: FavoriteHerb[]): Promise<void> {
  if (favorites.length === 0) {
    return;
  }

  const { jsPDF } = jspdf;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pdfWidth - margin * 2;
  let yPosition = margin;

  // Add a main title to the first page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('My Esoteric Herb Grimoire', pdfWidth / 2, yPosition, { align: 'center' });
  yPosition += 40;

  for (const herb of favorites) {
    // Create a temporary, off-screen container for each herb to render it
    const entryContainer = document.createElement('div');
    entryContainer.style.position = 'absolute';
    entryContainer.style.left = '-9999px';
    entryContainer.style.width = '600px'; // A fixed width for consistent rendering
    entryContainer.style.background = 'white';
    entryContainer.style.color = 'black';
    entryContainer.style.padding = '10px';
    
    const entryHtml = `
      <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.5; }
        .herb-entry { border-bottom: 1px solid #ccc; padding-bottom: 15px; margin-bottom: 15px; }
        img { width: 120px; height: 120px; object-fit: cover; border-radius: 8px; float: right; margin-left: 15px; }
        h2 { font-size: 1.8em; color: #2d6a4f; margin: 0; }
        h3 { font-size: 1.1em; color: #4a0e6c; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 15px; }
        p { margin: 5px 0; }
        .clearfix::after { content: ""; clear: both; display: table; }
      </style>
      <div class="herb-entry clearfix">
        <img src="${herb.herbImage}" alt="${herb.name}">
        <h2>${herb.name}</h2>
        <p><i>${herb.scientificName}</i></p>
        <h3>Magical Properties</h3>
        <p>${herb.magicalProperties.join(', ')}</p>
        <h3>Associations</h3>
        <p><strong>Element:</strong> ${herb.elementalAssociation} | <strong>Planet:</strong> ${herb.planetaryAssociation}</p>
        ${(herb.deityAssociation && herb.deityAssociation.length > 0) ? `<p><strong>Deities:</strong> ${herb.deityAssociation.join(', ')}</p>`: ''}
        <h3>Arcane Lore</h3>
        <p>${herb.lore.replace(/\n/g, '<br>')}</p>
        <h3>Ritual Usage</h3>
        <p>${herb.usage.replace(/\n/g, '<br>')}</p>
      </div>
    `;

    entryContainer.innerHTML = entryHtml;
    document.body.appendChild(entryContainer);

    try {
      const canvas = await html2canvas(entryContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      // Check if the new content fits on the current page. If not, add a new page.
      if (yPosition + imgHeight > pdfHeight - margin) {
        pdf.addPage();
        yPosition = margin; // Reset position to the top margin
      }

      pdf.addImage(imgData, 'PNG', margin, yPosition, contentWidth, imgHeight, undefined, 'FAST');
      yPosition += imgHeight + 20; // Move y-position down for the next entry

    } catch (error) {
      console.error(`Failed to render herb "${herb.name}" for PDF:`, error);
      // If an entry fails, add an error message to the PDF to not halt the process
      if (yPosition + 20 > pdfHeight - margin) { pdf.addPage(); yPosition = margin; }
      pdf.setTextColor(255, 0, 0);
      pdf.text(`Could not render: ${herb.name}`, margin, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 20;
    } finally {
      // Clean up by removing the temporary container
      document.body.removeChild(entryContainer);
    }
  }
  
  pdf.save('Esoteric-Herb-Grimoire.pdf');
}