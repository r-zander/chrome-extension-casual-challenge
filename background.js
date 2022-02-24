const vintageRestricted = loadVintageRestricted();
const bans = loadBans(loadRawBans);
const extendedBans = loadBans(loadRawExtendedBans);

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        // console.log(sender.tab ?
        //     "from a content script: " + sender.tab.url :
        //     "from the extension");
        if (!request.hasOwnProperty('action')) {
            console.error('Received request without mandatory action property.', request);
            return;
        }
        switch (request.action) {
            case 'get/banlist':
                getBanlist(sendResponse);
                return;
            case 'get/ban-status':
                getBanStatus(request.cardName, sendResponse);
                return;
            default:
                console.error('Unknown action "' + request.action + '" in request.', request);
                return;
        }
    },
);

function getBanStatus(cardName, sendResponse) {
    if (bans.hasOwnProperty(cardName)) {
        sendResponse('banned');
    }

    if (extendedBans.hasOwnProperty(cardName)) {
        sendResponse('extended');
    }

    sendResponse('none');
}

function getBanlist(sendResponse) {
    sendResponse(
        {
            bans: bans,
            extended: extendedBans,
        });
}

function loadBans(fn) {
    let bans = {};
    fn().forEach(ban => {
        // Filter out any vintage restricted cards, as they should
        // appear as "not legal" and neither 'banned' nor 'extended'
        if (vintageRestricted.hasOwnProperty(ban.name)) return;

        bans[ban.name] = ban.formats;
    });
    return bans;
}

function loadRawBans() {
    return [
        {
            'name': 'Abrade',
            'formats': [
                'Standard',
                'Pauper',
            ],
        },
        {
            'name': 'Adeline, Resplendent Cathar',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Aether Gust',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Alpine Moon',
            'formats': [
                'Modern',
                'Vintage',
            ],
        },
        {
            'name': 'Alrund\'s Epiphany',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Ancestral Recall',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Ancient Grudge',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Anger of the Gods',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Archmage\'s Charm',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Archon of Emeria',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Arclight Phoenix',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Atog',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Black Lotus',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Blood Fountain',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Blood Moon',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Blue Elemental Blast',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Bolas\'s Citadel',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Brainstorm',
            'formats': [
                'Legacy',
                'Vintage',
                'Pauper',
            ],
        },
        {
            'name': 'Brazen Borrower',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Brutal Cathar',
            'formats': [
                'Standard',
                'Pioneer',
            ],
        },
        {
            'name': 'Burning Hands',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Carpet of Flowers',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Cast Down',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Chained to the Rocks',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Chainer\'s Edict',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Chalice of the Void',
            'formats': [
                'Modern',
                'Legacy',
                'Vintage',
            ],
        },
        {
            'name': 'Chandra, Torch of Defiance',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Chart a Course',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Chromatic Star',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Cinderclasm',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Collector Ouphe',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Consider',
            'formats': [
                'Modern',
                'Pioneer',
            ],
        },
        {
            'name': 'Containment Priest',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Counterspell',
            'formats': [
                'Modern',
                'Pauper',
            ],
        },
        {
            'name': 'Court of Cunning',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Crop Rotation',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Dack Fayden',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Dark Ritual',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Daze',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Deadly Dispute',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Delver of Secrets',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Demon Bolt',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Demonic Tutor',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Dig Through Time',
            'formats': [
                'Pioneer',
                'Vintage',
            ],
        },
        {
            'name': 'Disciple of the Vault',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Disdainful Stroke',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Dispel',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Divide by Zero',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Dragon\'s Rage Channeler',
            'formats': [
                'Modern',
                'Legacy',
            ],
        },
        {
            'name': 'Dress Down',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Duress',
            'formats': [
                'Standard',
                'Pauper',
            ],
        },
        {
            'name': 'Dust to Dust',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Eidolon of the Great Revel',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Electrickery',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Elite Spellbinder',
            'formats': [
                'Standard',
                'Pioneer',
            ],
        },
        {
            'name': 'Elvish Mystic',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Elvish Reclaimer',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Endurance',
            'formats': [
                'Modern',
                'Legacy',
            ],
        },
        {
            'name': 'Engineered Explosives',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Environmental Sciences',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Ephemerate',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Esika\'s Chariot',
            'formats': [
                'Standard',
                'Pioneer',
            ],
        },
        {
            'name': 'Ethersworn Canonist',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Expressive Iteration',
            'formats': [
                'Standard',
                'Modern',
                'Pioneer',
                'Legacy',
            ],
        },
        {
            'name': 'Fading Hope',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Faerie Seer',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Faithless Looting',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Fatal Push',
            'formats': [
                'Modern',
                'Pioneer',
                'Vintage',
            ],
        },
        {
            'name': 'Fateful Absence',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Fiery Cannonade',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Flame-Blessed Bolt',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Fling',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Flusterstorm',
            'formats': [
                'Modern',
                'Legacy',
                'Vintage',
            ],
        },
        {
            'name': 'Force of Negation',
            'formats': [
                'Modern',
                'Legacy',
                'Vintage',
            ],
        },
        {
            'name': 'Force of Vigor',
            'formats': [
                'Modern',
                'Legacy',
                'Vintage',
            ],
        },
        {
            'name': 'Force of Will',
            'formats': [
                'Legacy',
                'Vintage',
            ],
        },
        {
            'name': 'Frogmite',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Fury',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Galvanic Blast',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Galvanic Iteration',
            'formats': [
                'Standard',
                'Pioneer',
            ],
        },
        {
            'name': 'Gilded Goose',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Gitaxian Probe',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Go Blank',
            'formats': [
                'Standard',
                'Pioneer',
            ],
        },
        {
            'name': 'Goldspan Dragon',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Gorilla Shaman',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Grafdigger\'s Cage',
            'formats': [
                'Pioneer',
                'Legacy',
                'Vintage',
            ],
        },
        {
            'name': 'Green Sun\'s Zenith',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Grist, the Hunger Tide',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Guardian of Faith',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Gush',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Gut Shot',
            'formats': [
                'Legacy',
                'Pauper',
            ],
        },
        {
            'name': 'Hullbreacher',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Hullbreaker Horror',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Hurkyl\'s Recall',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Hydroblast',
            'formats': [
                'Legacy',
                'Pauper',
            ],
        },
        {
            'name': 'Ichor Wellspring',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Infernal Grasp',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Inquisition of Kozilek',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Intrepid Adversary',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Jace, the Mind Sculptor',
            'formats': [
                'Modern',
                'Legacy',
            ],
        },
        {
            'name': 'Jace, Wielder of Mysteries',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Journey to Nowhere',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Jwari Disruption',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Kalitas, Traitor of Ghet',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Karn, the Great Creator',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Kolaghan\'s Command',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Krark-Clan Shaman',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Legion\'s End',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Leyline of the Void',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Lier, Disciple of the Drowned',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Life from the Loam',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Lightning Axe',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Lightning Bolt',
            'formats': [
                'Modern',
                'Legacy',
                'Vintage',
                'Pauper',
            ],
        },
        {
            'name': 'Lightning Helix',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Lightning Strike',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Lion\'s Eye Diamond',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Llanowar Elves',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Lotus Petal',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Luminarch Aspirant',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Lurrus of the Dream-Den',
            'formats': [
                'Modern',
                'Pioneer',
            ],
        },
        {
            'name': 'Magma Spray',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Makeshift Munitions',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Malevolent Hermit',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Mana Crypt',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Manifold Key',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Mascot Exhibition',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Meltdown',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Memory Deluge',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Mental Misstep',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Merchant Scroll',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Mindbreak Trap',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Mishra\'s Bauble',
            'formats': [
                'Modern',
                'Legacy',
            ],
        },
        {
            'name': 'Mox Emerald',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Mox Jet',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Mox Pearl',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Mox Ruby',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Mox Sapphire',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Mulldrifter',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Murktide Regent',
            'formats': [
                'Modern',
                'Legacy',
            ],
        },
        {
            'name': 'Myr Enforcer',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Mystical Dispute',
            'formats': [
                'Modern',
                'Pioneer',
            ],
        },
        {
            'name': 'Mystical Tutor',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Narset, Parter of Veils',
            'formats': [
                'Pioneer',
                'Vintage',
            ],
        },
        {
            'name': 'Negate',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Nihil Spellbomb',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Ninja of the Deep Hours',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Omnath, Locus of Creation',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Opposition Agent',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Opt',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Outland Liberator',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Path to Exile',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Pieces of the Puzzle',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Pithing Needle',
            'formats': [
                'Modern',
                'Legacy',
                'Vintage',
            ],
        },
        {
            'name': 'Plague Engineer',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Play with Fire',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Ponder',
            'formats': [
                'Legacy',
                'Vintage',
                'Pauper',
            ],
        },
        {
            'name': 'Portable Hole',
            'formats': [
                'Standard',
                'Pioneer',
            ],
        },
        {
            'name': 'Preordain',
            'formats': [
                'Vintage',
                'Pauper',
            ],
        },
        {
            'name': 'Prismari Command',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Prismatic Ending',
            'formats': [
                'Modern',
                'Legacy',
            ],
        },
        {
            'name': 'Prismatic Strands',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Prophetic Prism',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Prosperous Innkeeper',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Pyroblast',
            'formats': [
                'Legacy',
                'Vintage',
                'Pauper',
            ],
        },
        {
            'name': 'Ragavan, Nimble Pilferer',
            'formats': [
                'Modern',
                'Legacy',
                'Vintage',
            ],
        },
        {
            'name': 'Ranger Class',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Red Elemental Blast',
            'formats': [
                'Legacy',
                'Pauper',
            ],
        },
        {
            'name': 'Reidane, God of the Worthy',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Relic of Progenitus',
            'formats': [
                'Modern',
                'Pauper',
            ],
        },
        {
            'name': 'Rending Volley',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Rest in Peace',
            'formats': [
                'Modern',
                'Pioneer',
            ],
        },
        {
            'name': 'Retrofitter Foundry',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Revoke Existence',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Sanctifier en-Vec',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Selfless Spirit',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Sensei\'s Divining Top',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Serum Visions',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Shadowspear',
            'formats': [
                'Modern',
                'Legacy',
            ],
        },
        {
            'name': 'Shark Typhoon',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Shattering Spree',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Shatterskull Smashing',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Shenanigans',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Skyclave Apparition',
            'formats': [
                'Standard',
                'Pioneer',
            ],
        },
        {
            'name': 'Smoldering Egg',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Snakeskin Veil',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Sol Ring',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Solitude',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Soul Shatter',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Soul-Guide Lantern',
            'formats': [
                'Modern',
                'Pioneer',
                'Legacy',
                'Vintage',
            ],
        },
        {
            'name': 'Soul-Scar Mage',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Spell Pierce',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Spellstutter Sprite',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Sphinx of the Steel Wind',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Spikefield Hazard',
            'formats': [
                'Standard',
                'Pioneer',
            ],
        },
        {
            'name': 'Spreading Seas',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Stoneforge Mystic',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Submerge',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Suffocating Fumes',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Sunset Revelry',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Supreme Verdict',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Surgical Extraction',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Swords to Plowshares',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Sylvan Library',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Teachings of the Archaics',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Teferi, Hero of Dominaria',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Teferi, Time Raveler',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Temporal Trespass',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Terrarion',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Test of Talents',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Thalia, Guardian of Thraben',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'The Celestus',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'The Meathook Massacre',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Thing in the Ice',
            'formats': [
                'Pioneer',
            ],
        },
        {
            'name': 'Thorn of the Black Rose',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Thoughtcast',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Thoughtseize',
            'formats': [
                'Modern',
                'Pioneer',
                'Legacy',
            ],
        },
        {
            'name': 'Thraben Inspector',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Thundering Rebuke',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Time Vault',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Time Walk',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Tinker',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Torpor Orb',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Treasure Cruise',
            'formats': [
                'Pioneer',
                'Vintage',
            ],
        },
        {
            'name': 'Unexpected Windfall',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Unholy Heat',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Uro, Titan of Nature\'s Wrath',
            'formats': [
                'Legacy',
            ],
        },
        {
            'name': 'Usher of the Fallen',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Valorous Stance',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Vampiric Tutor',
            'formats': [
                'Vintage',
            ],
        },
        {
            'name': 'Veil of Summer',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Void Mirror',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Wedding Invitation',
            'formats': [
                'Pauper',
            ],
        },
        {
            'name': 'Werewolf Pack Leader',
            'formats': [
                'Standard',
            ],
        },
        {
            'name': 'Wrenn and Six',
            'formats': [
                'Modern',
            ],
        },
        {
            'name': 'Yorion, Sky Nomad',
            'formats': [
                'Legacy',
            ],
        },
    ];
}

function loadRawExtendedBans() {
    // @formatter:off
    return [
        {"name":"Abrade", "formats": ["Standard (19%)", "Vintage (20%)", "Pauper (13%)"]},
        {"name":"Adeline, Resplendent Cathar", "formats": ["Standard (19%)"]},
        {"name":"Aether Gust", "formats": ["Pioneer (25%)", "Modern (10%)"]},
        {"name":"Allosaurus Shepherd", "formats": ["Legacy (7%)"]},
        {"name":"Alpine Moon", "formats": ["Modern (24%)", "Vintage (25%)"]},
        {"name":"Alrund's Epiphany", "formats": ["Standard (28%)"]},
        {"name":"Ancestral Recall", "formats": ["Vintage (62%)"]},
        {"name":"Ancient Den", "formats": ["Vintage (1%)", "Pauper (3%)"]},
        {"name":"Ancient Grudge", "formats": ["Pauper (12%)"]},
        {"name":"Ancient Tomb", "formats": ["Legacy (16%)", "Vintage (13%)"]},
        {"name":"Anger of the Gods", "formats": ["Pioneer (26%)"]},
        {"name":"Arboreal Grazer", "formats": ["Modern (6%)"]},
        {"name":"Arcbound Ravager", "formats": ["Vintage (8%)"]},
        {"name":"Archaeomancer", "formats": ["Pauper (9%)"]},
        {"name":"Archmage's Charm", "formats": ["Modern (15%)"]},
        {"name":"Archon of Cruelty", "formats": ["Legacy (7%)", "Vintage (5%)"]},
        {"name":"Archon of Emeria", "formats": ["Pioneer (9%)", "Vintage (5%)"]},
        {"name":"Arclight Phoenix", "formats": ["Pioneer (14%)"]},
        {"name":"Arctic Treeline", "formats": ["Pauper (2%)"]},
        {"name":"Ardent Elementalist", "formats": ["Pauper (4%)"]},
        {"name":"Arid Mesa", "formats": ["Modern (17%)", "Legacy (8%)"]},
        {"name":"Ascendant Packleader", "formats": ["Standard (11%)"]},
        {"name":"Ash Barrens", "formats": ["Pauper (35%)"]},
        {"name":"Atog", "formats": ["Pauper (26%)"]},
        {"name":"Augur of Bolas", "formats": ["Pauper (9%)"]},
        {"name":"Avabruck Caretaker", "formats": ["Standard (6%)"]},
        {"name":"Azorius Chancery", "formats": ["Pauper (6%)"]},
        {"name":"Azusa, Lost but Seeking", "formats": ["Modern (5%)"]},
        {"name":"Badlands", "formats": ["Legacy (10%)", "Vintage (2%)"]},
        {"name":"Barkchannel Pathway", "formats": ["Standard (2%)", "Pioneer (5%)"]},
        {"name":"Barren Moor", "formats": ["Pauper (3%)"]},
        {"name":"Basking Rootwalla", "formats": ["Vintage (4%)"]},
        {"name":"Batterskull", "formats": ["Legacy (9%)"]},
        {"name":"Battle Screech", "formats": ["Pauper (8%)"]},
        {"name":"Battlefield Forge", "formats": ["Pioneer (6%)"]},
        {"name":"Bayou", "formats": ["Legacy (18%)", "Vintage (2%)"]},
        {"name":"Bazaar of Baghdad", "formats": ["Vintage (17%)"]},
        {"name":"Behold the Multiverse", "formats": ["Standard (14%)"]},
        {"name":"Birchlore Rangers", "formats": ["Legacy (5%)"]},
        {"name":"Birds of Paradise", "formats": ["Modern (4%)", "Legacy (6%)"]},
        {"name":"Black Lotus", "formats": ["Vintage (82%)"]},
        {"name":"Blackcleave Cliffs", "formats": ["Modern (9%)"]},
        {"name":"Blast Zone", "formats": ["Pioneer (7%)", "Legacy (7%)"]},
        {"name":"Blightstep Pathway", "formats": ["Standard (13%)", "Pioneer (12%)"]},
        {"name":"Blizzard Brawl", "formats": ["Standard (13%)"]},
        {"name":"Blood Baron of Vizkopa", "formats": ["Pioneer (11%)"]},
        {"name":"Blood Crypt", "formats": ["Pioneer (14%)", "Modern (17%)"]},
        {"name":"Blood Fountain", "formats": ["Pauper (26%)"]},
        {"name":"Blood Moon", "formats": ["Modern (18%)"]},
        {"name":"Blood on the Snow", "formats": ["Standard (10%)"]},
        {"name":"Bloodchief's Thirst", "formats": ["Standard (10%)", "Pioneer (10%)"]},
        {"name":"Bloodstained Mire", "formats": ["Modern (21%)", "Legacy (16%)", "Vintage (3%)"]},
        {"name":"Bloodthirsty Adversary", "formats": ["Pioneer (6%)"]},
        {"name":"Blue Elemental Blast", "formats": ["Pauper (35%)"]},
        {"name":"Bojuka Bog", "formats": ["Legacy (17%)", "Vintage (1%)", "Pauper (7%)"]},
        {"name":"Bolas's Citadel", "formats": ["Vintage (28%)"]},
        {"name":"Bonecrusher Giant", "formats": ["Pioneer (16%)"]},
        {"name":"Boros Garrison", "formats": ["Pauper (9%)"]},
        {"name":"Botanical Sanctum", "formats": ["Pioneer (6%)"]},
        {"name":"Brainstorm", "formats": ["Legacy (47%)", "Vintage (56%)", "Pauper (11%)"]},
        {"name":"Branchloft Pathway", "formats": ["Standard (3%)", "Pioneer (14%)"]},
        {"name":"Brazen Borrower", "formats": ["Pioneer (6%)", "Modern (12%)", "Legacy (7%)"]},
        {"name":"Breeding Pool", "formats": ["Modern (24%)"]},
        {"name":"Briarbridge Tracker", "formats": ["Standard (6%)"]},
        {"name":"Brightclimb Pathway", "formats": ["Standard (12%)", "Pioneer (14%)"]},
        {"name":"Brutal Cathar", "formats": ["Standard (21%)", "Pioneer (10%)"]},
        {"name":"Burn Down the House", "formats": ["Standard (14%)"]},
        {"name":"Burning Hands", "formats": ["Standard (28%)"]},
        {"name":"Carpet of Flowers", "formats": ["Legacy (12%)"]},
        {"name":"Cartouche of Solidarity", "formats": ["Pauper (8%)"]},
        {"name":"Cast Down", "formats": ["Pauper (29%)"]},
        {"name":"Castle Ardenvale", "formats": ["Pioneer (5%)"]},
        {"name":"Castle Locthwain", "formats": ["Pioneer (23%)"]},
        {"name":"Castle Vantress", "formats": ["Pioneer (7%)", "Modern (7%)"]},
        {"name":"Cathar Commando", "formats": ["Legacy (7%)", "Pauper (4%)"]},
        {"name":"Cave of Temptation", "formats": ["Pauper (8%)"]},
        {"name":"Cave of the Frost Dragon", "formats": ["Standard (13%)"]},
        {"name":"Cavern of Souls", "formats": ["Modern (12%)", "Legacy (10%)", "Vintage (5%)"]},
        {"name":"Celestial Colonnade", "formats": ["Modern (6%)"]},
        {"name":"Cemetery Gatekeeper", "formats": ["Pioneer (5%)"]},
        {"name":"Chained to the Rocks", "formats": ["Pioneer (10%)"]},
        {"name":"Chainer's Edict", "formats": ["Pauper (12%)"]},
        {"name":"Chalice of the Void", "formats": ["Modern (23%)", "Legacy (10%)", "Vintage (24%)"]},
        {"name":"Champion of Dusk", "formats": ["Pioneer (9%)"]},
        {"name":"Chancellor of the Annex", "formats": ["Legacy (7%)"]},
        {"name":"Chandra, Torch of Defiance", "formats": ["Pioneer (18%)"]},
        {"name":"Chart a Course", "formats": ["Pioneer (13%)"]},
        {"name":"Chromatic Star", "formats": ["Pauper (28%)"]},
        {"name":"Cinderclasm", "formats": ["Standard (30%)"]},
        {"name":"City of Traitors", "formats": ["Legacy (8%)"]},
        {"name":"Clarion Spirit", "formats": ["Standard (4%)"]},
        {"name":"Clearwater Pathway", "formats": ["Standard (12%)"]},
        {"name":"Collector Ouphe", "formats": ["Legacy (21%)", "Vintage (7%)"]},
        {"name":"Colossus Hammer", "formats": ["Modern (9%)"]},
        {"name":"Concealed Courtyard", "formats": ["Modern (8%)"]},
        {"name":"Concealing Curtains", "formats": ["Standard (3%)"]},
        {"name":"Consider", "formats": ["Pioneer (28%)", "Modern (10%)"]},
        {"name":"Containment Priest", "formats": ["Pioneer (4%)", "Legacy (13%)", "Vintage (7%)"]},
        {"name":"Counterspell", "formats": ["Modern (24%)", "Pauper (24%)"]},
        {"name":"Crackling Drake", "formats": ["Pioneer (5%)"]},
        {"name":"Cragcrown Pathway", "formats": ["Standard (8%)", "Pioneer (16%)"]},
        {"name":"Craterhoof Behemoth", "formats": ["Legacy (5%)"]},
        {"name":"Crimson Acolyte", "formats": ["Pauper (5%)"]},
        {"name":"Crimson Fleet Commodore", "formats": ["Pauper (9%)"]},
        {"name":"Crippling Fear", "formats": ["Pioneer (10%)"]},
        {"name":"Crop Rotation", "formats": ["Legacy (13%)"]},
        {"name":"Crumbling Vestige", "formats": ["Pauper (3%)"]},
        {"name":"Crypt Rats", "formats": ["Pauper (3%)"]},
        {"name":"Cultivator Colossus", "formats": ["Modern (4%)"]},
        {"name":"Cyclone Summoner", "formats": ["Standard (10%)"]},
        {"name":"Dack Fayden", "formats": ["Vintage (20%)"]},
        {"name":"Dark Depths", "formats": ["Legacy (8%)"]},
        {"name":"Dark Ritual", "formats": ["Legacy (14%)"]},
        {"name":"Darkbore Pathway", "formats": ["Standard (7%)"]},
        {"name":"Darkmoss Bridge", "formats": ["Pauper (5%)"]},
        {"name":"Darksteel Citadel", "formats": ["Vintage (1%)", "Pauper (27%)"]},
        {"name":"Dauthi Voidwalker", "formats": ["Modern (5%)"]},
        {"name":"Dawnbringer Cleric", "formats": ["Pauper (7%)"]},
        {"name":"Daze", "formats": ["Legacy (29%)"]},
        {"name":"Dead // Gone", "formats": ["Legacy (//)"]},
        {"name":"Deadly Dispute", "formats": ["Standard (10%)", "Pauper (28%)"]},
        {"name":"Deafening Silence", "formats": ["Pioneer (17%)", "Legacy (10%)"]},
        {"name":"Death's Shadow", "formats": ["Modern (6%)"]},
        {"name":"Deathcap Glade", "formats": ["Standard (3%)"]},
        {"name":"Deathrite Shaman", "formats": ["Vintage (7%)"]},
        {"name":"Delver of Secrets", "formats": ["Legacy (20%)", "Pauper (5%)"]},
        {"name":"Demon Bolt", "formats": ["Standard (21%)"]},
        {"name":"Demonic Tutor", "formats": ["Vintage (49%)"]},
        {"name":"Den of the Bugbear", "formats": ["Standard (9%)", "Pioneer (26%)"]},
        {"name":"Deserted Beach", "formats": ["Standard (6%)", "Pioneer (5%)"]},
        {"name":"Devouring Tendrils", "formats": ["Standard (10%)"]},
        {"name":"Dig Through Time", "formats": ["Pioneer (14%)", "Vintage (32%)"]},
        {"name":"Disciple of the Vault", "formats": ["Pauper (27%)"]},
        {"name":"Disdainful Stroke", "formats": ["Standard (16%)"]},
        {"name":"Dispel", "formats": ["Pauper (23%)"]},
        {"name":"Divide by Zero", "formats": ["Standard (35%)"]},
        {"name":"Dovin's Veto", "formats": ["Modern (11%)"]},
        {"name":"Dragon's Rage Channeler", "formats": ["Modern (24%)", "Legacy (21%)"]},
        {"name":"Dreadbore", "formats": ["Pioneer (11%)"]},
        {"name":"Dreadhorde Arcanist", "formats": ["Vintage (9%)"]},
        {"name":"Dreamroot Cascade", "formats": ["Standard (1%)"]},
        {"name":"Dress Down", "formats": ["Modern (18%)"]},
        {"name":"Drossforge Bridge", "formats": ["Pauper (28%)"]},
        {"name":"Drown in the Loch", "formats": ["Modern (9%)"]},
        {"name":"Drowned Catacomb", "formats": ["Pioneer (6%)"]},
        {"name":"Dryad Arbor", "formats": ["Legacy (19%)"]},
        {"name":"Dryad of the Ilysian Grove", "formats": ["Modern (6%)"]},
        {"name":"Duress", "formats": ["Standard (22%)", "Pioneer (10%)", "Pauper (34%)"]},
        {"name":"Dusk Legion Zealot", "formats": ["Pioneer (10%)"]},
        {"name":"Dust to Dust", "formats": ["Pauper (27%)"]},
        {"name":"Echoing Truth", "formats": ["Pauper (10%)"]},
        {"name":"Edgar, Charmed Groom", "formats": ["Standard (8%)", "Pioneer (9%)"]},
        {"name":"Eidolon of the Great Revel", "formats": ["Pioneer (10%)", "Modern (6%)"]},
        {"name":"Electrickery", "formats": ["Pauper (17%)"]},
        {"name":"Elite Spellbinder", "formats": ["Standard (23%)", "Pioneer (11%)"]},
        {"name":"Elvish Mystic", "formats": ["Pioneer (12%)"]},
        {"name":"Elvish Reclaimer", "formats": ["Legacy (10%)"]},
        {"name":"Elvish Visionary", "formats": ["Legacy (5%)"]},
        {"name":"Emrakul, the Aeons Torn", "formats": ["Modern (7%)"]},
        {"name":"Emrakul, the Promised End", "formats": ["Modern (6%)"]},
        {"name":"Emry, Lurker of the Loch", "formats": ["Vintage (4%)"]},
        {"name":"End the Festivities", "formats": ["Legacy (13%)"]},
        {"name":"Endurance", "formats": ["Modern (25%)", "Legacy (27%)", "Vintage (8%)"]},
        {"name":"Engineered Explosives", "formats": ["Modern (42%)"]},
        {"name":"Environmental Sciences", "formats": ["Standard (43%)"]},
        {"name":"Ephemerate", "formats": ["Modern (10%)", "Pauper (15%)"]},
        {"name":"Esika's Chariot", "formats": ["Standard (20%)", "Pioneer (10%)"]},
        {"name":"Esper Sentinel", "formats": ["Modern (12%)"]},
        {"name":"Eternal Scourge", "formats": ["Pioneer (5%)"]},
        {"name":"Eternal Witness", "formats": ["Modern (6%)"]},
        {"name":"Ethersworn Canonist", "formats": ["Legacy (10%)"]},
        {"name":"Evolving Wilds", "formats": ["Standard (1%)", "Pauper (11%)"]},
        {"name":"Expedition Map", "formats": ["Modern (9%)"]},
        {"name":"Expressive Iteration", "formats": ["Standard (30%)", "Pioneer (24%)", "Modern (26%)", "Legacy (25%)", "Vintage (14%)"]},
        {"name":"Eyetwitch", "formats": ["Standard (8%)"]},
        {"name":"Fabled Passage", "formats": ["Pioneer (24%)"]},
        {"name":"Faceless Haven", "formats": ["Standard (42%)"]},
        {"name":"Fading Hope", "formats": ["Standard (35%)", "Pioneer (8%)"]},
        {"name":"Fae of Wishes", "formats": ["Pioneer (4%)"]},
        {"name":"Faerie Macabre", "formats": ["Legacy (10%)"]},
        {"name":"Faerie Miscreant", "formats": ["Pauper (4%)"]},
        {"name":"Faerie Seer", "formats": ["Pauper (12%)"]},
        {"name":"Faithless Looting", "formats": ["Legacy (10%)", "Pauper (11%)"]},
        {"name":"Fangren Marauder", "formats": ["Pauper (5%)"]},
        {"name":"Fatal Push", "formats": ["Pioneer (33%)", "Modern (14%)", "Vintage (22%)"]},
        {"name":"Fateful Absence", "formats": ["Standard (11%)"]},
        {"name":"Faultgrinder", "formats": ["Pauper (4%)"]},
        {"name":"Fell Stinger", "formats": ["Standard (7%)"]},
        {"name":"Field of Ruin", "formats": ["Standard (37%)", "Pioneer (8%)"]},
        {"name":"Field of the Dead", "formats": ["Legacy (9%)"]},
        {"name":"Fiery Cannonade", "formats": ["Pauper (37%)"]},
        {"name":"Fiery Impulse", "formats": ["Pioneer (8%)"]},
        {"name":"Fiery Islet", "formats": ["Modern (13%)"]},
        {"name":"Flame-Blessed Bolt", "formats": ["Standard (8%)", "Pioneer (21%)"]},
        {"name":"Flaring Pain", "formats": ["Pauper (9%)"]},
        {"name":"Flickerwisp", "formats": ["Legacy (6%)"]},
        {"name":"Fling", "formats": ["Pauper (26%)"]},
        {"name":"Flooded Strand", "formats": ["Modern (35%)", "Legacy (40%)", "Vintage (48%)"]},
        {"name":"Florian, Voldaren Scion", "formats": ["Standard (4%)"]},
        {"name":"Flusterstorm", "formats": ["Modern (12%)", "Legacy (21%)", "Vintage (59%)"]},
        {"name":"Forbidden Orchard", "formats": ["Vintage (6%)"]},
        {"name":"Force of Negation", "formats": ["Modern (25%)", "Legacy (44%)", "Vintage (52%)"]},
        {"name":"Force of Vigor", "formats": ["Modern (26%)", "Legacy (22%)", "Vintage (29%)"]},
        {"name":"Force of Will", "formats": ["Legacy (50%)", "Vintage (77%)"]},
        {"name":"Forgotten Cave", "formats": ["Pauper (8%)"]},
        {"name":"Foundation Breaker", "formats": ["Modern (5%)"]},
        {"name":"Foundry Inspector", "formats": ["Vintage (8%)"]},
        {"name":"Froghemoth", "formats": ["Standard (4%)"]},
        {"name":"Frogmite", "formats": ["Pauper (14%)"]},
        {"name":"Frostboil Snarl", "formats": ["Standard (3%)"]},
        {"name":"Fry", "formats": ["Pioneer (10%)"]},
        {"name":"Fury", "formats": ["Modern (21%)"]},
        {"name":"Gaea's Cradle", "formats": ["Legacy (8%)", "Vintage (3%)"]},
        {"name":"Galvanic Blast", "formats": ["Pauper (33%)"]},
        {"name":"Galvanic Iteration", "formats": ["Standard (24%)", "Pioneer (17%)"]},
        {"name":"Ghitu Lavarunner", "formats": ["Pioneer (4%)", "Pauper (6%)"]},
        {"name":"Ghost Quarter", "formats": ["Modern (6%)", "Legacy (6%)", "Vintage (8%)"]},
        {"name":"Ghostly Flicker", "formats": ["Pauper (9%)"]},
        {"name":"Gifted Aetherborn", "formats": ["Pioneer (13%)"]},
        {"name":"Gilded Goose", "formats": ["Pioneer (12%)"]},
        {"name":"Gingerbrute", "formats": ["Vintage (6%)"]},
        {"name":"Gitaxian Probe", "formats": ["Vintage (63%)"]},
        {"name":"Glacial Chasm", "formats": ["Legacy (5%)"]},
        {"name":"Glacial Fortress", "formats": ["Pioneer (11%)"]},
        {"name":"Gladecover Scout", "formats": ["Pauper (5%)"]},
        {"name":"Glorybringer", "formats": ["Pioneer (6%)"]},
        {"name":"Go Blank", "formats": ["Standard (27%)", "Pioneer (25%)"]},
        {"name":"Goblin Guide", "formats": ["Modern (6%)"]},
        {"name":"God-Pharaoh's Faithful", "formats": ["Pauper (5%)"]},
        {"name":"Godless Shrine", "formats": ["Pioneer (14%)", "Modern (10%)"]},
        {"name":"Goldmire Bridge", "formats": ["Vintage (1%)"]},
        {"name":"Goldspan Dragon", "formats": ["Standard (30%)"]},
        {"name":"Golgari Grave-Troll", "formats": ["Vintage (13%)"]},
        {"name":"Golgari Thug", "formats": ["Vintage (13%)"]},
        {"name":"Golos, Tireless Pilgrim", "formats": ["Vintage (4%)"]},
        {"name":"Gorilla Shaman", "formats": ["Pauper (38%)"]},
        {"name":"Grafdigger's Cage", "formats": ["Pioneer (24%)", "Legacy (19%)", "Vintage (46%)"]},
        {"name":"Graveyard Trespasser", "formats": ["Standard (9%)", "Pioneer (11%)"]},
        {"name":"Great Furnace", "formats": ["Pauper (29%)"]},
        {"name":"Green Sun's Zenith", "formats": ["Legacy (20%)"]},
        {"name":"Grief", "formats": ["Legacy (8%)", "Vintage (13%)"]},
        {"name":"Griselbrand", "formats": ["Legacy (8%)"]},
        {"name":"Grist, the Hunger Tide", "formats": ["Legacy (14%)"]},
        {"name":"Grove of the Burnwillows", "formats": ["Legacy (5%)"]},
        {"name":"Guardian of Faith", "formats": ["Standard (11%)"]},
        {"name":"Guardian of the Guildpact", "formats": ["Pauper (7%)"]},
        {"name":"Gurmag Angler", "formats": ["Pauper (5%)"]},
        {"name":"Gush", "formats": ["Vintage (17%)"]},
        {"name":"Gut Shot", "formats": ["Legacy (13%)", "Pauper (12%)"]},
        {"name":"Hall of Storm Giants", "formats": ["Standard (36%)", "Pioneer (19%)", "Modern (7%)"]},
        {"name":"Hallowed Fountain", "formats": ["Pioneer (14%)", "Modern (23%)"]},
        {"name":"Haunted Ridge", "formats": ["Standard (10%)", "Pioneer (9%)"]},
        {"name":"Heliod's Pilgrim", "formats": ["Pauper (5%)"]},
        {"name":"Hengegate Pathway", "formats": ["Standard (6%)", "Pioneer (7%)"]},
        {"name":"Heritage Druid", "formats": ["Legacy (5%)"]},
        {"name":"Hive of the Eye Tyrant", "formats": ["Standard (16%)", "Pioneer (20%)"]},
        {"name":"Hollow One", "formats": ["Vintage (17%)"]},
        {"name":"Hopeful Initiate", "formats": ["Standard (16%)"]},
        {"name":"Horizon Canopy", "formats": ["Vintage (2%)"]},
        {"name":"Hullbreacher", "formats": ["Legacy (7%)", "Vintage (11%)"]},
        {"name":"Hullbreaker Horror", "formats": ["Standard (30%)"]},
        {"name":"Hurkyl's Recall", "formats": ["Vintage (23%)"]},
        {"name":"Hushbringer", "formats": ["Modern (4%)"]},
        {"name":"Hydroblast", "formats": ["Legacy (24%)", "Pauper (18%)"]},
        {"name":"Ice Tunnel", "formats": ["Standard (1%)", "Pauper (4%)"]},
        {"name":"Ice-Fang Coatl", "formats": ["Modern (5%)", "Legacy (9%)"]},
        {"name":"Ichor Wellspring", "formats": ["Pauper (28%)"]},
        {"name":"Ichorid", "formats": ["Vintage (13%)"]},
        {"name":"Ignoble Hierarch", "formats": ["Modern (5%)"]},
        {"name":"Immersturm Predator", "formats": ["Standard (6%)"]},
        {"name":"Infernal Grasp", "formats": ["Standard (22%)"]},
        {"name":"Ingenious Smith", "formats": ["Modern (4%)"]},
        {"name":"Inkmoth Nexus", "formats": ["Modern (11%)"]},
        {"name":"Inquisition of Kozilek", "formats": ["Modern (18%)"]},
        {"name":"Inscription of Abundance", "formats": ["Standard (13%)"]},
        {"name":"Inspiring Vantage", "formats": ["Pioneer (14%)", "Modern (7%)"]},
        {"name":"Intrepid Adversary", "formats": ["Standard (20%)"]},
        {"name":"Inventors' Fair", "formats": ["Vintage (3%)"]},
        {"name":"Iona, Shield of Emeria", "formats": ["Legacy (6%)"]},
        {"name":"Iymrith, Desert Doom", "formats": ["Standard (5%)"]},
        {"name":"Jace, the Mind Sculptor", "formats": ["Modern (15%)"]},
        {"name":"Jace, Wielder of Mysteries", "formats": ["Pioneer (12%)"]},
        {"name":"Jaspera Sentinel", "formats": ["Standard (5%)"]},
        {"name":"Jegantha, the Wellspring", "formats": ["Pioneer (7%)"]},
        {"name":"Journey to Nowhere", "formats": ["Pauper (13%)"]},
        {"name":"Jwari Disruption", "formats": ["Standard (36%)"]},
        {"name":"Kabira Crossroads", "formats": ["Pauper (2%)"]},
        {"name":"Kaheera, the Orphanguard", "formats": ["Modern (9%)"]},
        {"name":"Kaldra Compleat", "formats": ["Legacy (10%)"]},
        {"name":"Kalitas, Traitor of Ghet", "formats": ["Pioneer (20%)"]},
        {"name":"Karakas", "formats": ["Legacy (54%)", "Vintage (16%)"]},
        {"name":"Karn, the Great Creator", "formats": ["Vintage (18%)"]},
        {"name":"Kataki, War's Wage", "formats": ["Vintage (5%)"]},
        {"name":"Kazandu Mammoth", "formats": ["Standard (10%)"]},
        {"name":"Keldon Marauders", "formats": ["Pauper (5%)"]},
        {"name":"Ketria Triome", "formats": ["Pioneer (9%)", "Modern (14%)"]},
        {"name":"Knight of Autumn", "formats": ["Pioneer (4%)", "Legacy (10%)"]},
        {"name":"Knight of the Ebon Legion", "formats": ["Pioneer (10%)"]},
        {"name":"Knight of the Reliquary", "formats": ["Legacy (6%)"]},
        {"name":"Kolaghan's Command", "formats": ["Pioneer (11%)", "Modern (15%)"]},
        {"name":"Kor Firewalker", "formats": ["Modern (5%)"]},
        {"name":"Kor Skyfisher", "formats": ["Pauper (4%)"]},
        {"name":"Krark-Clan Shaman", "formats": ["Pauper (26%)"]},
        {"name":"Kroxa, Titan of Death's Hunger", "formats": ["Pioneer (7%)", "Modern (11%)"]},
        {"name":"Laelia, the Blade Reforged", "formats": ["Vintage (11%)"]},
        {"name":"Lair of the Hydra", "formats": ["Standard (15%)", "Pioneer (12%)"]},
        {"name":"Lavinia, Azorius Renegade", "formats": ["Vintage (5%)"]},
        {"name":"Legion Angel", "formats": ["Standard (5%)"]},
        {"name":"Legion's End", "formats": ["Pioneer (16%)"]},
        {"name":"Leonin Arbiter", "formats": ["Vintage (4%)"]},
        {"name":"Leovold, Emissary of Trest", "formats": ["Legacy (10%)", "Vintage (4%)"]},
        {"name":"Leyline of the Void", "formats": ["Legacy (13%)", "Vintage (38%)"]},
        {"name":"Library of Alexandria", "formats": ["Vintage (1%)"]},
        {"name":"Lier, Disciple of the Drowned", "formats": ["Standard (30%)"]},
        {"name":"Life from the Loam", "formats": ["Legacy (14%)"]},
        {"name":"Lightning Axe", "formats": ["Pioneer (14%)"]},
        {"name":"Lightning Bolt", "formats": ["Modern (41%)", "Legacy (27%)", "Vintage (24%)", "Pauper (23%)"]},
        {"name":"Lightning Helix", "formats": ["Modern (13%)"]},
        {"name":"Lightning Strike", "formats": ["Pioneer (9%)"]},
        {"name":"Lion's Eye Diamond", "formats": ["Legacy (10%)"]},
        {"name":"Llanowar Elves", "formats": ["Pioneer (12%)"]},
        {"name":"Lodestone Golem", "formats": ["Vintage (12%)"]},
        {"name":"Lolth, Spider Queen", "formats": ["Standard (14%)"]},
        {"name":"Lone Missionary", "formats": ["Pauper (5%)"]},
        {"name":"Lose Focus", "formats": ["Pauper (11%)"]},
        {"name":"Lotus Petal", "formats": ["Legacy (21%)"]},
        {"name":"Luminarch Aspirant", "formats": ["Standard (23%)", "Pioneer (4%)", "Vintage (8%)"]},
        {"name":"Lurrus of the Dream-Den", "formats": ["Pioneer (12%)", "Modern (31%)", "Vintage (5%)"]},
        {"name":"Magda, Brazen Outlaw", "formats": ["Standard (5%)"]},
        {"name":"Magus of the Moon", "formats": ["Legacy (5%)"]},
        {"name":"Makeshift Munitions", "formats": ["Pauper (27%)"]},
        {"name":"Malevolent Hermit", "formats": ["Standard (15%)"]},
        {"name":"Mana Confluence", "formats": ["Pioneer (6%)"]},
        {"name":"Mana Crypt", "formats": ["Vintage (46%)"]},
        {"name":"Mana Vault", "formats": ["Vintage (15%)"]},
        {"name":"Manifold Key", "formats": ["Vintage (27%)"]},
        {"name":"Marsh Flats", "formats": ["Modern (10%)", "Legacy (6%)"]},
        {"name":"Martyr of Ashes", "formats": ["Pauper (5%)"]},
        {"name":"Mascot Exhibition", "formats": ["Standard (43%)"]},
        {"name":"Maze of Ith", "formats": ["Legacy (6%)", "Vintage (2%)"]},
        {"name":"Meltdown", "formats": ["Legacy (25%)"]},
        {"name":"Memnite", "formats": ["Modern (10%)"]},
        {"name":"Memory Deluge", "formats": ["Standard (18%)", "Pioneer (8%)"]},
        {"name":"Mental Misstep", "formats": ["Vintage (87%)"]},
        {"name":"Merchant Scroll", "formats": ["Vintage (30%)"]},
        {"name":"Mindbreak Trap", "formats": ["Legacy (11%)", "Vintage (34%)"]},
        {"name":"Mishra's Bauble", "formats": ["Modern (28%)", "Legacy (17%)"]},
        {"name":"Mishra's Workshop", "formats": ["Vintage (13%)"]},
        {"name":"Mistvault Bridge", "formats": ["Pauper (20%)"]},
        {"name":"Misty Rainforest", "formats": ["Modern (35%)", "Legacy (48%)", "Vintage (49%)"]},
        {"name":"Mizzium Mortars", "formats": ["Pioneer (8%)"]},
        {"name":"Mnemonic Wall", "formats": ["Pauper (4%)"]},
        {"name":"Monastery Mentor", "formats": ["Vintage (6%)"]},
        {"name":"Monastery Swiftspear", "formats": ["Pioneer (7%)", "Modern (8%)"]},
        {"name":"Mortuary Mire", "formats": ["Pauper (7%)"]},
        {"name":"Mother of Runes", "formats": ["Legacy (8%)"]},
        {"name":"Mox Diamond", "formats": ["Legacy (10%)"]},
        {"name":"Mox Emerald", "formats": ["Vintage (62%)"]},
        {"name":"Mox Jet", "formats": ["Vintage (75%)"]},
        {"name":"Mox Pearl", "formats": ["Vintage (59%)"]},
        {"name":"Mox Ruby", "formats": ["Vintage (71%)"]},
        {"name":"Mox Sapphire", "formats": ["Vintage (82%)"]},
        {"name":"Mulldrifter", "formats": ["Pauper (15%)"]},
        {"name":"Murderous Rider", "formats": ["Pioneer (11%)"]},
        {"name":"Murktide Regent", "formats": ["Modern (9%)", "Legacy (24%)", "Vintage (6%)"]},
        {"name":"Mutagenic Growth", "formats": ["Pauper (8%)"]},
        {"name":"Mutavault", "formats": ["Pioneer (18%)"]},
        {"name":"Myr Enforcer", "formats": ["Pauper (26%)"]},
        {"name":"Mystic Gate", "formats": ["Modern (6%)"]},
        {"name":"Mystic Sanctuary", "formats": ["Vintage (5%)"]},
        {"name":"Mystical Dispute", "formats": ["Pioneer (40%)", "Modern (24%)"]},
        {"name":"Mystical Tutor", "formats": ["Vintage (25%)"]},
        {"name":"Narcomoeba", "formats": ["Vintage (13%)"]},
        {"name":"Narset, Parter of Veils", "formats": ["Pioneer (20%)", "Legacy (10%)", "Vintage (45%)"]},
        {"name":"Needleverge Pathway", "formats": ["Standard (4%)", "Pioneer (9%)"]},
        {"name":"Negate", "formats": ["Pioneer (15%)"]},
        {"name":"Nihil Spellbomb", "formats": ["Modern (18%)"]},
        {"name":"Ninja of the Deep Hours", "formats": ["Pauper (13%)"]},
        {"name":"Nurturing Peatland", "formats": ["Modern (8%)"]},
        {"name":"Obstinate Baloth", "formats": ["Modern (3%)"]},
        {"name":"Okiba-Gang Shinobi", "formats": ["Pauper (3%)"]},
        {"name":"Old-Growth Troll", "formats": ["Standard (12%)"]},
        {"name":"Omnath, Locus of Creation", "formats": ["Pioneer (6%)", "Modern (12%)"]},
        {"name":"Once Upon a Time", "formats": ["Legacy (11%)"]},
        {"name":"Opposition Agent", "formats": ["Vintage (15%)"]},
        {"name":"Opt", "formats": ["Pioneer (19%)"]},
        {"name":"Ornithopter", "formats": ["Modern (9%)"]},
        {"name":"Orzhov Basilica", "formats": ["Pauper (3%)"]},
        {"name":"Outland Liberator", "formats": ["Standard (12%)", "Modern (6%)"]},
        {"name":"Overgrown Farmland", "formats": ["Standard (2%)"]},
        {"name":"Overgrown Tomb", "formats": ["Pioneer (8%)", "Modern (10%)"]},
        {"name":"Palace Sentinels", "formats": ["Pauper (8%)"]},
        {"name":"Paladin Class", "formats": ["Standard (15%)"]},
        {"name":"Path to Exile", "formats": ["Modern (19%)"]},
        {"name":"Phyrexian Revoker", "formats": ["Vintage (14%)"]},
        {"name":"Pieces of the Puzzle", "formats": ["Pioneer (12%)"]},
        {"name":"Pithing Needle", "formats": ["Modern (23%)", "Legacy (23%)", "Vintage (64%)"]},
        {"name":"Plague Engineer", "formats": ["Legacy (15%)"]},
        {"name":"Plateau", "formats": ["Vintage (1%)"]},
        {"name":"Play with Fire", "formats": ["Pioneer (19%)"]},
        {"name":"Polluted Delta", "formats": ["Modern (23%)", "Legacy (33%)", "Vintage (46%)"]},
        {"name":"Ponder", "formats": ["Legacy (47%)", "Vintage (49%)", "Pauper (12%)"]},
        {"name":"Port of Karfell", "formats": ["Standard (1%)"]},
        {"name":"Portable Hole", "formats": ["Standard (21%)", "Pioneer (14%)"]},
        {"name":"Power Word Kill", "formats": ["Standard (13%)"]},
        {"name":"Preordain", "formats": ["Legacy (10%)", "Vintage (35%)", "Pauper (24%)"]},
        {"name":"Primeval Titan", "formats": ["Modern (6%)", "Legacy (7%)"]},
        {"name":"Prismari Campus", "formats": ["Standard (1%)"]},
        {"name":"Prismari Command", "formats": ["Standard (14%)"]},
        {"name":"Prismatic Ending", "formats": ["Modern (35%)", "Legacy (24%)"]},
        {"name":"Prismatic Strands", "formats": ["Pauper (12%)"]},
        {"name":"Prismatic Vista", "formats": ["Legacy (14%)"]},
        {"name":"Prized Amalgam", "formats": ["Vintage (13%)"]},
        {"name":"Professor of Symbology", "formats": ["Standard (4%)"]},
        {"name":"Progenitus", "formats": ["Legacy (5%)"]},
        {"name":"Prohibit", "formats": ["Pauper (10%)"]},
        {"name":"Prophetic Prism", "formats": ["Pauper (22%)"]},
        {"name":"Prosperous Innkeeper", "formats": ["Standard (6%)", "Pioneer (12%)"]},
        {"name":"Puresteel Paladin", "formats": ["Modern (9%)"]},
        {"name":"Pyrite Spellbomb", "formats": ["Modern (8%)"]},
        {"name":"Pyroblast", "formats": ["Legacy (39%)", "Vintage (34%)", "Pauper (30%)"]},
        {"name":"Radiant Fountain", "formats": ["Pauper (4%)"]},
        {"name":"Ragavan, Nimble Pilferer", "formats": ["Modern (28%)", "Legacy (24%)", "Vintage (27%)"]},
        {"name":"Ramunap Excavator", "formats": ["Legacy (11%)"]},
        {"name":"Ramunap Ruins", "formats": ["Pioneer (7%)"]},
        {"name":"Rancor", "formats": ["Pauper (8%)"]},
        {"name":"Ranger Class", "formats": ["Standard (17%)", "Pioneer (8%)"]},
        {"name":"Raugrin Triome", "formats": ["Pioneer (9%)", "Modern (20%)"]},
        {"name":"Ravenous Trap", "formats": ["Vintage (20%)"]},
        {"name":"Ray of Enfeeblement", "formats": ["Standard (15%)"]},
        {"name":"Razortide Bridge", "formats": ["Pauper (5%)"]},
        {"name":"Reckless Stormseeker", "formats": ["Standard (7%)"]},
        {"name":"Recruiter of the Guard", "formats": ["Legacy (7%)"]},
        {"name":"Red Elemental Blast", "formats": ["Legacy (20%)", "Pauper (34%)"]},
        {"name":"Reidane, God of the Worthy", "formats": ["Standard (22%)"]},
        {"name":"Relic of Progenitus", "formats": ["Modern (21%)", "Pauper (15%)"]},
        {"name":"Rending Volley", "formats": ["Pioneer (23%)"]},
        {"name":"Rest in Peace", "formats": ["Pioneer (23%)", "Modern (12%)"]},
        {"name":"Retrofitter Foundry", "formats": ["Legacy (15%)"]},
        {"name":"Revoke Existence", "formats": ["Pauper (15%)"]},
        {"name":"Rimewood Falls", "formats": ["Standard (0%)"]},
        {"name":"Rishadan Port", "formats": ["Legacy (9%)"]},
        {"name":"Riverglide Pathway", "formats": ["Standard (31%)", "Pioneer (17%)"]},
        {"name":"Rockfall Vale", "formats": ["Standard (6%)"]},
        {"name":"Roiling Vortex", "formats": ["Pioneer (11%)"]},
        {"name":"Rustvale Bridge", "formats": ["Pauper (8%)"]},
        {"name":"Sacred Foundry", "formats": ["Pioneer (15%)", "Modern (24%)"]},
        {"name":"Sanctifier en-Vec", "formats": ["Modern (14%)"]},
        {"name":"Sanctum Prelate", "formats": ["Legacy (6%)"]},
        {"name":"Savannah", "formats": ["Legacy (19%)", "Vintage (2%)"]},
        {"name":"Saw It Coming", "formats": ["Standard (9%)"]},
        {"name":"Scalding Tarn", "formats": ["Modern (38%)", "Legacy (34%)", "Vintage (51%)"]},
        {"name":"Scavenging Ooze", "formats": ["Pioneer (4%)", "Modern (4%)", "Legacy (5%)"]},
        {"name":"Scoured Barrens", "formats": ["Pauper (3%)"]},
        {"name":"Scrubland", "formats": ["Legacy (9%)", "Vintage (2%)"]},
        {"name":"Sculptor of Winter", "formats": ["Standard (11%)"]},
        {"name":"Sea Gate Oracle", "formats": ["Pauper (11%)"]},
        {"name":"Seasoned Pyromancer", "formats": ["Modern (5%)"]},
        {"name":"Seat of the Synod", "formats": ["Vintage (4%)", "Pauper (18%)"]},
        {"name":"Secluded Steppe", "formats": ["Pauper (5%)"]},
        {"name":"Sedgemoor Witch", "formats": ["Standard (4%)"]},
        {"name":"Seeker of the Way", "formats": ["Pauper (6%)"]},
        {"name":"Sejiri Steppe", "formats": ["Legacy (5%)"]},
        {"name":"Selfless Spirit", "formats": ["Pioneer (10%)"]},
        {"name":"Sensei's Divining Top", "formats": ["Vintage (38%)"]},
        {"name":"Serra's Emissary", "formats": ["Legacy (7%)", "Vintage (4%)"]},
        {"name":"Serum Powder", "formats": ["Vintage (16%)"]},
        {"name":"Serum Visions", "formats": ["Modern (9%)"]},
        {"name":"Shadowspear", "formats": ["Modern (18%)", "Legacy (12%)"]},
        {"name":"Shambling Ghast", "formats": ["Standard (12%)"]},
        {"name":"Shambling Shell", "formats": ["Vintage (13%)"]},
        {"name":"Shardless Agent", "formats": ["Modern (6%)"]},
        {"name":"Shark Typhoon", "formats": ["Pioneer (11%)"]},
        {"name":"Shattered Sanctum", "formats": ["Standard (8%)"]},
        {"name":"Shattering Spree", "formats": ["Vintage (19%)"]},
        {"name":"Shatterskull Smashing", "formats": ["Standard (15%)", "Pioneer (9%)"]},
        {"name":"Shenanigans", "formats": ["Pauper (16%)"]},
        {"name":"Shineshadow Snarl", "formats": ["Standard (1%)"]},
        {"name":"Shipwreck Marsh", "formats": ["Standard (11%)"]},
        {"name":"Sigarda's Aid", "formats": ["Modern (9%)"]},
        {"name":"Silent Clearing", "formats": ["Modern (10%)"]},
        {"name":"Silhana Ledgewalker", "formats": ["Pauper (7%)"]},
        {"name":"Silverbluff Bridge", "formats": ["Pauper (19%)"]},
        {"name":"Silverquill Campus", "formats": ["Pauper (2%)"]},
        {"name":"Simian Spirit Guide", "formats": ["Legacy (5%)"]},
        {"name":"Skullport Merchant", "formats": ["Standard (6%)"]},
        {"name":"Skyclave Apparition", "formats": ["Standard (22%)", "Pioneer (11%)", "Legacy (7%)"]},
        {"name":"Slippery Bogle", "formats": ["Pauper (5%)"]},
        {"name":"Smash to Smithereens", "formats": ["Pauper (8%)"]},
        {"name":"Smoldering Egg", "formats": ["Standard (21%)"]},
        {"name":"Snakeskin Veil", "formats": ["Standard (17%)"]},
        {"name":"Snap", "formats": ["Pauper (9%)"]},
        {"name":"Snapcaster Mage", "formats": ["Modern (4%)", "Legacy (6%)"]},
        {"name":"Snow-Covered Forest", "formats": ["Standard (14%)", "Modern (8%)", "Legacy (13%)"]},
        {"name":"Snow-Covered Island", "formats": ["Standard (7%)", "Modern (9%)", "Legacy (15%)", "Vintage (11%)", "Pauper (16%)"]},
        {"name":"Snow-Covered Mountain", "formats": ["Standard (7%)", "Modern (8%)", "Vintage (2%)", "Pauper (11%)"]},
        {"name":"Snow-Covered Plains", "formats": ["Standard (24%)", "Modern (10%)", "Legacy (11%)", "Pauper (6%)"]},
        {"name":"Snow-Covered Swamp", "formats": ["Standard (11%)", "Pauper (2%)"]},
        {"name":"Snowfield Sinkhole", "formats": ["Standard (5%)"]},
        {"name":"Sol Ring", "formats": ["Vintage (43%)"]},
        {"name":"Solitude", "formats": ["Modern (21%)", "Legacy (6%)"]},
        {"name":"Sorin the Mirthless", "formats": ["Standard (12%)", "Pioneer (15%)"]},
        {"name":"Sorin, Imperious Bloodlord", "formats": ["Pioneer (10%)"]},
        {"name":"Soul of Migration", "formats": ["Pauper (5%)"]},
        {"name":"Soul Shatter", "formats": ["Standard (13%)"]},
        {"name":"Soul-Guide Lantern", "formats": ["Modern (14%)", "Legacy (11%)", "Vintage (41%)"]},
        {"name":"Soul-Scar Mage", "formats": ["Pioneer (11%)"]},
        {"name":"Spell Pierce", "formats": ["Modern (15%)"]},
        {"name":"Spellstutter Sprite", "formats": ["Pauper (12%)"]},
        {"name":"Sphinx of the Steel Wind", "formats": ["Vintage (28%)"]},
        {"name":"Spikefield Hazard", "formats": ["Standard (30%)", "Pioneer (18%)"]},
        {"name":"Spire Golem", "formats": ["Pauper (4%)"]},
        {"name":"Spirebluff Canal", "formats": ["Pioneer (14%)", "Modern (11%)"]},
        {"name":"Spirit of the Labyrinth", "formats": ["Legacy (6%)", "Vintage (7%)"]},
        {"name":"Spreading Seas", "formats": ["Modern (14%)"]},
        {"name":"Springleaf Drum", "formats": ["Modern (11%)"]},
        {"name":"Squadron Hawk", "formats": ["Pauper (10%)"]},
        {"name":"Standard Bearer", "formats": ["Pauper (9%)"]},
        {"name":"Steam Vents", "formats": ["Pioneer (24%)", "Modern (38%)", "Legacy (15%)"]},
        {"name":"Stinkweed Imp", "formats": ["Vintage (13%)"]},
        {"name":"Stomping Ground", "formats": ["Pioneer (20%)", "Modern (25%)"]},
        {"name":"Stonebinder's Familiar", "formats": ["Standard (5%)"]},
        {"name":"Stonecoil Serpent", "formats": ["Vintage (11%)"]},
        {"name":"Stoneforge Mystic", "formats": ["Modern (12%)", "Legacy (10%)"]},
        {"name":"Stonehorn Dignitary", "formats": ["Pauper (11%)"]},
        {"name":"Stormbound Geist", "formats": ["Pauper (8%)"]},
        {"name":"Stormcarved Coast", "formats": ["Standard (28%)", "Pioneer (11%)"]},
        {"name":"Street Wraith", "formats": ["Vintage (8%)"]},
        {"name":"Strip Mine", "formats": ["Vintage (58%)"]},
        {"name":"Submerge", "formats": ["Legacy (16%)"]},
        {"name":"Subtlety", "formats": ["Modern (8%)"]},
        {"name":"Suffocating Fumes", "formats": ["Pauper (10%)"]},
        {"name":"Sulfur Falls", "formats": ["Pioneer (11%)"]},
        {"name":"Sulfurous Mire", "formats": ["Standard (1%)"]},
        {"name":"Sunbaked Canyon", "formats": ["Modern (10%)"]},
        {"name":"Sundown Pass", "formats": ["Standard (3%)"]},
        {"name":"Sungold Sentinel", "formats": ["Standard (12%)"]},
        {"name":"Sunpetal Grove", "formats": ["Pioneer (7%)"]},
        {"name":"Sunscape Familiar", "formats": ["Pauper (5%)"]},
        {"name":"Sunset Revelry", "formats": ["Pioneer (10%)"]},
        {"name":"Supreme Verdict", "formats": ["Pioneer (10%)", "Modern (11%)"]},
        {"name":"Surgical Extraction", "formats": ["Legacy (39%)"]},
        {"name":"Swiftwater Cliffs", "formats": ["Pauper (2%)"]},
        {"name":"Swords to Plowshares", "formats": ["Legacy (31%)"]},
        {"name":"Sylvan Caryatid", "formats": ["Pioneer (6%)"]},
        {"name":"Sylvan Library", "formats": ["Legacy (17%)"]},
        {"name":"Taiga", "formats": ["Legacy (9%)"]},
        {"name":"Tajuru Blightblade", "formats": ["Standard (11%)"]},
        {"name":"Tangled Florahedron", "formats": ["Standard (4%)"]},
        {"name":"Tarmogoyf", "formats": ["Modern (5%)", "Vintage (5%)"]},
        {"name":"Teachings of the Archaics", "formats": ["Standard (34%)"]},
        {"name":"Teferi, Hero of Dominaria", "formats": ["Modern (11%)"]},
        {"name":"Teferi, Time Raveler", "formats": ["Modern (23%)", "Legacy (10%)"]},
        {"name":"Temple Garden", "formats": ["Pioneer (18%)", "Modern (17%)"]},
        {"name":"Temporal Trespass", "formats": ["Pioneer (13%)"]},
        {"name":"Terminate", "formats": ["Modern (12%)"]},
        {"name":"Terramorphic Expanse", "formats": ["Pauper (2%)"]},
        {"name":"Terrarion", "formats": ["Pauper (15%)"]},
        {"name":"Test of Talents", "formats": ["Standard (39%)"]},
        {"name":"Thalia, Guardian of Thraben", "formats": ["Standard (22%)", "Pioneer (5%)", "Legacy (7%)", "Vintage (9%)"]},
        {"name":"Thalia's Lieutenant", "formats": ["Pioneer (4%)"]},
        {"name":"Thassa's Oracle", "formats": ["Vintage (7%)"]},
        {"name":"The Celestus", "formats": ["Standard (21%)"]},
        {"name":"The Meathook Massacre", "formats": ["Standard (22%)"]},
        {"name":"The Tabernacle at Pendrell Vale", "formats": ["Legacy (7%)", "Vintage (37%)"]},
        {"name":"The World Tree", "formats": ["Standard (1%)"]},
        {"name":"Thermo-Alchemist", "formats": ["Pauper (6%)"]},
        {"name":"Thespian's Stage", "formats": ["Legacy (8%)"]},
        {"name":"Thing in the Ice", "formats": ["Pioneer (18%)"]},
        {"name":"Thorn of the Black Rose", "formats": ["Pauper (9%)"]},
        {"name":"Thornwood Falls", "formats": ["Pauper (3%)"]},
        {"name":"Thought Monitor", "formats": ["Vintage (4%)"]},
        {"name":"Thoughtcast", "formats": ["Pauper (14%)"]},
        {"name":"Thoughtseize", "formats": ["Pioneer (31%)", "Modern (30%)", "Legacy (21%)"]},
        {"name":"Thraben Inspector", "formats": ["Pioneer (6%)", "Pauper (12%)"]},
        {"name":"Thriving Grove", "formats": ["Pauper (4%)"]},
        {"name":"Thriving Isle", "formats": ["Pauper (4%)"]},
        {"name":"Thrun, the Last Troll", "formats": ["Modern (4%)"]},
        {"name":"Thundering Rebuke", "formats": ["Standard (19%)"]},
        {"name":"Time Vault", "formats": ["Vintage (27%)"]},
        {"name":"Time Walk", "formats": ["Vintage (62%)"]},
        {"name":"Tinker", "formats": ["Vintage (31%)"]},
        {"name":"Tolarian Academy", "formats": ["Vintage (28%)"]},
        {"name":"Torpor Orb", "formats": ["Modern (11%)", "Legacy (26%)"]},
        {"name":"Tourach, Dread Cantor", "formats": ["Modern (10%)"]},
        {"name":"Tovolar, Dire Overlord", "formats": ["Pioneer (9%)"]},
        {"name":"Tovolar's Huntmaster", "formats": ["Pioneer (9%)"]},
        {"name":"Tranquil Cove", "formats": ["Pauper (3%)"]},
        {"name":"Treasure Cruise", "formats": ["Pioneer (18%)"]},
        {"name":"Tropical Island", "formats": ["Legacy (17%)", "Vintage (14%)"]},
        {"name":"True-Name Nemesis", "formats": ["Legacy (9%)"]},
        {"name":"Tundra", "formats": ["Legacy (20%)", "Vintage (6%)"]},
        {"name":"Ulvenwald Oddity", "formats": ["Standard (12%)"]},
        {"name":"Umezawa's Jitte", "formats": ["Legacy (9%)"]},
        {"name":"Unclaimed Territory", "formats": ["Vintage (1%)"]},
        {"name":"Underground Sea", "formats": ["Legacy (12%)", "Vintage (46%)"]},
        {"name":"Unexpected Windfall", "formats": ["Standard (25%)"]},
        {"name":"Unholy Heat", "formats": ["Modern (28%)"]},
        {"name":"Urborg, Tomb of Yawgmoth", "formats": ["Pioneer (14%)", "Modern (9%)"]},
        {"name":"Uro, Titan of Nature's Wrath", "formats": ["Legacy (14%)"]},
        {"name":"Urza, Lord High Artificer", "formats": ["Vintage (6%)"]},
        {"name":"Urza's Mine", "formats": ["Pauper (5%)"]},
        {"name":"Urza's Power Plant", "formats": ["Pauper (5%)"]},
        {"name":"Urza's Saga", "formats": ["Modern (25%)", "Legacy (22%)", "Vintage (53%)"]},
        {"name":"Urza's Tower", "formats": ["Pauper (5%)"]},
        {"name":"Usher of the Fallen", "formats": ["Standard (18%)"]},
        {"name":"Valakut, the Molten Pinnacle", "formats": ["Modern (6%)"]},
        {"name":"Valki, God of Lies", "formats": ["Standard (6%)"]},
        {"name":"Valorous Stance", "formats": ["Standard (19%)"]},
        {"name":"Vampiric Tutor", "formats": ["Vintage (35%)"]},
        {"name":"Vanishing Verse", "formats": ["Standard (11%)"]},
        {"name":"Vault of Whispers", "formats": ["Pauper (28%)"]},
        {"name":"Veil of Summer", "formats": ["Modern (16%)"]},
        {"name":"Vengevine", "formats": ["Vintage (4%)"]},
        {"name":"Verdant Catacombs", "formats": ["Modern (12%)", "Legacy (19%)", "Vintage (5%)"]},
        {"name":"Viashino Pyromancer", "formats": ["Pioneer (4%)"]},
        {"name":"Voice of Resurgence", "formats": ["Pioneer (9%)"]},
        {"name":"Void Mirror", "formats": ["Modern (11%)"]},
        {"name":"Volatile Fjord", "formats": ["Standard (2%)", "Pauper (5%)"]},
        {"name":"Volcanic Island", "formats": ["Legacy (31%)", "Vintage (33%)"]},
        {"name":"Voldaren Estate", "formats": ["Standard (1%)", "Pioneer (9%)"]},
        {"name":"Walking Ballista", "formats": ["Modern (7%)", "Vintage (9%)"]},
        {"name":"Wasteland", "formats": ["Legacy (58%)", "Vintage (53%)"]},
        {"name":"Wastes", "formats": ["Vintage (2%)"]},
        {"name":"Watery Grave", "formats": ["Pioneer (7%)", "Modern (13%)", "Vintage (2%)"]},
        {"name":"Weather the Storm", "formats": ["Pauper (9%)"]},
        {"name":"Wedding Invitation", "formats": ["Pauper (17%)"]},
        {"name":"Werewolf Pack Leader", "formats": ["Standard (14%)"]},
        {"name":"Wind-Scarred Crag", "formats": ["Pauper (8%)"]},
        {"name":"Windswept Heath", "formats": ["Modern (22%)", "Legacy (21%)", "Vintage (2%)"]},
        {"name":"Winota, Joiner of Forces", "formats": ["Pioneer (9%)"]},
        {"name":"Wirewood Symbiote", "formats": ["Legacy (5%)"]},
        {"name":"Witch's Cottage", "formats": ["Pauper (2%)"]},
        {"name":"Wooded Foothills", "formats": ["Modern (28%)", "Legacy (17%)", "Vintage (2%)"]},
        {"name":"Woodland Chasm", "formats": ["Standard (1%)"]},
        {"name":"Wrenn and Seven", "formats": ["Standard (12%)"]},
        {"name":"Wrenn and Six", "formats": ["Modern (15%)"]},
        {"name":"Wurmcoil Engine", "formats": ["Modern (4%)", "Vintage (10%)"]},
        {"name":"Yavimaya, Cradle of Growth", "formats": ["Modern (6%)", "Legacy (11%)"]},
        {"name":"Yixlid Jailer", "formats": ["Vintage (5%)"]},
        {"name":"Yorion, Sky Nomad", "formats": ["Pioneer (4%)", "Modern (9%)", "Legacy (12%)"]},
        {"name":"Young Wolf", "formats": ["Pauper (5%)"]}
    ];
    // @formatter:on
}

function loadVintageRestricted() {
    return {
        "Ancestral Recall": true,
        "Balance": true,
        "Black Lotus": true,
        "Brainstorm": true,
        "Chalice of the Void": true,
        "Channel": true,
        "Demonic Consultation": true,
        "Demonic Tutor": true,
        "Dig Through Time": true,
        "Flash": true,
        "Gitaxian Probe": true,
        "Golgari Grave-Troll": true,
        "Gush": true,
        "Imperial Seal": true,
        "Karn, the Great Creator": true,
        "Library of Alexandria": true,
        "Lion's Eye Diamond": true,
        "Lodestone Golem": true,
        "Lotus Petal": true,
        "Mana Crypt": true,
        "Mana Vault": true,
        "Memory Jar": true,
        "Mental Misstep": true,
        "Merchant Scroll": true,
        "Mind's Desire": true,
        "Monastery Mentor": true,
        "Mox Emerald": true,
        "Mox Jet": true,
        "Mox Pearl": true,
        "Mox Ruby": true,
        "Mox Sapphire": true,
        "Mystical Tutor": true,
        "Mystic Forge": true,
        "Narset, Parter of Veils": true,
        "Necropotence": true,
        "Ponder": true,
        "Sol Ring": true,
        "Strip Mine": true,
        "Thorn of Amethyst": true,
        "Timetwister": true,
        "Time Vault": true,
        "Time Walk": true,
        "Tinker": true,
        "Tolarian Academy": true,
        "Treasure Cruise": true,
        "Trinisphere": true,
        "Vampiric Tutor": true,
        "Wheel of Fortune": true,
        "Windfall": true,
        "Yawgmoth's Will": true
    }
}
