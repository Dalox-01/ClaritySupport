/**
 * Script pour convertir l'icône SVG en PNG de différentes tailles
 * 
 * Installation:
 * npm install sharp
 * 
 * Utilisation:
 * node convert-icons.js
 */

const fs = require('fs');
const path = require('path');

// Vérifier si sharp est installé
try {
  const sharp = require('sharp');
  
  const svgPath = path.join(__dirname, '..', 'app', 'icon.svg');
  const iconsDir = path.join(__dirname, 'icons');
  
  // Créer le dossier icons s'il n'existe pas
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  const sizes = [16, 48, 128];
  
  console.log('🎨 Conversion des icônes en cours...\n');
  
  Promise.all(
    sizes.map(size => {
      const outputPath = path.join(iconsDir, `icon${size}.png`);
      
      return sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath)
        .then(() => {
          console.log(`✅ icon${size}.png créé avec succès`);
        })
        .catch(err => {
          console.error(`❌ Erreur lors de la création de icon${size}.png:`, err);
        });
    })
  ).then(() => {
    console.log('\n🎉 Toutes les icônes ont été créées !');
    console.log('\nFichiers créés:');
    sizes.forEach(size => {
      const outputPath = path.join(iconsDir, `icon${size}.png`);
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`  - icon${size}.png (${stats.size} bytes)`);
      }
    });
  });
  
} catch (error) {
  console.log('\n⚠️  Le module "sharp" n\'est pas installé.\n');
  console.log('Pour convertir automatiquement les icônes, installez sharp:');
  console.log('  npm install sharp\n');
  console.log('Puis exécutez:');
  console.log('  node convert-icons.js\n');
  console.log('---\n');
  console.log('Alternatives sans sharp:\n');
  console.log('1. Utilisez un service en ligne:');
  console.log('   - https://cloudconvert.com/svg-to-png');
  console.log('   - https://www.aconvert.com/image/svg-to-png/\n');
  console.log('2. Utilisez un éditeur graphique:');
  console.log('   - Ouvrez app/icon.svg dans Inkscape, Figma, ou Photoshop');
  console.log('   - Exportez en PNG aux tailles: 16x16, 48x48, 128x128');
  console.log('   - Sauvegardez dans extension/icons/\n');
}
