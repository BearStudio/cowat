-- Ajouter une colonne temporaire avec le bon type
ALTER TABLE "Commute" ADD COLUMN date_temp DATE;

-- Copier les données depuis l'ancienne colonne
UPDATE "Commute" SET date_temp = date::DATE;

-- Supprimer l'ancienne colonne
ALTER TABLE "Commute" DROP COLUMN date;

-- Renommer la colonne temporaire pour qu'elle devienne la nouvelle colonne
ALTER TABLE "Commute" RENAME COLUMN date_temp TO date;
