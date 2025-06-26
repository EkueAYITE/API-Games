import fs from 'fs';
import gameList from './gameList.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateGameJson = () => {
    try {
        // Convertir la liste en JSON avec une indentation de 2 espaces
        const gameJson = JSON.stringify(gameList, null, 2);

        // Utiliser un chemin absolu pour écrire le fichier
        const filePath = new URL('./games.json', import.meta.url);

        // Écrire le fichier JSON
        fs.writeFileSync(filePath, gameJson);

        console.log('Le fichier games.json a été généré avec succès !');
    } catch (error) {
        console.error('Erreur lors de la génération du fichier JSON :', error);
    }
};

// Exécuter la fonction si le fichier est appelé directement
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generateGameJson();
}

export default generateGameJson;