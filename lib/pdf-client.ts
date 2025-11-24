// Fonction utilitaire pour générer et télécharger un PDF d'email
export async function downloadEmailAsPDF(subject: string, html: string) {
  try {
    // Import dynamique de jsPDF et html2canvas
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    
    // Créer un élément temporaire pour le rendu
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '40px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.innerHTML = `
      <div style="font-family: Arial, sans-serif;">
        <div style="border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #10b981; font-size: 24px; margin: 0 0 10px 0;">${subject}</h1>
          <p style="color: #6b7280; font-size: 12px; margin: 0;">Généré avec MailWiz - ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <div style="line-height: 1.8; color: #1f2937; font-size: 14px;">
          ${html}
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 10px;">
          Créé avec MailWiz • mailwiz.app
        </div>
      </div>
    `;
    document.body.appendChild(tempDiv);

    // Générer le canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Supprimer l'élément temporaire
    document.body.removeChild(tempDiv);

    // Créer le PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Télécharger le PDF
    const fileName = `${subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return false;
  }
}
