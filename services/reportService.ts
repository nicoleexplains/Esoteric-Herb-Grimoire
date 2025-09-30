import type { FavoriteHerb, Spell } from '../types';

// Access libraries from window object since they are loaded via CDN
const jsPDF = (window as any).jspdf.jsPDF;
const html2canvas = (window as any).html2canvas;

// --- Constants ---
const PAGE_WIDTH_PT = 8.5 * 72; // 612 points for US Letter
const PAGE_HEIGHT_PT = 11 * 72; // 792 points
const MARGIN_PT = 0.75 * 72; // 54 points
const CONTENT_WIDTH_PT = PAGE_WIDTH_PT - MARGIN_PT * 2;
const CONTENT_HEIGHT_PT = PAGE_HEIGHT_PT - MARGIN_PT * 2;

// --- HTML Generation ---

const getBaseHtml = (content: string, styles: string = '') => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Quattrocento&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          width: ${CONTENT_WIDTH_PT}pt;
          font-family: 'Quattrocento', serif;
          font-size: 11pt;
          color: #1f2937;
          background-color: #fff;
          box-sizing: border-box;
        }
        h1, h2, h3, h4 { font-family: 'Cinzel', serif; margin: 0; }
        * { box-sizing: border-box; }
        ${styles}
      </style>
    </head>
    <body>
      ${content}
    </body>
  </html>
`;

const createPageHtml = (styles: string, content: string) => getBaseHtml(content, styles);

const createTitlePageHtml = () => createPageHtml(
  ` .container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: ${CONTENT_HEIGHT_PT}pt; text-align: center; }
    h1 { font-size: 42pt; color: #374151; font-weight: 700; line-height: 1.2; letter-spacing: 0.05em; }`,
  `<div class="container"><h1>MY ESOTERIC<br>HERB GRIMOIRE</h1></div>`
);

const createTocPageHtml = (tocEntries: { category: string; page: number }[]) => {
  const listItems = tocEntries.map(entry => `
    <div class="toc-item">
      <span class="toc-title">${entry.category.toUpperCase()}</span>
      <span class="toc-dots"></span>
      <span class="toc-page">${entry.page}</span>
    </div>
  `).join('');

  return createPageHtml(
    ` .container { display: flex; flex-direction: column; justify-content: center; height: ${CONTENT_HEIGHT_PT}pt; }
      h1 { text-align: center; font-size: 32pt; color: #374151; margin-bottom: 40px; }
      .toc-list { font-family: 'Cinzel', serif; font-size: 12pt; letter-spacing: 0.05em; }
      .toc-item { display: flex; align-items: baseline; margin-bottom: 15px; }
      .toc-dots { flex-grow: 1; border-bottom: 1px dotted #9ca3af; margin: 0 8px; transform: translateY(-4px); }`,
    `<div class="container"><h1>TABLE OF CONTENTS</h1><div class="toc-list">${listItems}</div></div>`
  );
};

const createChapterPageHtml = (category: string) => createPageHtml(
  ` .container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: ${CONTENT_HEIGHT_PT}pt; text-align: center; }
    h1 { font-size: 36pt; color: #374151; font-weight: 700; }`,
  `<div class="container"><h1>${category.toUpperCase()}</h1></div>`
);

const createHerbPageHtml = (herb: FavoriteHerb, pageNumber?: string, associatedSpells?: Spell[]) => {
    const styles = `
      .header { text-align: center; font-family: 'Cinzel', serif; font-size: 9pt; color: #6b7280; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; }
      .herb-name { text-align: center; font-family: 'Cinzel', serif; font-size: 28pt; font-weight: 700; color: #166534; margin: 0; }
      .sci-name { text-align: center; font-size: 12pt; font-style: italic; color: #4b5563; margin-bottom: 20px; }
      .herb-image { display: block; width: 200px; height: 200px; border-radius: 12px; margin: 0 auto 24px auto; object-fit: cover; }
      .section-title { font-family: 'Cinzel', serif; font-size: 11pt; font-weight: 700; color: #581c87; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 16px; margin-bottom: 8px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
      .text-block { font-size: 10.5pt; line-height: 1.6; text-align: justify; margin-bottom: 12px; }
      .footer { text-align: center; font-family: 'Cinzel', serif; font-size: 10pt; color: #6b7280; padding-top: 10px; margin-top: 20px; border-top: 1px solid #e5e7eb; }
      .spells-list { margin-top: 8px; }
      .spell-item { border-left: 3px solid #c4b5fd; padding-left: 12px; margin-bottom: 12px; }
      .spell-name { font-family: 'Cinzel', serif; font-weight: 700; font-size: 11pt; color: #4c1d95; }
      .spell-instructions { font-size: 10pt; white-space: pre-wrap; margin-top: 4px; color: #374151; }
      .essences-list { margin-top: 8px; }
      .essence-item { border-left: 3px solid #10b981; padding-left: 12px; margin-bottom: 12px; }
      .essence-name { font-family: 'Cinzel', serif; font-weight: 700; font-size: 11pt; color: #047857; }
      .essence-purpose { font-size: 10pt; white-space: pre-wrap; margin-top: 4px; color: #374151; }
    `;

    const associatedSpellsHtml = (associatedSpells && associatedSpells.length > 0)
    ? `
      <h3 class="section-title">Associated Spells</h3>
      <div class="spells-list">
        ${associatedSpells.map(spell => `
          <div class="spell-item">
            <h4 class="spell-name">${spell.name}</h4>
            <p class="spell-instructions">${spell.instructions}</p>
          </div>
        `).join('')}
      </div>
    ` : '';
    
    const complementaryEssencesHtml = (herb.complementaryEssences && herb.complementaryEssences.length > 0)
    ? `
      <h3 class="section-title">Complementary Essences</h3>
      <div class="essences-list">
        ${herb.complementaryEssences.map(essence => `
          <div class="essence-item">
            <h4 class="essence-name">${essence.name}</h4>
            <p class="essence-purpose">${essence.purpose}</p>
          </div>
        `).join('')}
      </div>
    ` : '';

    const content = `
        ${pageNumber ? '<div class="header">MY ESOTERIC HERB GRIMOIRE</div>' : ''}
        
        <h2 class="herb-name">${herb.name.toUpperCase()}</h2>
        <p class="sci-name">${herb.scientificName}</p>
        <img src="${herb.image}" alt="${herb.name}" class="herb-image" />

        <h3 class="section-title">Magical Properties</h3>
        <p class="text-block">${herb.magicalProperties.join(', ')}</p>
        
        <h3 class="section-title">Associations</h3>
        <p class="text-block"><strong>Element:</strong> ${herb.elementalAssociation} | <strong>Planet:</strong> ${herb.planetaryAssociation}${herb.deityAssociation && herb.deityAssociation.length > 0 ? ` | <strong>Deities:</strong> ${herb.deityAssociation.join(', ')}` : ''}</p>
        
        <h3 class="section-title">Arcane Lore</h3>
        <p class="text-block">${herb.lore}</p>
        
        <h3 class="section-title">Ritual Usage</h3>
        <p class="text-block">${herb.usage}</p>
        
        ${herb.herbalOil ? `
          <h3 class="section-title">Esoteric Oil Lore</h3>
          <p class="text-block">${herb.herbalOil.lore}</p>
          <h3 class="section-title">Esoteric Oil Usage</h3>
          <p class="text-block">${herb.herbalOil.usage}</p>
        ` : ''}
        
        ${complementaryEssencesHtml}
        
        ${associatedSpellsHtml}
      
        ${pageNumber ? `<div class="footer">${pageNumber}</div>` : ''}
    `;
    return getBaseHtml(content, styles);
};

// --- PDF Generation ---

/**
 * Renders an HTML string into a Canvas element using a robust iframe-based approach.
 * This isolates the rendering from the main document's styles and ensures all
 * assets like fonts and images are loaded before capturing.
 */
function renderHtmlToCanvas(htmlString: string): Promise<HTMLCanvasElement> {
    return new Promise(async (resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '0';
        iframe.style.width = `${CONTENT_WIDTH_PT}pt`;
        iframe.style.height = 'auto';
        iframe.style.border = '0';

        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
            document.body.removeChild(iframe);
            return reject(new Error("Could not access iframe document."));
        }

        iframeDoc.open();
        iframeDoc.write(htmlString);
        iframeDoc.close();
        
        const cleanup = () => document.body.removeChild(iframe);

        try {
            const body = iframeDoc.body;
            await iframe.contentWindow.document.fonts.ready;
            
            const images = Array.from(body.getElementsByTagName('img'));
            const imagePromises = images.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise((res) => {
                    img.onload = res;
                    img.onerror = res; // Resolve even on error to avoid blocking
                });
            });
            await Promise.all(imagePromises);

            await new Promise(res => setTimeout(res, 100)); // Wait for paint

            const canvas = await html2canvas(body, {
                useCORS: true,
                scale: 2,
                width: body.scrollWidth,
                height: body.scrollHeight,
                windowWidth: body.scrollWidth,
                windowHeight: body.scrollHeight,
            });
            
            cleanup();
            resolve(canvas);
        } catch (error) {
            cleanup();
            reject(error);
        }
    });
}

/**
 * Adds a canvas to a jsPDF document, scaling it to fit within the content
 * area while preserving aspect ratio and centering it.
 */
const addCanvasToPdfPage = (doc: any, canvas: HTMLCanvasElement) => {
    const imgData = canvas.toDataURL('image/png');
    const ratio = canvas.height / canvas.width;
    let finalWidth = CONTENT_WIDTH_PT;
    let finalHeight = finalWidth * ratio;

    if (finalHeight > CONTENT_HEIGHT_PT) {
        finalHeight = CONTENT_HEIGHT_PT;
        finalWidth = finalHeight / ratio;
    }

    const x = MARGIN_PT + (CONTENT_WIDTH_PT - finalWidth) / 2;
    const y = MARGIN_PT + (CONTENT_HEIGHT_PT - finalHeight) / 2;

    doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
}


export async function generateSingleHerbPdf(herb: FavoriteHerb, associatedSpells: Spell[]): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    const html = createHerbPageHtml(herb, undefined, associatedSpells);
    const canvas = await renderHtmlToCanvas(html);
    
    addCanvasToPdfPage(doc, canvas);

    const filename = `${herb.name.replace(/\s+/g, '_').toLowerCase()}_grimoire_entry.pdf`;
    doc.save(filename);
}

export async function generatePdfReport(favorites: FavoriteHerb[], categories: string[]): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });

    const sortedHerbs = [...favorites].sort((a, b) => a.name.localeCompare(b.name));
    const categoryOrder = ['Uncategorized', ...[...categories].sort()];
    const categorizedFavorites: Record<string, FavoriteHerb[]> = {};
    categoryOrder.forEach(cat => categorizedFavorites[cat] = []);
    sortedHerbs.forEach(herb => {
        const category = herb.category && categories.includes(herb.category) ? herb.category : 'Uncategorized';
        categorizedFavorites[category].push(herb);
    });

    // --- Pass 1: Render content pages and collect TOC data ---
    
    // 1. Title Page
    const titleCanvas = await renderHtmlToCanvas(createTitlePageHtml());
    addCanvasToPdfPage(doc, titleCanvas);

    const tocEntries: { category: string, page: number }[] = [];
    let currentPage = 1; 
    const tocPageNumber = 2;
    doc.addPage(); // Placeholder for TOC
    currentPage++;
    
    // 3. Render Chapters and Herbs
    for (const categoryName of categoryOrder) {
        const herbs = categorizedFavorites[categoryName];
        if (herbs.length > 0) {
            currentPage++;
            doc.addPage();
            const chapterCanvas = await renderHtmlToCanvas(createChapterPageHtml(categoryName));
            addCanvasToPdfPage(doc, chapterCanvas);
            
            tocEntries.push({ category: categoryName, page: currentPage });
            
            for (const herb of herbs) {
                currentPage++;
                doc.addPage();
                const herbCanvas = await renderHtmlToCanvas(createHerbPageHtml(herb, `${currentPage - tocPageNumber}`));
                addCanvasToPdfPage(doc, herbCanvas);
            }
        }
    }

    // --- Pass 2: Render TOC and insert it into the placeholder page ---
    if (tocEntries.length > 0) {
        const tocCanvas = await renderHtmlToCanvas(createTocPageHtml(tocEntries));
        doc.setPage(tocPageNumber);
        addCanvasToPdfPage(doc, tocCanvas);
    } else {
        doc.deletePage(tocPageNumber);
    }

    doc.save('esoteric-herb-grimoire.pdf');
}