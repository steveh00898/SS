UPDATE items
SET data = json_set(data, '$.sku', 'SF-E326015GY')
WHERE id = 'off-sunny-sf-e326015-gy'
  AND json_extract(data, '$.sku') = 'SF-E326015-GY';
