import type { FavoriteHerb } from '../types';

// TypeScript declarations for global libraries loaded via CDN
declare const html2canvas: any;
declare const jspdf: any;

function createReportHTML(favorites: FavoriteHerb[]): string {
  const herbEntries = favorites.map(herb => `
    <div class="herb-entry" style="display: flex; gap: 20px; margin-bottom: 30px; page-break-inside: avoid;">
      <div style="flex-shrink: 0; width: 150px;">
        <img src="${herb.herbImage}" alt="${herb.name}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;" />
      </div>
      <div style="flex-grow: 1;">
        <h2 style="font-size: 24px; font-family: 'Cinzel', serif; color: #2d3748; margin-top: 0; margin-bottom: 4px;">${herb.name}</h2>
        <p style="font-size: 16px; font-style: italic; color: #718096; margin-top: 0; margin-bottom: 16px;">${herb.scientificName}</p>
        
        <h3 style="font-size: 14px; text-transform: uppercase; color: #4a5568; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">Magical Properties</h3>
        <p>${herb.magicalProperties.join(', ')}</p>

        <h3 style="font-size: 14px; text-transform: uppercase; color: #4a5568; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; margin-top: 16px;">Associations</h3>
        <p><strong>Element:</strong> ${herb.elementalAssociation} &nbsp;&nbsp; <strong>Planet:</strong> ${herb.planetaryAssociation}</p>
        ${herb.deityAssociation && herb.deityAssociation.length > 0 ? `<p><strong>Deities:</strong> ${herb.deityAssociation.join(', ')}</p>` : ''}

        <h3 style="font-size: 14px; text-transform: uppercase; color: #4a5568; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; margin-top: 16px;">Arcane Lore</h3>
        <p>${herb.lore}</p>

        <h3 style="font-size: 14px; text-transform: uppercase; color: #4a5568; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; margin-top: 16px;">Ritual Usage</h3>
        <p>${herb.usage}</p>
      </div>
    </div>
  `).join('');

  return `
    <div id="report-content" style="padding: 40px; color: #4a5568; background-color: white; font-family: 'Quattrocento', serif; max-width: 800px; margin: auto;">
      <h1 style="font-size: 40px; font-family: 'Cinzel', serif; text-align: center; color: #2d3748; margin-bottom: 40px;">My Grimoire</h1>
      ${herbEntries}
    </div>
  `;
}

export async function generatePdfReport(favorites: FavoriteHerb[]): Promise<void> {
  const reportContainer = document.createElement('div');
  // Position off-screen
  reportContainer.style.position = 'absolute';
  reportContainer.style.left = '-9999px';
  reportContainer.style.top = '0';
  reportContainer.innerHTML = createReportHTML(favorites);
  document.body.appendChild(reportContainer);

  const content = reportContainer.querySelector('#report-content') as HTMLElement;
  if (!content) {
    document.body.removeChild(reportContainer);
    throw new Error('Could not find report content element');
  }

  const canvas = await html2canvas(content, { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#ffffff' 
  });
  
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = jspdf;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save('Esoteric-Herb-Grimoire.pdf');

  document.body.removeChild(reportContainer);
}


export async function copyReportForDocs(favorites: FavoriteHerb[]): Promise<void> {
  const htmlContent = createReportHTML(favorites);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const clipboardItem = new ClipboardItem({ 'text/html': blob });
  await navigator.clipboard.write([clipboardItem]);
}
