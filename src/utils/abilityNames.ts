export const abilityNameMap = {
  DefaultAttack: {
    name: 'Default Attack',
    description: 'Attack with your main weapon.',
  },
  DoNothing: {
    name: 'Do Nothing',
    description: 'Overrides the default attack to do nothing.',
  },
  EveryOtherTurnDoubleAttack: {
    name: 'Strike Twice Every Other',
    description: 'Every other turn, attack twice with your main weapon.',
  },
  EveryOtherTurnAddRage: {
    name: 'Every Other Add Rage',
    description: 'Every other turn, add 10 rage.',
  },
  AddRageOnHeal: {
    name: 'Add Rage On Heal',
    description: 'Add 10 rage whenever you heal.',
  },
  AddRageOnDamage: {
    name: 'Add Rage on Damage',
    description: 'Add rage when taking damage.',
  },
  AddRageOnMagicKnife: {
    name: 'Add Rage On Magic Knife',
    description: 'Add 5 rage whenever a magic knife fires.',
  },
  MagicKnifeAbility: {
    name: 'Magic Knife',
    description: 'Throw a magic knife at the start of your turn.',
  },
  MagicKnifeOnRage: {
    name: 'Magic Knife On Rage',
    description: 'Throw a magic knife whenever you make a rage attack.',
  },
  MagicKnifeOnCrit: {
    name: 'Magic Knife On Crit',
    description: 'Throw a magic knife whenever you make a critical attack.',
  },
  LightningOnAttack: {
    name: 'Lightning On Attack',
    description: 'When you attack, zap your target with a lightning bolt.',
  },
  LightningOnCrit: {
    name: 'Lightning On Crit',
    description:
      'When you make a critical attack, zap your target with a lightning bolt.',
  },
  LightningOnTurnStart: {
    name: 'Lightning On Turn Start',
    description:
      'Zap your target with a lightning bolt at the start of your turn.',
  },
  LightningOnRage: {
    name: 'Bolt On Rage',
    description:
      'When rage meter is full, zap your target with a lightning bolt',
  },
  SecondWindAbility: {
    name: 'Second Wind',
    description:
      'Heals for 10% of max HP at the start of each turn for 3 turns the first time you dip below 30% HP.',
  },
  LowHpDodgeBoostAbility: {
    name: 'Dodge if Low',
    description: 'Increases dodge chance by 20% when HP is below 30%.',
  },
  LowHpCritBoostAbility: {
    name: 'Crit up if Low HP',
    description: 'Increases crit chance by 20% when HP is below 30%.',
  },
  MaxHpCritBoostAbility: {
    name: 'Crit up if Max HP',
    description: 'Increased crit chance by 20% while your HP is at 100%',
  },
  BoostAttackOnHighHP: {
    name: 'Boost Attack On High HP',
    description: 'Boosts attack when HP is 100%.',
  },
  HealOnCritAbility: {
    name: 'Critical Recovery',
    description: 'Heal for 5% HP whenever you land a critical hit.',
  },
  HealOnLightning: {
    name: 'Heal On Lightning',
    description: 'Heal a small amount whenever a lightning bolt fires.',
  },
  HealOnMagicKnife: {
    name: 'Heal On Magic Knife',
    description: 'Heal a small amount whenever a magic knife fires.',
  },
  HealOnRage: {
    name: 'Heal On Rage',
    description: 'When rage meter is full, Heal for 3% Max HP',
  },
  LifeStealOnAttack: {
    name: 'Life Steal On Attack',
    description: 'Heal for 5% of damage you deal with your main weapon.',
  },
  HealEveryHitCount: {
    name: 'Heal Every Two Hits',
    description: 'Heal every 2 successful hits.',
  },
  LowHPRageFill: {
    name: 'Fill Rage On Low HP',
    description: 'Fills rage meter at 30% HP the first time in a battle.',
  },
  RageOnFirstTurn: {
    name: 'Rage On First Turn',
    description: 'On your first turn, gain 50 Rage.',
  },
  ShieldOnLowHP: {
    name: 'Shield if Low',
    description: 'Charge shield by 25% if HP goes below 30%.',
  },
  LightningOnShieldActivate: {
    name: 'Lightning On Shield Activate',
    description: 'When your shield activates, fire a Lightning Bolt.',
  },
  BonusRageOnAttack: {
    name: 'Bonus Rage On Attack',
    description: 'Every attack builds rage by an additional +10',
  },
  LightningEveryHitCount: {
    name: 'Lightning Every 5 Hits',
    description: 'Every 5 hits, zap your target with a lightning bolt',
  },
  LightningOnEnemyDeath: {
    name: 'Lightning on Enemy Death',
    description: 'Fire a bolt when an enemy dies.',
  },
  AddRageOnEnemyDeath: {
    name: 'Add Rage on Enemy Death',
    description: 'Gain 25 when an enemy dies.',
  },
  AddRageOnHitCount: {
    name: 'Add Rage on Hit 5',
    description: 'Gain 25 when hit count reaches 5.',
  },
  GainShieldOnEnemyDeath: {
    name: 'Gain Shield on Enemy Death',
    description: 'Charge shield by 20% of Max HP when an enemy dies.',
  },
  GainShieldOnHitCount: {
    name: 'Gain Shield on Hit 5',
    description: 'Charge shield by 10% of Max HP when hit count reaches 5.',
  },
  GainShieldOnRage: {
    name: 'Gain Shield On Rage',
    description: 'Gain 15% of Max HP as shield when you unleash rage.',
  },
  GainShieldOnTurn: {
    name: 'Gain Shield on Turn 4',
    description: 'Charge shield by 20% of Max HP on start of turn 4.',
  },
  HealOnEnemyDeath: {
    name: 'Heal on Enemy Death',
    description: 'Heal for 5% when an enemy dies.',
  },
  MagicKnifeOnHitCount: {
    name: 'Magic Knife on Hit 2',
    description: 'Throw a magic knife when your hit count reaches 2.',
  },
  FireKnifeOnTurnStart: {
    name: 'Fire Knife',
    description: 'Throw an Fire Knife at the start of your turn.',
  },
  IceKnifeOnTurnStart: {
    name: 'Ice Knife',
    description: 'Throw an Ice Knife at the start of your turn.',
  },
  BossBrain_WoodGolem: {
    name: 'Wood Golem Brain',
    description:
      'A brain that controls the Wood Golem, deciding when to use its different abilities.',
  },
  BossBrain_IcyWoodGolem: {
    name: 'Icy Wood Golem Brain',
    description:
      'A brain that controls the Icy Wood Golem, deciding when to use its different abilities.',
  },
  BossBrain_DarkDemon: {
    name: 'Dark Demon Brain',
    description:
      'A brain that controls the Dark Demon, deciding when to use its different abilities.',
  },
  BossBrain_LivingArmor: {
    name: 'Living Armor Brain',
    description:
      'A brain that controls the Living Armor, deciding when to use its different abilities.',
  },
  BossBrain_MushroomLargeBoss: {
    name: 'Mushroom Large Boss Brain',
    description:
      'A brain that controls the Mushroom Large Boss, deciding when to use its different abilities.',
  },
  BossBrain_SkeletonFireHead: {
    name: 'Skeleton Fire Head Brain',
    description:
      'A brain that controls the Skeleton Fire Head, deciding when to use its different abilities.',
  },
  BossBrain_SkeletonIceHead: {
    name: 'Skeleton Ice Head Brain',
    description:
      'A brain that controls the Skeleton Ice Head, deciding when to use its different abilities.',
  },
  BossBrain_RobotNo6: {
    name: 'Robot No 6 Brain',
    description:
      'A brain that controls the Robot No. 6, deciding when to use its different abilities.',
  },
  BossBrain_RobotBoss: {
    name: 'Robot Boss Brain',
    description:
      'A brain that controls the Robot Boss, deciding when to use its different abilities.',
  },
  KnifeOnAttack: {
    name: 'Magic Knife On Attack',
    description: 'Throw a magic knife when you attack.',
  },
  FireKnifeOnAttack: {
    name: 'Fire Knife On Attack',
    description: 'Throw a fire knife when you attack.',
  },
  IceKnifeOnAttack: {
    name: 'Ice Knife On Attack',
    description: 'Throw an ice knife when you attack.',
  },
  MagicKnifeOnTurn: {
    name: 'Magic Knife Every 3 Turns',
    description: 'Throw a magic knife every 3 turns.',
  },
  MagicKnifeOnEnemyDeath: {
    name: 'Magic Knife on Enemy Death',
    description: 'Throw a knife when an enemy dies.',
  },
  KnifeDoubler: {
    name: 'Imperfect Knife Doubler',
    description: 'Throw twice as many knives, but each one does less damage.',
  },
  TripleAttack: {
    name: 'Triple Attack',
    description: 'Attack three times with your main weapon. -80% ATK.',
  },
  MagicKnifeEveryHitCount: {
    name: 'Magic Knife Every 3 Hits',
    description: 'Throw a magic knife every 3 hits.',
  },
  HealOnHitCount: {
    name: 'Heal On Hit 3',
    description: 'Heal for 3 on hit 3.',
  },
  HealOnFirstTurn: {
    name: 'Heal on First Turn',
    description: 'Heal for 10% of Max HP on first turn.',
  },
  DoubleLightningOnTurn: {
    name: 'Two For Two Lightning',
    description: 'On turn 2, zap one target with two lightning bolts.',
  },
  LowHPBoostDefense: {
    name: 'Low HP Defence Boost',
    description: 'Increases Defense by 20% when HP is below 30%.',
  },
  LowHPKnives: {
    name: 'Knives on Low HP',
    description:
      'Throw three magic knives the first time your health drops below 30%.',
  },
  AddRageOnCrit: {
    name: 'Add Rage On Crit',
    description: 'Add a small amout of rage each time you crit.',
  },
  AddRageOnLightning: {
    name: 'Add Rage On Lightning',
    description:
      'Add a small amount of rage every time a lightning bolt fires.',
  },
  HealChanceOnShadowDamage: {
    name: 'Dark Recovery',
    description: '40% Chance to Heal for 5% of Max HP when taking 🌑 DMG',
  },
  LightningOnHitCount: {
    name: 'Lightning on Hit 4',
    description: 'Zap your target with a lightning bolt on hit 4.',
  },
}
