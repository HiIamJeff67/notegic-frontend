ALTER TABLE `ItemTable` ADD `name` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `ItemTable`
SET `name` = (
  SELECT `MaterialTable`.`name`
  FROM `MaterialTable`
  WHERE `MaterialTable`.`id` = `ItemTable`.`id`
)
WHERE `type` = 'Material'
  AND EXISTS (
    SELECT 1
    FROM `MaterialTable`
    WHERE `MaterialTable`.`id` = `ItemTable`.`id`
  );--> statement-breakpoint
UPDATE `ItemTable`
SET `name` = (
  SELECT `BlockPackTable`.`name`
  FROM `BlockPackTable`
  WHERE `BlockPackTable`.`id` = `ItemTable`.`id`
)
WHERE `type` = 'BlockPack'
  AND EXISTS (
    SELECT 1
    FROM `BlockPackTable`
    WHERE `BlockPackTable`.`id` = `ItemTable`.`id`
  );
