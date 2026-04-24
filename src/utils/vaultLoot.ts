export const vt = {
  vaultGoldLoot: {
    type: 'oneOf',
    tiers: [
      {
        minLevel: 1,
        maxLevel: 20,
        items: [
          {
            id: 'Gold',
            weight: 1,
            quantity: [500, 700],
          },
        ],
      },
      {
        minLevel: 21,
        maxLevel: 40,
        items: [
          {
            id: 'Gold',
            weight: 1,
            quantity: [1000, 1500],
          },
        ],
      },
      {
        minLevel: 41,
        maxLevel: 60,
        items: [
          {
            id: 'Gold',
            weight: 1,
            quantity: [2500, 3000],
          },
        ],
      },
      {
        minLevel: 61,
        maxLevel: 100,
        items: [
          {
            id: 'Gold',
            weight: 1,
            quantity: [5000, 10000],
          },
        ],
      },
      {
        minLevel: 101,
        maxLevel: 160,
        items: [
          {
            id: 'Gold',
            weight: 1,
            quantity: [10000, 20000],
          },
        ],
      },
      {
        minLevel: 161,
        items: [
          {
            id: 'Gold',
            weight: 1,
            quantity: [20000, 30000],
          },
        ],
      },
    ],
  },
  vaultResourceLoot: {
    type: 'oneOf',
    tiers: [
      {
        minLevel: 1,
        maxLevel: 20,
        items: [
          {
            id: 'Luminite',
            weight: 10,
            quantity: [2, 4],
          },
        ],
      },
      {
        minLevel: 21,
        maxLevel: 40,
        items: [
          {
            id: 'Luminite',
            weight: 10,
            quantity: [3, 5],
          },
        ],
      },
      {
        minLevel: 41,
        maxLevel: 60,
        items: [
          {
            id: 'Luminite',
            weight: 10,
            quantity: [4, 8],
          },
        ],
      },
      {
        minLevel: 61,
        maxLevel: 100,
        items: [
          {
            id: 'Luminite',
            weight: 10,
            quantity: [6, 12],
          },
        ],
      },
      {
        minLevel: 101,
        maxLevel: 160,
        items: [
          {
            id: 'Luminite',
            weight: 10,
            quantity: [12, 16],
          },
        ],
      },
      {
        minLevel: 161,
        items: [
          {
            id: 'Luminite',
            weight: 10,
            quantity: [14, 20],
          },
        ],
      },
    ],
  },
  vaultEquipLoot: {
    type: 'oneOf',
    tiers: [
      {
        minLevel: 1,
        maxLevel: 20,
        items: [
          {
            id: 'ChippedShortsword',
            weight: 12,
          },
          {
            id: 'RusticSword',
            weight: 12,
          },
          {
            id: 'SimpleCutlass',
            weight: 10,
          },
          {
            id: 'BluntBludgeon',
            weight: 8,
          },
          {
            id: 'LeatherTunic',
            weight: 10,
          },
          {
            id: 'RuggedJerkin',
            weight: 10,
          },
          {
            id: 'ProtectiveMantle',
            weight: 8,
          },
          {
            id: 'RawhideCap',
            weight: 10,
          },
          {
            id: 'LeatherCap',
            weight: 10,
          },
          {
            id: 'SturdyHeadguard',
            weight: 8,
          },
          {
            id: 'RopeBraid',
            weight: 10,
          },
          {
            id: 'HastySash',
            weight: 8,
          },
          {
            id: 'RusticBelt',
            weight: 10,
          },
          {
            id: 'TwineCinch',
            weight: 8,
          },
          {
            id: 'ChippedPendant',
            weight: 10,
          },
          {
            id: 'BlazingAmulet',
            weight: 8,
          },
          {
            id: 'TarnishedBand',
            weight: 10,
          },
          {
            id: 'HeavyBand',
            weight: 8,
          },
          {
            id: 'LuckstoneRing',
            weight: 6,
          },
        ],
      },
      {
        minLevel: 21,
        maxLevel: 50,
        items: [
          {
            id: 'BattlereadyBlade',
            weight: 8,
          },
          {
            id: 'AdventurersBlade',
            weight: 8,
          },
          {
            id: 'SawtoothAxe',
            weight: 6,
          },
          {
            id: 'SerratedSword',
            weight: 6,
          },
          {
            id: 'FuryBlade',
            weight: 5,
          },
          {
            id: 'RoughRazor',
            weight: 6,
          },
          {
            id: 'ChargedFalchion',
            weight: 4,
          },
          {
            id: 'BloodiedChainMail',
            weight: 6,
          },
          {
            id: 'HardenedGarb',
            weight: 6,
          },
          {
            id: 'SilkenRobe',
            weight: 5,
          },
          {
            id: 'MercenaryCuirass',
            weight: 5,
          },
          {
            id: 'FlameguardJacket',
            weight: 4,
          },
          {
            id: 'HeartrootTabard',
            weight: 5,
          },
          {
            id: 'CobaltCape',
            weight: 5,
          },
          {
            id: 'ToughHelmet',
            weight: 6,
          },
          {
            id: 'CordovanHood',
            weight: 5,
          },
          {
            id: 'ConjurersCap',
            weight: 5,
          },
          {
            id: 'BraveheartHelm',
            weight: 4,
          },
          {
            id: 'AcuityHelm',
            weight: 4,
          },
          {
            id: 'BladedBelt',
            weight: 5,
          },
          {
            id: 'LifevineBelt',
            weight: 5,
          },
          {
            id: 'PlatedBelt',
            weight: 5,
          },
          {
            id: 'GroundingBelt',
            weight: 5,
          },
          {
            id: 'WrathfulSash',
            weight: 4,
          },
          {
            id: 'CordofClarity',
            weight: 5,
          },
          {
            id: 'BastionChain',
            weight: 5,
          },
          {
            id: 'SurvivalCharm',
            weight: 5,
          },
          {
            id: 'PhaseCharm',
            weight: 5,
          },
          {
            id: 'WarpstoneAmulet',
            weight: 5,
          },
          {
            id: 'JaggedRing',
            weight: 5,
          },
          {
            id: 'MuscleRing',
            weight: 5,
          },
          {
            id: 'FiligreeBand',
            weight: 4,
          },
          {
            id: 'VengefulLocket',
            weight: 4,
          },
          {
            id: 'BronzeAmulet',
            weight: 3,
          },
          {
            id: 'PristineRing',
            weight: 5,
          },
          {
            id: 'SalvestoneAmulet',
            weight: 5,
          },
        ],
      },
      {
        minLevel: 51,
        maxLevel: 100,
        items: [
          {
            id: 'BerserkerAxe',
            weight: 5,
          },
          {
            id: 'HerosLongSword',
            weight: 5,
          },
          {
            id: 'PiercingBlade',
            weight: 5,
          },
          {
            id: 'Scarsteel',
            weight: 5,
          },
          {
            id: 'DoublePoleAxe',
            weight: 5,
          },
          {
            id: 'SalvationScimitar',
            weight: 4,
          },
          {
            id: 'EternityMace',
            weight: 4,
          },
          {
            id: 'Duskbringer',
            weight: 4,
          },
          {
            id: 'DarkWard',
            weight: 4,
          },
          {
            id: 'Shatterblade',
            weight: 4,
          },
          {
            id: 'SturdyCleaver',
            weight: 4,
          },
          {
            id: 'WindPoweredBlade',
            weight: 3,
          },
          {
            id: 'Fangblade',
            weight: 3,
          },
          {
            id: 'Bloodseeker',
            weight: 2,
          },
          {
            id: 'AshbornBlade',
            weight: 4,
          },
          {
            id: 'Thornbane',
            weight: 4,
          },
          {
            id: 'GuardianPlate',
            weight: 4,
          },
          {
            id: 'VoltaicChestplate',
            weight: 4,
          },
          {
            id: 'SharkskinShirt',
            weight: 4,
          },
          {
            id: 'FuryVest',
            weight: 4,
          },
          {
            id: 'DarksteelPlate',
            weight: 3,
          },
          {
            id: 'VanishingHood',
            weight: 4,
          },
          {
            id: 'ShadowDrinkerHelm',
            weight: 3,
          },
          {
            id: 'SpikedCowl',
            weight: 4,
          },
          {
            id: 'StormHelm',
            weight: 3,
          },
          {
            id: 'CharmCap',
            weight: 4,
          },
          {
            id: 'AudacityChain',
            weight: 4,
          },
          {
            id: 'WraithSash',
            weight: 4,
          },
          {
            id: 'KnifeCollectorsBelt',
            weight: 3,
          },
          {
            id: 'ThermalBinding',
            weight: 3,
          },
          {
            id: 'FrenziedSash',
            weight: 3,
          },
          {
            id: 'SteadfastWrap',
            weight: 4,
          },
          {
            id: 'DefensiveCharm',
            weight: 4,
          },
          {
            id: 'DeathzoneNecklet',
            weight: 3,
          },
          {
            id: 'GhostlyPendant',
            weight: 4,
          },
          {
            id: 'TwistedCharm',
            weight: 4,
          },
          {
            id: 'WizardSigil',
            weight: 4,
          },
          {
            id: 'RagingCharm',
            weight: 3,
          },
          {
            id: 'StalwartSolidus',
            weight: 4,
          },
          {
            id: 'InfernoRing',
            weight: 3,
          },
          {
            id: 'StackedSignet',
            weight: 3,
          },
          {
            id: 'CrystalHeartCharm',
            weight: 3,
          },
          {
            id: 'RingOfRepair',
            weight: 3,
          },
          {
            id: 'SmitingRing',
            weight: 3,
          },
          {
            id: 'FearsomeAmulet',
            weight: 4,
          },
          {
            id: 'ShockwaveSolitaire',
            weight: 4,
          },
          {
            id: 'ToxicTrinket',
            weight: 4,
          },
        ],
      },
      {
        minLevel: 101,
        items: [
          {
            id: 'SwordOfSerpents',
            weight: 3,
          },
          {
            id: 'SmithysFriend',
            weight: 3,
          },
          {
            id: 'VipersFang',
            weight: 2,
          },
          {
            id: 'BerserkerAxeUltimate',
            weight: 3,
          },
          {
            id: 'HerosLongSwordUltimate',
            weight: 3,
          },
          {
            id: 'BrutalBladeUltimate',
            weight: 3,
          },
          {
            id: 'DoublePoleAxeUltimate',
            weight: 3,
          },
          {
            id: 'SalvationScimitarUltimate',
            weight: 3,
          },
          {
            id: 'ScarsteelUltimate',
            weight: 3,
          },
          {
            id: 'StoneBladeUltimate',
            weight: 3,
          },
          {
            id: 'VanguardBladeUltimate',
            weight: 3,
          },
          {
            id: 'BloodseekerUltimate',
            weight: 2,
          },
          {
            id: 'FangbladeEX',
            weight: 2,
          },
          {
            id: 'SouleaterAxeEX',
            weight: 2,
          },
          {
            id: 'InfernoCallerEX',
            weight: 2,
          },
          {
            id: 'HatefulDarknessEX',
            weight: 2,
          },
          {
            id: 'SurgeBladeEX',
            weight: 2,
          },
          {
            id: 'SwordOfSolaceEX',
            weight: 2,
          },
          {
            id: 'RadiantSurplice',
            weight: 3,
          },
          {
            id: 'BloodiedChainMailUltimate',
            weight: 3,
          },
          {
            id: 'SentinelPlateUltimate',
            weight: 3,
          },
          {
            id: 'DarksteelPlateEX',
            weight: 2,
          },
          {
            id: 'TatteredCuirassUltimate',
            weight: 3,
          },
          {
            id: 'InvincibleMantleEX',
            weight: 2,
          },
          {
            id: 'RecoveryVestEX',
            weight: 2,
          },
          {
            id: 'MantleofRefugeEX',
            weight: 2,
          },
          {
            id: 'RadiantHeadgear',
            weight: 3,
          },
          {
            id: 'AcuityHelmUltimate',
            weight: 3,
          },
          {
            id: 'BraveheartHelmUltimate',
            weight: 3,
          },
          {
            id: 'ConjurersCapUltimate',
            weight: 3,
          },
          {
            id: 'SturdyHeadguardUltimate',
            weight: 3,
          },
          {
            id: 'ShadowDrinkerHelmUltimate',
            weight: 2,
          },
          {
            id: 'WardingHelmUltimate',
            weight: 3,
          },
          {
            id: 'SpikedCowlEX',
            weight: 2,
          },
          {
            id: 'AdrenalineCapEX',
            weight: 2,
          },
          {
            id: 'WrathfulVisorEX',
            weight: 2,
          },
          {
            id: 'ReclaimersClasp',
            weight: 2,
          },
          {
            id: 'AudacityChainUltimate',
            weight: 3,
          },
          {
            id: 'BladedBeltUltimate',
            weight: 3,
          },
          {
            id: 'KnifeCollectorsBeltUltimate',
            weight: 2,
          },
          {
            id: 'ThermalBindingUltimate',
            weight: 2,
          },
          {
            id: 'LastResortBelt',
            weight: 3,
          },
          {
            id: 'WardenCharmUltimate',
            weight: 2,
          },
          {
            id: 'DeathzoneLocketEX',
            weight: 2,
          },
          {
            id: 'NimbleAmulet',
            weight: 2,
          },
          {
            id: 'FurybringerUltimate',
            weight: 2,
          },
          {
            id: 'GhostlyPendantUltimate',
            weight: 2,
          },
          {
            id: 'WizardSigilUltimate',
            weight: 2,
          },
          {
            id: 'DarkBargainCharm',
            weight: 1,
          },
          {
            id: 'RagingCharmEX',
            weight: 2,
          },
          {
            id: 'VigilLocketEX',
            weight: 2,
          },
          {
            id: 'ConflagrationRingUltimate',
            weight: 2,
          },
          {
            id: 'RazorRingUltimate',
            weight: 2,
          },
          {
            id: 'SmitingRingUltimate',
            weight: 2,
          },
          {
            id: 'StackedSignetUltimate',
            weight: 2,
          },
          {
            id: 'RingOfRepairUltimate',
            weight: 2,
          },
        ],
      },
    ],
  },
}

export const vaultLootTables = vt
