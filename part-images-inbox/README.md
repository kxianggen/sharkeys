# part-images-inbox

Drop switch / keycap / stabilizer photos here, then import them to
`public/parts/<componentId>.webp` with:

```bash
# preview (writes nothing)
npx tsx scripts/import-kit-images.ts --parts

# write the assets
npx tsx scripts/import-kit-images.ts --parts --commit
# add --overwrite to replace existing part images
```

Name each file loosely after the switch/keycap/stabilizer — fuzzy-matched
against the real catalog component names and ids, so exact spelling isn't
required (e.g. `gateron oil king.png`, `pudding oem pbt.png`,
`c3 equalz screw-in.png`). Files that don't confidently match an existing
component are reported and skipped — never guessed into place.

Parts are tightly framed, so they render un-zoomed in their tiles (the Browse
`zoomed` treatment is kit-only).
