# Sword & Supper Data Viewer

A React, TypeScript, and Vite app for browsing Sword & Supper game data.
The viewer renders searchable/sortable tables for equipment, maps, loot,
enemies, food, quests, abilities, vault loot, and level costs. Most game data is
stored as generated TypeScript modules under `src/utils`, while game art and
Spine assets are served from `public`.

## App Structure

```text
.
├── index.html                  # Vite HTML entry point
├── src/
│   ├── main.tsx                # React bootstrap, page background setup, viewport sync
│   ├── App.tsx                 # Tab shell, derived item lists, cross-tab navigation
│   ├── *Table.tsx              # Tab-specific data views
│   ├── PagePlayerSpine.tsx     # Player Spine preview and selected weapon display
│   ├── PageEnemySpine.tsx      # Background enemy Spine display
│   ├── ItemDetailsPopover.tsx  # Shared item details popover provider/UI
│   ├── AssetIcon.tsx           # Item/asset image rendering
│   ├── types.tsx               # Shared app and game-data types
│   ├── assets/                 # Bundled fonts
│   └── utils/                  # Generated data plus shared display helpers
├── public/
│   ├── backgrounds/            # Layered page backgrounds and rarity backgrounds
│   ├── food/                   # Food asset metadata
│   ├── gear/weapons/           # Player weapon textures
│   ├── itemIcons/              # Item icon PNGs
│   └── spine/                  # Enemy/player Spine PNG, SKEL, and ATLAS files
├── scripts/                    # Data and asset sync scripts
└── tests/                      # Node test runner specs
```

`src/App.tsx` is the main composition point. It imports generated item, loot,
enemy, vault, and name data from `src/utils`, derives item categories and drop
locations, then lazy-loads each table tab. The table components own tab-specific
presentation and sorting, while shared helpers such as `AssetIcon`,
`StatsDisplay`, `DamageDisplay`, `RarityChip`, and `UpgradeList` keep repeated
display behavior in one place.

The generated data modules in `src/utils` include:

- `items.ts`, `loot.ts`, `enemies.ts`, `foods.ts`
- `mapEnemies.ts`, `quests.ts`, `vaultLoot.ts`
- `abilityNames.ts`, `levelCosts.ts`

The other utility modules provide derived display behavior, including item drop
location lookup, sort comparators, rarity colors, ability tooltips, page
background sizing, enemy selection, and player weapon asset mapping.

## Local Development

Install dependencies from the lockfile:

```bash
npm ci
```

Start the Vite development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview a production build locally:

```bash
npm run local
```

Run linting:

```bash
npm run lint
```

Run the test suite:

```bash
node --test tests/*.test.mjs
```

Run one test file:

```bash
node --test tests/sync-bundle-data.test.mjs
```

## NPM Scripts

| Script | Usage |
| --- | --- |
| `npm run dev` | Starts the Vite dev server with hot module replacement. |
| `npm run build` | Runs `tsc -b` and then writes a production Vite build to `dist/`. |
| `npm run lint` | Runs ESLint over the repository. |
| `npm run local` | Builds the app and starts `vite preview` for the generated `dist/` output. |
| `npm run preview` | Starts `vite preview`; run `npm run build` first if `dist/` is stale or missing. |
| `npm run data:check` | Checks generated data in `src/utils` against a built game bundle. Exits non-zero when drift is found. |
| `npm run data:update` | Updates generated data files in `src/utils` from a built game bundle. |
| `npm run get:assets` | Downloads missing item icon PNGs, enemy Spine files, and weapon textures. Requires the game `/assets/` base URL. |

## Data Sync Script

`scripts/sync_bundle_data.mjs` extracts data from a built game bundle and
compares or rewrites the generated modules in `src/utils`.

The package scripts wrap the two common modes:

```bash
npm run data:check -- --bundle path/to/index-example.js
npm run data:update -- --bundle path/to/index-example.js
```

If `--bundle` is omitted, the script looks for the most recent
`index-*.js` bundle in the repo root, `public/`, or `dist/assets/`.

Useful options:

| Option | Description |
| --- | --- |
| `path/to/index.js` | Positional bundle path. Equivalent to `--bundle path/to/index.js`. |
| `--bundle <path>` | Explicit bundle path to read. |
| `--root <path>` | Project root to read/write against. Defaults to the current working directory. |
| `--target <names>` | Comma-separated target list. Defaults to all targets. |
| `--write` | Write changed generated files. Used by `npm run data:update`. |
| `--check` | Check-only mode. Used by `npm run data:check`; check-only is also the default when `--write` is absent. |

Available targets:

```text
loot, items, enemies, foods, mapEnemies, quests, vaultLoot, abilityNames,
levelCosts
```

Examples:

```bash
npm run data:check -- --bundle ./dist/assets/index-example.js
npm run data:update -- --bundle ./dist/assets/index-example.js --target items,enemies,loot
node scripts/sync_bundle_data.mjs --check --root . --bundle ./dist/assets/index-example.js
```

Review the generated diff after `data:update`; the script intentionally rewrites
the generated utility files for the requested targets.

## Asset Sync Script

`scripts/get_assets.mjs` reads item `assetName` values from `src/utils/items.ts`
and enemy `spineAssetKey` values from `src/utils/enemies.ts`. From one game
`/assets/` base URL, it downloads missing item icons into `public/itemIcons`,
enemy Spine `.png`, `.skel`, and `.atlas` files into `public/spine`, and weapon
PNGs into `public/gear/weapons`, including `default.png`.

```bash
npm run get:assets -- https://example.com/assets/
```

The command skips existing files, reports failures, and exits non-zero if any
download fails.

## Updating Game Data

1. Get or build the current game bundle `index-*.js`.
2. Check for generated data drift:

   ```bash
   npm run data:check -- --bundle path/to/index-example.js
   ```

3. Update generated data when drift is expected:

   ```bash
   npm run data:update -- --bundle path/to/index-example.js
   ```

4. Fetch any newly referenced item, Spine, or weapon assets:

   ```bash
   npm run get:assets -- https://example.com/assets/
   ```

5. Verify the app:

   ```bash
   npm run lint
   npm run build
   node --test tests/*.test.mjs
   ```
