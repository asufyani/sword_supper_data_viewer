import { Typography } from '@mui/material'

export const HelpPanel = () => {
  return (
    <>
      <Typography variant={'h3'}>How to Use This Tool</Typography>

      <Typography variant={'h4'}>Weapons</Typography>
      <Typography variant={'body1'}>
        Use the search box to filter by name and click the sortable headers to
        reorder the table. Expand the row in the far right column to see where a
        weapon drops. The Drops From list includes both regular mission rewards
        and Daily Dungeon vault rewards when that weapon can appear in either
        place.
      </Typography>

      <Typography variant={'h4'}>Armor</Typography>
      <Typography variant={'body1'}>
        Use the search box and slot buttons together to narrow the list. Expand
        the row in the far right column to see where that armor piece can drop,
        including Daily Dungeon vault rewards when applicable.
      </Typography>

      <Typography variant={'h4'}>Blueprints</Typography>
      <Typography variant={'body1'}>
        Filter the list with the search box. Click an item name in the upgrades
        column to jump directly to that item in the Weapons or Armor tabs.
      </Typography>

      <Typography variant={'h4'}>Maps</Typography>
      <Typography variant={'body1'}>
        Click the level ranges in the Enemies column to see the breakdown of
        which enemies can appear in that range. The Bosses column shows the odds
        for boss variants of that map type.
      </Typography>

      <Typography variant={'h4'}>Loot</Typography>
      <Typography variant={'body1'}>
        Use this tab to drill through the main mission and enemy loot tables.
        Open a top-level table such as fieldsLoot, then keep opening nested loot
        table entries to trace where the final item drops come from at each
        level range.
      </Typography>
      <Typography variant={'body1'}>
        The search box is useful when you already know the item you want. It
        filters to loot tables that contain matching items. Enemy-linked loot
        tables list the enemies that use that table.
      </Typography>

      <Typography variant={'h4'}>Vault Loot</Typography>
      <Typography variant={'body1'}>
        This tab shows the Daily Dungeon vault rewards. Use the search box to
        find matching items, then open the gold, resource, or equipment groups
        to see what can appear at each level range.
      </Typography>

      <Typography variant={'h4'}>Enemies</Typography>
      <Typography variant={'body1'}>
        Use the Enemy Level slider to scale the enemy stats to the mission level
        you care about. The search box works with both enemy ids and display
        names, and most headers can be clicked to sort the table.
      </Typography>
      <Typography variant={'body1'}>
        The resistances column helps you spot strengths and weaknesses:
        <span className="penalty"> red numbers</span> are resistances and
        <span className="bonus"> green numbers</span> are weaknesses. Expand the
        row on the far right to inspect that enemy&apos;s loot table.
      </Typography>

      <Typography variant={'h4'}>Food</Typography>
      <Typography variant={'body1'}>
        Use the search box to find foods that can drop a specific essence. Since
        essence drops depend on the food image used for a mission, this tab is
        helpful for identifying naming patterns worth searching for.
      </Typography>

      <Typography variant={'h4'}>Quests</Typography>
      <Typography variant={'body1'}>
        This is a reference list of quest types, their tier requirements, and
        their rewards.
      </Typography>

      <Typography variant={'h4'}>Abilities</Typography>
      <Typography variant={'body1'}>
        Use the search box to find an ability by name and read its description.
      </Typography>

      <Typography variant={'h4'}>Level Costs</Typography>
      <Typography variant={'body1'}>
        This tab shows how much it costs to level up from level 1 through level
        1000. Use the Jump to level box at the top to go straight to the level
        you want. Each row shows the current level, the total cost so far, and
        the cost to the next level.
      </Typography>
    </>
  )
}
