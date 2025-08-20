import { Typography } from '@mui/material'

export const HelpPanel = () => {
  return (
    <>
      <Typography variant={'h3'}>How to Use This Tool</Typography>
      <Typography variant={'h4'}>Weapons</Typography>
      <Typography variant={'body1'}>
        Filter the list using the search box at the top. Sort by
        name/damage/required level by clicking on the column headers.
      </Typography>
      <Typography variant={'h4'}>Armor</Typography>
      <Typography variant={'body1'}>
        Filter the list using the search box at the top and/or the buttons to
        filter by slot. Sort by name/required level by clicking on the column
        headers.
      </Typography>
      <Typography variant={'h4'}>Blueprints</Typography>
      <Typography variant={'body1'}>
        Filter the list using the search box at the top. Click on an item name
        in the upgrades column to jump to that item in the Weapons/Armor tabs.
        headers.
      </Typography>
      <Typography variant={'h4'}>Maps</Typography>
      <Typography variant={'body1'}>
        Click the level ranges in the Enemies column to view breakdown of chance
        of seeing each enemy type in that level range. The Bosses column
        indicates the chance that a boss map of this type will have each boss
        type.
      </Typography>
      <Typography variant={'h4'}>Loot</Typography>
      <Typography variant={'body1'}>
        Click on a map's top level loot table to see what it drops in any given
        level range. Example: To see what drops in the Fields, I click on
        fieldsLoot. That contains 3 sub loot tables, missionGoldLoot,
        fieldsEquipWrapperLoot, and missionMapLoot. I can then click on those
        sub loot tables to drill down to see what drops in each of those tables
        in any given level range.
      </Typography>
      <Typography variant={'body1'}>
        Alternatively, to find a specific piece of loot, use the search box to
        find tables that include the item. Loot tables like "darkLoot" or
        "golemLoot" apply to all enemies of that subtype, so golemLoot items can
        drop from any rock golem dude. Map loot tables like fieldsEquipLoot mean
        that the item can drop as an end-of-mission reward in that map type.
      </Typography>
      <Typography variant={'h4'}>Enemies</Typography>
      <Typography variant={'body1'}>
        Use the Enemy Level slider to set the level of mission you're doing and
        the table will display stats for enemies of that level. The resistances
        column can be used to figure out what damage an enemy is weak to:{' '}
        <span className="penalty">red numbers</span> indicate resistances and{' '}
        <span className="bonus">green numbers</span> indicate weaknesses.
      </Typography>
      <Typography variant={'h4'}>Food</Typography>
      <Typography variant={'body1'}>
        If you're looking for specific essences, use the search box in the Food
        tab to find what food types will drop which essences. Essence drops are
        determined by the food image you pick when creating the mission.
        Assuming people name their foods somewhat reasonably you can use this
        tab to get an idea of things to search for in the subreddit, like "cake"
        or "doughnut" would be good searches to find Fluffy Essence missions.
      </Typography>
      <Typography variant={'h4'}>Quests</Typography>
      <Typography variant={'body1'}>
        Just a reference of the possible quests the game can give and the
        requirements/rewards for each tier.
      </Typography>
    </>
  )
}
