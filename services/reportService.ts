import type { FavoriteHerb } from '../types';

// Constants for PDF layout, making it easy to adjust
const PAGE_FORMAT = 'letter';
const PAGE_ORIENTATION = 'portrait';
const PAGE_WIDTH_PT = 612; // 8.5 inches * 72 points/inch
const PAGE_HEIGHT_PT = 792; // 11 inches * 72 points/inch
const MARGIN_PT = 54; // 0.75 inches
const CONTENT_WIDTH_PT = PAGE_WIDTH_PT - (MARGIN_PT * 2);
const CONTENT_HEIGHT_PT = PAGE_HEIGHT_PT - (MARGIN_PT * 2);


/**
 * Generates the master CSS for all PDF pages.
 * Encapsulating styles here makes it easier to maintain the book's aesthetic.
 */
const getPdfStyles = (): string => `
  <style>
    body { margin: 0; font-family: 'Quattrocento', serif; color: #000; font-size: 11pt; line-height: 1.5; background: #fff; }
    .page-container { box-sizing: border-box; width: ${CONTENT_WIDTH_PT}pt; height: ${CONTENT_HEIGHT_PT}pt; position: relative; display: flex; flex-direction: column; background: #fff; }
    
    /* Title & Chapter Pages */
    .title-page-container, .chapter-page-container { justify-content: center; align-items: center; text-align: center; }
    .main-title { font-family: 'Cinzel', serif; font-size: 36pt; line-height: 1.3; color: #111827; }
    .chapter-title { font-family: 'Cinzel', serif; font-size: 32pt; color: #111827; }

    /* Table of Contents */
    .toc-container { justify-content: center; }
    .toc-title { font-family: 'Cinzel', serif; font-size: 28pt; margin-bottom: 40px; text-align: center; color: #111827; }
    .toc-list { list-style: none; padding: 0; margin: 0; width: 100%; max-width: 420px; margin: 0 auto; }
    .toc-item { display: flex; align-items: baseline; font-size: 15pt; padding: 12px 0; }
    .toc-item-text { font-family: 'Cinzel', serif; white-space: nowrap; padding-right: 8px; }
    .toc-item-leader { width: 100%; border-bottom: 2px dotted #9ca3af; }
    .toc-item-page { white-space: nowrap; padding-left: 8px; font-family: 'Cinzel', serif; }
    
    /* Herb Page Content */
    .herb-page-content { flex-grow: 1; padding-bottom: 25px; }
    .page-header { font-family: 'Cinzel', serif; font-size: 11pt; text-align: center; margin-bottom: 24px; color: #1f2937; }
    .main-content { display: flex; gap: 24px; margin-bottom: 18px; }
    .left-column { flex: 1; }
    .right-column { width: 170px; flex-shrink: 0; }
    .herb-name { font-family: 'Cinzel', serif; font-size: 28pt; color: #059669; letter-spacing: 1.5px; margin: 0; line-height: 1.2; }
    .scientific-name { font-style: italic; font-size: 12pt; color: #374151; margin-bottom: 20px; }
    .section-title { font-family: 'Cinzel', serif; font-size: 11pt; color: #7c3aed; letter-spacing: 1px; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .properties, .associations { font-size: 11pt; line-height: 1.6; }
    .associations { margin-bottom: 20px; }
    .herb-image { width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .full-width-content { margin-top: 16px; text-align: justify; }
    .full-width-content p { margin-bottom: 12px; }
    .section-title-full { font-family: 'Cinzel', serif; font-size: 11pt; color: #7c3aed; letter-spacing: 1px; margin-bottom: 8px; }

    /* Footer */
    .page-footer { text-align: center; font-size: 10pt; color: #4b5563; font-family: 'Cinzel', serif; height: 25px; line-height: 25px; }
  </style>
`;


/**
 * Creates the HTML content for a single herb page.
 */
const createHerbPageHtml = (herb: FavoriteHerb): string => {
  return `
    <div class="herb-page-content">
        <header class="page-header">MY ESOTERIC HERB GRIMOIRE</header>
        <div class="main-content">
          <div class="left-column">
              <h2 class="herb-name">${herb.name.toUpperCase()}</h2>
              <p class="scientific-name">${herb.scientificName}</p>
              
              <h3 class="section-title">MAGICAL PROPERTIES</h3>
              <p class="properties">${herb.magicalProperties.join(', ')}</p>
              
              <h3 class="section-title">ASSOCIATIONS</h3>
              <div class="associations">
                <p><strong>Element:</strong> ${herb.elementalAssociation} | <strong>Planet:</strong> ${herb.planetaryAssociation}</p>
                ${herb.deityAssociation && herb.deityAssociation.length > 0 ? `<p><strong>Deities:</strong> ${herb.deityAssociation.join(', ')}</p>` : ''}
              </div>
          </div>
          <div class="right-column">
              <img src="${herb.image}" alt="${herb.name}" class="herb-image" />
          </div>
        </div>
        <div class="full-width-content">
          <h3 class="section-title-full">ARCANE LORE</h3>
          <p>${herb.lore}</p>
          <h3 class="section-title-full">RITUAL USAGE</h3>
          <p>${herb.usage}</p>
        </div>
    </div>
  `;
};

/**
 * A helper function to render an HTML string to a canvas and add it to the PDF.
 */
const addHtmlToPdf = async (pdf: any, htmlContent: string) => {
    const html2canvas = (window as any).html2canvas;
    const container = document.createElement('div');
    container.style.cssText = `position: absolute; left: -9999px; width: ${CONTENT_WIDTH_PT}pt; background: #fff;`;
    container.innerHTML = getPdfStyles() + htmlContent;
    document.body.appendChild(container);

    const canvas = await html2canvas(container.querySelector('.page-container'), {
      scale: 2,
      useCORS: true,
    });
    
    document.body.removeChild(container);
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgHeight = (canvas.height * CONTENT_WIDTH_PT) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', MARGIN_PT, MARGIN_PT, CONTENT_WIDTH_PT, imgHeight);
};

/**
 * The main export function to generate the complete, multi-page PDF grimoire.
 */
export const generatePdfReport = async (favorites: FavoriteHerb[], categories: string[]): Promise<void> => {
  const { jsPDF } = (window as any).jspdf;
  if (!jsPDF || !(window as any).html2canvas) {
    throw new Error("PDF generation libraries (jsPDF, html2canvas) are not loaded.");
  }

  const pdf = new jsPDF({
    orientation: PAGE_ORIENTATION,
    unit: 'pt',
    format: PAGE_FORMAT,
  });

  // 1. Add Title Page
  const titlePageHtml = `
    <div class="page-container title-page-container">
      <div class="main-title">MY ESOTERIC<br>HERB GRIMOIRE</div>
    </div>`;
  await addHtmlToPdf(pdf, titlePageHtml);

  // 2. Pre-calculate page numbers for the TOC
  const categorizedFavorites: Record<string, FavoriteHerb[]> = { 'Uncategorized': [] };
  categories.forEach(cat => categorizedFavorites[cat] = []);
  favorites.forEach(herb => {
      const category = herb.category && categories.includes(herb.category) ? herb.category : 'Uncategorized';
      categorizedFavorites[category].push(herb);
  });
  
  const chapters = Object.entries(categorizedFavorites).filter(([_, herbs]) => herbs.length > 0);
  let physicalPageCounter = 2; // Page 1 is Title, Page 2 is TOC
  const tocEntries: { title: string, page: number }[] = [];
  
  chapters.forEach(([categoryName, herbs]) => {
    physicalPageCounter++; // This is the page number for the chapter title page.
    tocEntries.push({ title: categoryName, page: physicalPageCounter });
    physicalPageCounter += herbs.length;
  });

  // 3. Add Table of Contents Page
  pdf.addPage();
  const tocListHtml = tocEntries.map(entry => `
    <li class="toc-item">
      <span class="toc-item-text">${entry.title.toUpperCase()}</span>
      <span class="toc-item-leader"></span>
      <span class="toc-item-page">${entry.page}</span>
    </li>`).join('');
  const tocPageHtml = `
    <div class="page-container toc-container">
      <div>
        <div class="toc-title">Table of Contents</div>
        <ul class="toc-list">${tocListHtml}</ul>
      </div>
    </div>`;
  await addHtmlToPdf(pdf, tocPageHtml);

  // 4. Add Chapter and Herb Pages with absolute numbering
  let currentPage = 2;
  for (const [categoryName, herbs] of chapters) {
    // Add Chapter Title Page
    pdf.addPage();
    currentPage++;
    const chapterPageHtml = `
      <div class="page-container chapter-page-container">
        <div class="chapter-title">${categoryName.toUpperCase()}</div>
      </div>`;
    await addHtmlToPdf(pdf, chapterPageHtml);

    // Add Herb Pages for this chapter
    for (const herb of herbs) {
      pdf.addPage();
      currentPage++;
      const herbPageHtml = `
        <div class="page-container">
          ${createHerbPageHtml(herb)}
          <div class="page-footer">${currentPage}</div>
        </div>
      `;
      await addHtmlToPdf(pdf, herbPageHtml);
    }
  }

  // 5. Save the final PDF
  pdf.save('My_Esoteric_Herb_Grimoire.pdf');
};