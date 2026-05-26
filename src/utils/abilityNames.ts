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
    name: 'Crit Up if Max HP',
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
    description: 'Heal for 3% of Max HP whenever a lightning bolt fires.',
  },
  HealOnMagicKnife: {
    name: 'Heal On Magic Knife',
    description: 'Heal a small amount whenever a magic knife fires.',
  },
  HealOnRage: {
    name: 'Heal On Rage',
    description: 'Heal for 3% of Max HP when the rage meter is full.',
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
    description: 'Charge shield by 10% of Max HP when an enemy dies.',
  },
  GainShieldOnHitCount: {
    name: 'Gain Shield on Hit 5',
    description: 'Charge shield by 10% of Max HP when hit count reaches 5.',
  },
  GainShieldOnRage: {
    name: 'Gain Shield On Rage',
    description: 'Gain 10% of Max HP as shield when you unleash rage.',
  },
  GainShieldOnTurn: {
    name: 'Gain Shield on Turn 4',
    description: 'Charge shield by 15% of Max HP on start of turn 4.',
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
  BossBrain_BlossomGolem: {
    name: 'Blossom Golem Brain',
    description:
      'A brain that controls the Blossom Golem, deciding when to use its different abilities.',
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
  BossBrain_PoisonDemon: {
    name: 'Poison Demon Brain',
    description:
      'A brain that controls the Poison Demon, deciding when to use its different abilities.',
  },
  BossBrain_LivingArmor: {
    name: 'Living Armor Brain',
    description:
      'A brain that controls the Living Armor, deciding when to use its different abilities.',
  },
  BossBrain_GildedGuardian: {
    name: 'Gilded Guardian Brain',
    description:
      'Controls the Gilded Guardian — summons minions on rage, attacks when minions are alive.',
  },
  BossBrain_LivingWall: {
    name: 'Living Wall Brain',
    description:
      'Controls the Living Wall — sweeps with his shield (builds rage), periodically fortifies his attack and defense, and unleashes a multi-boulder slam on rage.',
  },
  BossBrain_GiantWizard: {
    name: 'Giant Wizard Brain',
    description:
      'Controls the Giant Wizard — shadow staff bonks by default, leafs through his book every few turns to cleanse/heal/learn an ability, and unleashes a status curse on rage.',
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
  CastSelfHeal: { name: 'Cast Self Heal', description: 'Heal yourself.' },
  ApplyPoisonOnAttack: {
    name: 'Poisonous Attack',
    description: '50% chance to poison your target when you attack.',
  },
  ApplyVulnerableOnAttack: {
    name: 'Apply Vulnerable On Attack',
    description: '50% chance to make your target vulnerable when you attack.',
  },
  PoisonOnMagicKnife: {
    name: 'Poisonous Magic Knives',
    description: 'Apply poison when magic knives hit',
  },
  PoisonOnAttackScaled: {
    name: 'Poisonous Attack',
    description:
      'When you attack, poison your target. Poison damage scales with Attack stat.',
  },
  PoisonShield: {
    name: 'Poisonous Shield',
    description: 'When attacked while shielded, poison the attacker.',
  },
  RemovePoisonOnHeal: {
    name: 'Panacea',
    description: '50% chance to remove Poison when healed.',
  },
  RemovePoisonEveryHitCount: {
    name: 'Remove Poison Every 3 Hits',
    description: 'Every 3 hits, 50% chance to remove Poison.',
  },
  WeakOnAttack: {
    name: 'Cast Weak On Attack',
    description: '50% chance to weaken your target when you attack.',
  },
  WeakOnTurnCount: {
    name: 'Cast Weak Every 3 Turns',
    description: 'Every 3 turns, you have a chance to weaken your target.',
  },
  WeakOnCrit: {
    name: 'Cast Weak On Crit',
    description: '50% chance to weaken your target when you crit.',
  },
  RemoveWeakOnRage: {
    name: 'Remove Weak On Rage',
    description:
      '50% chance to remove Weak from yourself when you use a rage attack.',
  },
  RemoveWeakOnTurnCount: {
    name: 'Remove Weak Every 3 Turns',
    description: 'Every 3 turns, 50% chance to remove Weak.',
  },
  RemoveHypnotizeOnTurnCount: {
    name: 'Remove Hypnotize Every 3 Turns',
    description: 'Every 3 turns, 50% chance to remove Hypnotized.',
  },
  RemoveHypnotizeOnHitCount: {
    name: 'Remove Hypnotize on Hit 3',
    description: 'On hit 3, 50% chance to remove Hypnotized.',
  },
  RemoveVulnerableOnShield: {
    name: 'Remove Vulnerable On Shield',
    description: '50% chance to remove Vulnerable when your shield activates.',
  },
  RemoveVulnerableOnDodge: {
    name: 'Remove Vulnerable On Dodge',
    description: '100% chance to remove Vulnerable when you dodge.',
  },
  HypnotizeOnAttack: {
    name: 'Hypnotize On Attack',
    description: '30% chance to Hypnotize your target when you attack.',
  },
  HypnotizeOnHitCount: {
    name: 'Hypnotize on Hit 3',
    description: 'On hit 3, chance to Hypnotize your target.',
  },
  HypnotizeOnMagicKnife: {
    name: 'Hypnotize On Magic Knife',
    description: '35% chance to Hypnotize your target when magic knives hit.',
  },
  VulnerableEveryTurnCount: {
    name: 'Cast Vulnerable Every 3 Turns',
    description: 'Every 3 turns, chance to make your target Vulnerable.',
  },
  VulnerableOnLightning: {
    name: 'Cast Vulnerable On Lightning',
    description:
      '40% chance to make the victim Vulnerable when lightning strikes.',
  },
  SilenceOnAttack: {
    name: 'Silence On Attack',
    description: '50% chance to Silence your target when you attack.',
  },
  SilenceOnRage: {
    name: 'Silence On Rage',
    description:
      '50% chance to Silence your target when you use a rage attack.',
  },
  RemoveSilenceOnEnemyDeath: {
    name: 'Remove Silence On Enemy Death',
    description: '50% chance to remove Silence when an enemy dies.',
  },
  SilenceOnTurnCount: {
    name: 'Silence Every 3 Turns',
    description: 'Every 3 turns, 50% chance to Silence your target.',
  },
  RemoveSilenceOnHitCount: {
    name: 'Remove Silence on Hit 3',
    description: 'On hit 3, 50% chance to remove Silence.',
  },
  CastWeak: {
    name: 'Cast Weak',
    description: 'Weaken your target, reducing their attack damage.',
  },
  RageWave: {
    name: 'Rage Wave',
    description:
      'Enables the rage wave ability, which hits all opponents with a rage attack.',
  },
  CastSilence: {
    name: 'Cast Silence',
    description:
      'Silence your target, preventing them from using special abilities.',
  },
  RageBladeStorm: {
    name: 'Blade Storm',
    description:
      'Enables the rage Blade Storm ability, unleashing a flurry of light attacks.',
  },
  CastHypnotize: {
    name: 'Cast Hypnotize',
    description: 'Hypnotize your target, preventing them from taking actions.',
  },
  CastVulnerable: {
    name: 'Cast Vulnerable',
    description: "Reduce your target's defense for several turns.",
  },
  RageAttackUp: {
    name: 'Fiery Belly',
    description:
      'Enables the Fiery Belly ability. Increases attack power when rage meter fills.',
  },
  Accelerate: { name: 'Accelerate', description: 'Boosts Speed by 20%.' },
}

export const abilityParamDescriptionMap: Record<
  string,
  Record<string, string>
> = {
  WeakOnCrit: {
    '{"applyChance":0.5}': '50% chance to weaken your target when you crit.',
  },
  RemovePoisonEveryHitCount: {
    '{"multiplier":5,"removeChance":0.25}':
      'Every 5 hits, 25% chance to remove Poison.',
    '{"multiplier":5,"removeChance":0.3}':
      'Every 5 hits, 30% chance to remove Poison.',
    '{"multiplier":5,"removeChance":0.35}':
      'Every 5 hits, 35% chance to remove Poison.',
    '{"multiplier":5,"removeChance":0.4}':
      'Every 5 hits, 40% chance to remove Poison.',
    '{"multiplier":5,"removeChance":0.45}':
      'Every 5 hits, 45% chance to remove Poison.',
    '{"removeChance":0.1}': 'Every 3 hits, 10% chance to remove Poison.',
    '{"removeChance":0.12}': 'Every 3 hits, 12% chance to remove Poison.',
    '{"removeChance":0.15}': 'Every 3 hits, 15% chance to remove Poison.',
    '{"removeChance":0.18}': 'Every 3 hits, 18% chance to remove Poison.',
    '{"removeChance":0.25}': 'Every 3 hits, 25% chance to remove Poison.',
  },
  WeakOnTurnCount: {
    '{"applyChance":0.75}':
      'Every 3 turns, you have a chance to weaken your target.',
  },
  PoisonOnMagicKnife: {
    '{"damagePerTurn":25}': 'Apply poison when magic knives hit',
    '{"damagePerTurn":28}': 'Apply poison when magic knives hit',
    '{"damagePerTurn":35}': 'Apply poison when magic knives hit',
    '{"damagePerTurn":45}': 'Apply poison when magic knives hit',
    '{"damagePerTurn":60}': 'Apply poison when magic knives hit',
  },
  HealOnEnemyDeath: {
    '{"healAmount":0.025}': 'Heal for 3% when an enemy dies.',
  },
  ShieldOnLowHP: {
    '{"shieldAmount":0.15,"threshold":0.2}':
      'Charge shield by 15% if HP goes below 20%.',
  },
  AddRageOnEnemyDeath: { '{"rageAmount":20}': 'Gain 20 when an enemy dies.' },
  RemoveSilenceOnHitCount: {
    '{"hitCount":2,"removeChance":1}':
      'On hit 2, 100% chance to remove Silence.',
  },
  BonusRageOnAttack: {
    '{"rageAmount":5}': 'Every attack builds rage by an additional +5',
  },
  RageOnFirstTurn: {
    '{"rageAmount":30}': 'On your first turn, gain 30 Rage.',
    '{"rageAmount":35}': 'On your first turn, gain 35 Rage.',
  },
  RemoveWeakOnRage: {
    '{"removeChance":0.25}':
      '25% chance to remove Weak from yourself when you use a rage attack.',
  },
  RemoveWeakOnTurnCount: {
    '{"removeChance":0.5}': 'Every 3 turns, 50% chance to remove Weak.',
    '{"removeChance":0.55}': 'Every 3 turns, 55% chance to remove Weak.',
    '{"removeChance":0.6}': 'Every 3 turns, 60% chance to remove Weak.',
    '{"removeChance":0.65}': 'Every 3 turns, 65% chance to remove Weak.',
    '{"removeChance":0.75}': 'Every 3 turns, 75% chance to remove Weak.',
  },
  HealOnLightning: {
    '{"healAmount":0.015}':
      'Heal for 2% of Max HP whenever a lightning bolt fires.',
    '{"healAmount":0.01}':
      'Heal for 1% of Max HP whenever a lightning bolt fires.',
  },
  GainShieldOnEnemyDeath: {
    '{"shieldAmount":0.05}':
      'Charge shield by 5% of Max HP when an enemy dies.',
  },
  GainShieldOnRage: {
    '{"shieldAmount":0.05}':
      'Gain 5% of Max HP as shield when you unleash rage.',
  },
  SilenceOnRage: {
    '{"turnDuration":3}':
      '50% chance to Silence your target when you use a rage attack.',
  },
  PoisonShield: {
    '{"applyChance":0.75,"damagePerTurn":35}':
      'When attacked while shielded, poison the attacker.',
    '{"applyChance":0.75,"damagePerTurn":45}':
      'When attacked while shielded, poison the attacker.',
  },
  VulnerableOnLightning: {
    '{"applyChance":0.1,"turnDuration":2}':
      '10% chance to make the victim Vulnerable when lightning strikes.',
    '{"applyChance":0.12,"turnDuration":2}':
      '12% chance to make the victim Vulnerable when lightning strikes.',
    '{"applyChance":0.15,"turnDuration":2}':
      '15% chance to make the victim Vulnerable when lightning strikes.',
    '{"applyChance":0.2,"turnDuration":2}':
      '20% chance to make the victim Vulnerable when lightning strikes.',
    '{"applyChance":0.25,"turnDuration":2}':
      '25% chance to make the victim Vulnerable when lightning strikes.',
  },
  ApplyPoisonOnAttack: {
    '{"applyChance":0.6,"damagePerTurn":90}':
      '60% chance to poison your target when you attack.',
    '{"applyChance":0.4,"damagePerTurn":30}':
      '40% chance to poison your target when you attack.',
    '{"applyChance":0.45,"damagePerTurn":35}':
      '45% chance to poison your target when you attack.',
    '{"applyChance":0.5,"damagePerTurn":40}':
      '50% chance to poison your target when you attack.',
    '{"applyChance":0.55,"damagePerTurn":45}':
      '55% chance to poison your target when you attack.',
    '{"applyChance":0.6,"damagePerTurn":50}':
      '60% chance to poison your target when you attack.',
    '{"damagePerTurn":25}': '50% chance to poison your target when you attack.',
    '{"damagePerTurn":30}': '50% chance to poison your target when you attack.',
    '{"damagePerTurn":35}': '50% chance to poison your target when you attack.',
    '{"damagePerTurn":40}': '50% chance to poison your target when you attack.',
    '{"applyChance":1,"damagePerTurn":110}':
      '100% chance to poison your target when you attack.',
  },
  HealOnFirstTurn: {
    '{"healAmount":0.1}': 'Heal for 10% of Max HP on first turn.',
  },
}
