inventory: {},
    equipment: {
        weapon: null,
        armor: null,
        shield: null
    },
    npcs: [],
    enemies: [],
    resources: [],
    quests: [],
    skills: {},
    keys: {},
    canvas: null,
    ctx: null,
    tiles: {},
    chunks: {},
    loadedChunks: new Set(),
    
    // ENDING SYSTEM
    endings: {
        karma: 0, // -100 to 100 (evil to good)
        questsCompleted: 0,
        npcsHelped: 0,
        enemiesKilled: 0,
        reachedEnding: false,
        endingType: null // 'hero', 'tyrant', 'neutral'
    },
    
    // Main Story Quest
    mainQuest: {
        stage: 0, // 0-5
        stages: [
            { id: 0, name: 'The Beginning', desc: 'Explore the world and gain strength' },
            { id: 1, name: 'The Dark Forces Rise', desc: 'Dark creatures threaten the kingdom' },
            { id: 2, name: 'The Choice', desc: 'Will you save or conquer?' },
            { id: 3, name: 'The Path Chosen', desc: 'Your destiny unf// ========================================
// MEDIEVAL RPG - MASSIVE WORLD EDITION
// ========================================

// ========================================
// MUSIC SYSTEM
// ========================================

const MusicSystem = {
    tracks: {},
    currentTrack: null,
    currentAudio: null,
    volume: 0.5,
    enabled: true,
    fadeSpeed: 0.02,

    // Initialize all music tracks
    init: function() {
        // Define your music tracks here
        // Replace these URLs with your actual music file paths
        this.tracks = {
            mainMenu: { 
                url: 'music/main-menu.mp3', 
                loop: true,
                volume: 0.6
            },
            townDay: { 
                url: 'music/town-day.mp3', 
                loop: true,
                volume: 0.4
            },
            townNight: { 
                url: 'music/town-night.mp3', 
                loop: true,
                volume: 0.3
            },
            exploration: { 
                url: 'music/exploration.mp3', 
                loop: true,
                volume: 0.5
            },
            forest: { 
                url: 'music/forest.mp3', 
                loop: true,
                volume: 0.4
            },
            mountains: { 
                url: 'music/mountains.mp3', 
                loop: true,
                volume: 0.5
            },
            combat: { 
                url: 'music/combat.mp3', 
                loop: true,
                volume: 0.7
            },
            bossBattle: { 
                url: 'music/boss-battle.mp3', 
                loop: true,
                volume: 0.8
            },
            victory: { 
                url: 'music/victory.mp3', 
                loop: false,
                volume: 0.6
            },
            night: { 
                url: 'music/night.mp3', 
                loop: true,
                volume: 0.3
            },
            dramatic: { 
                url: 'music/dramatic.mp3', 
                loop: false,
                volume: 0.5
            },
            levelUp: { 
                url: 'music/level-up.mp3', 
                loop: false,
                volume: 0.7
            }
        };

        // Preload audio elements
        Object.keys(this.tracks).forEach(key => {
            const track = this.tracks[key];
            track.audio = new Audio(track.url);
            track.audio.loop = track.loop;
            track.audio.volume = 0;
            track.audio.preload = 'auto';
        });

        console.log('Music system initialized with', Object.keys(this.tracks).length, 'tracks');
    },

    // Play a specific track with smooth fade
    play: function(trackName, fadeIn = true) {
        if (!this.enabled) return;
        
        const track = this.tracks[trackName];
        if (!track) {
            console.warn('Track not found:', trackName);
            return;
        }

        // If same track is playing, do nothing
        if (this.currentTrack === trackName && this.currentAudio && !this.currentAudio.paused) {
            return;
        }

        // Fade out current track
        if (this.currentAudio) {
            this.fadeOut(this.currentAudio, () => {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            });
        }

        // Play new track
        this.currentTrack = trackName;
        this.currentAudio = track.audio;
        
        if (fadeIn) {
            this.currentAudio.volume = 0;
            this.currentAudio.play().catch(e => console.log('Audio play prevented:', e));
            this.fadeIn(this.currentAudio, track.volume * this.volume);
        } else {
            this.currentAudio.volume = track.volume * this.volume;
            this.currentAudio.play().catch(e => console.log('Audio play prevented:', e));
        }

        console.log('Now playing:', trackName);
    },

    // Fade in audio
    fadeIn: function(audio, targetVolume) {
        const fadeInterval = setInterval(() => {
            if (audio.volume < targetVolume - this.fadeSpeed) {
                audio.volume = Math.min(audio.volume + this.fadeSpeed, targetVolume);
            } else {
                audio.volume = targetVolume;
                clearInterval(fadeInterval);
            }
        }, 50);
    },

    // Fade out audio
    fadeOut: function(audio, callback) {
        const fadeInterval = setInterval(() => {
            if (audio.volume > this.fadeSpeed) {
                audio.volume = Math.max(audio.volume - this.fadeSpeed, 0);
            } else {
                audio.volume = 0;
                clearInterval(fadeInterval);
                if (callback) callback();
            }
        }, 50);
    },

    // Stop current track
    stop: function(fadeOut = true) {
        if (!this.currentAudio) return;

        if (fadeOut) {
            this.fadeOut(this.currentAudio, () => {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
                this.currentAudio = null;
                this.currentTrack = null;
            });
        } else {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
            this.currentTrack = null;
        }
    },

    // Set master volume
    setVolume: function(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.currentAudio) {
            const track = this.tracks[this.currentTrack];
            this.currentAudio.volume = track.volume * this.volume;
        }
    },

    // Toggle music on/off
    toggle: function() {
        this.enabled = !this.enabled;
        if (!this.enabled && this.currentAudio) {
            this.stop(true);
        }
        return this.enabled;
    },

    // Get dynamic track based on game state
    getDynamicTrack: function() {
        if (game.player.inCombat) {
            return 'combat';
        }

        const terrain = getTerrainAt(game.player.x, game.player.y);
        const hour = Math.floor(game.world.time / 60);
        const isNight = hour < 6 || hour >= 20;

        if (terrain === TERRAIN.FOREST) return 'forest';
        if (terrain === TERRAIN.MOUNTAIN || terrain === TERRAIN.SNOW) return 'mountains';
        
        if (isNight) return 'night';
        
        return 'exploration';
    }
};

// Game State
const game = {
    player: {
        name: '',
        class: 'warrior',
        level: 1,
        exp: 0,
        expToNext: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        stamina: 100,
        maxStamina: 100,
        gold: 0,
        attack: 10,
        defense: 5,
        x: 5000, // Start in middle of huge map
        y: 5000,
        facing: 'down',
        speed: 4,
        skinTone: '#ffd1a3',
        hairColor: '#4a3728',
        shirtColor: '#8b4513',
        pantsColor: '#2f4f4f',
        inCombat: false
    },
    world: {
        width: 10000, // MASSIVE 10000x10000 world
        height: 10000,
        time: 720,
        weather: 'clear',
        timeSpeed: 1,
        seed: Math.random()
    },
    camera: {
        x: 0,
        y: 0
    },
    inventory: {},
    equipment: {
        weapon: null,
        armor: null,
        shield: null
    },
    npcs: [],
    enemies: [],
    resources: [],
    quests: [],
    skills: {},
    keys: {},
    canvas: null,
    ctx: null,
    tiles: {},
    chunks: {},
    loadedChunks: new Set(),
    
    // ENDING SYSTEM - 3 Possible Endings
    story: {
        karma: 0, // Tracks good/evil actions (-100 to 100)
        questsCompleted: 0,
        alliesAlive: 0,
        enemiesKilled: 0,
        betrayals: 0,
        heroicActs: 0,
        currentStage: 0,
        reachedFinalBattle: false,
        endingAchieved: null, // 'good', 'evil', 'bad'
        
        // Story stages leading to endings
        stages: [
            { 
                id: 0, 
                name: 'The Awakening', 
                desc: 'A new hero emerges in a world threatened by darkness',
                requirement: { level: 1 }
            },
            { 
                id: 1, 
                name: 'Growing Darkness', 
                desc: 'Evil forces grow stronger. Choose your path wisely',
                requirement: { level: 5, enemiesKilled: 20 }
            },
            { 
                id: 2, 
                name: 'The Choice', 
                desc: 'Your actions define who you are. Hero or villain?',
                requirement: { level: 10, karma: -50 } // Can go either way
            },
            { 
                id: 3, 
                name: 'Point of No Return', 
                desc: 'The final battle approaches. Are you ready?',
                requirement: { level: 15 }
            },
            { 
                id: 4, 
                name: 'The Final Battle', 
                desc: 'Face your destiny. The fate of all hangs in the balance',
                requirement: { level: 20 }
            }
        ],
        
        // Key NPCs that are your "friends/allies"
        keyAllies: [],
        
        // The main villain
        villain: null
    }
};

// Terrain types
const TERRAIN = {
    GRASS: { color: '#2d5016', walkable: true },
    DIRT: { color: '#8b6f47', walkable: true },
    WATER: { color: '#4a90e2', walkable: false },
    SAND: { color: '#daa520', walkable: true },
    STONE: { color: '#696969', walkable: true },
    MOUNTAIN: { color: '#4a4a4a', walkable: false },
    SNOW: { color: '#ffffff', walkable: true },
    FOREST: { color: '#1a4d1a', walkable: true }
};

// Item Database
const ITEMS = {
    wood: { name: 'Wood', icon: '🪵', type: 'resource', stackable: true },
    stone: { name: 'Stone', icon: '🪨', type: 'resource', stackable: true },
    iron: { name: 'Iron Ore', icon: '⛏️', type: 'resource', stackable: true },
    food: { name: 'Food', icon: '🍖', type: 'consumable', stackable: true, effect: { hp: 30 } },
    potion: { name: 'Health Potion', icon: '🧪', type: 'consumable', stackable: true, effect: { hp: 50 } },
    mana_potion: { name: 'Mana Potion', icon: '💙', type: 'consumable', stackable: true, effect: { mp: 40 } },
    iron_sword: { name: 'Iron Sword', icon: '⚔️', type: 'weapon', stackable: false, attack: 15 },
    steel_sword: { name: 'Steel Sword', icon: '🗡️', type: 'weapon', stackable: false, attack: 25 },
    wooden_bow: { name: 'Wooden Bow', icon: '🏹', type: 'weapon', stackable: false, attack: 12, ranged: true },
    pickaxe: { name: 'Pickaxe', icon: '⛏️', type: 'tool', stackable: false },
    axe: { name: 'Axe', icon: '🪓', type: 'tool', stackable: false },
    leather_armor: { name: 'Leather Armor', icon: '🦺', type: 'armor', stackable: false, defense: 5 },
    iron_armor: { name: 'Iron Armor', icon: '🛡️', type: 'armor', stackable: false, defense: 15 },
    wooden_shield: { name: 'Wooden Shield', icon: '🛡️', type: 'shield', stackable: false, defense: 8 }
};

// NPC Name Generator
const FIRST_NAMES = ['Arthur', 'Beatrice', 'Cedric', 'Diana', 'Edmund', 'Fiona', 'Gregory', 'Helena', 'Isaac', 'Jane', 
    'Kenneth', 'Lydia', 'Marcus', 'Natalie', 'Oliver', 'Penelope', 'Quentin', 'Rose', 'Sebastian', 'Tabitha',
    'Thomas', 'Victoria', 'William', 'Alice', 'Benjamin', 'Catherine', 'David', 'Eleanor', 'Frederick', 'Grace'];

const LAST_NAMES = ['Smith', 'Fletcher', 'Cooper', 'Mason', 'Wright', 'Carter', 'Baker', 'Miller', 'Taylor', 'Turner',
    'Wood', 'Stone', 'Hill', 'Rivers', 'Brook', 'Field', 'Forest', 'Lake', 'Vale', 'Marsh'];

const NPC_TYPES = ['blacksmith', 'merchant', 'farmer', 'knight', 'guard', 'innkeeper', 'alchemist', 'hunter', 'miner', 'scholar'];

const DIALOGUES = {
    blacksmith: ['Need weapons or armor?', 'The forge is hot today!', 'I can craft you something special.'],
    merchant: ['Welcome to my shop!', 'Fine goods for sale!', 'What can I get you?'],
    farmer: ['The crops grow well.', 'Hard work, honest pay.', 'Fresh produce today!'],
    knight: ['Honor and valor!', 'The kingdom needs defenders.', 'Train hard, fight harder.'],
    guard: ['Keep the peace!', 'No trouble on my watch.', 'Move along, citizen.'],
    innkeeper: ['Welcome, traveler!', 'Need a room?', 'Warm food and soft beds.'],
    alchemist: ['Potions and elixirs!', 'The secrets of nature.', 'Magic in every bottle.'],
    hunter: ['The forest provides.', 'Track your prey.', 'Nature is our teacher.'],
    miner: ['Deep in the earth.', 'Precious ores await.', 'Hard rock, harder work.'],
    scholar: ['Knowledge is power.', 'The old texts speak of...', 'Study and learn.']
};

// Recipes
const RECIPES = [
    { id: 'iron_sword', name: 'Iron Sword', icon: '⚔️', requires: { wood: 2, iron: 3 }, gives: 'iron_sword' },
    { id: 'pickaxe', name: 'Pickaxe', icon: '⛏️', requires: { wood: 3, stone: 2 }, gives: 'pickaxe' },
    { id: 'axe', name: 'Axe', icon: '🪓', requires: { wood: 2, stone: 3 }, gives: 'axe' },
    { id: 'potion', name: 'Health Potion', icon: '🧪', requires: { food: 2 }, gives: 'potion' },
    { id: 'leather_armor', name: 'Leather Armor', icon: '🦺', requires: { wood: 5 }, gives: 'leather_armor' },
    { id: 'wooden_shield', name: 'Wooden Shield', icon: '🛡️', requires: { wood: 4 }, gives: 'wooden_shield' },
    { id: 'steel_sword', name: 'Steel Sword', icon: '🗡️', requires: { iron: 5, wood: 1 }, gives: 'steel_sword' }
];

// Skills
const SKILLS = {
    power_strike: { name: 'Power Strike', icon: '⚔️', level: 0, maxLevel: 5, cost: 15, damage: 25 },
    fireball: { name: 'Fireball', icon: '🔥', level: 0, maxLevel: 5, cost: 20, damage: 30 },
    heal: { name: 'Heal', icon: '💚', level: 0, maxLevel: 5, cost: 25, heal: 40 },
    stealth: { name: 'Stealth', icon: '👤', level: 0, maxLevel: 5, cost: 10 },
    shield_bash: { name: 'Shield Bash', icon: '🛡️', level: 0, maxLevel: 5, cost: 12, damage: 15 },
    arrow_rain: { name: 'Arrow Rain', icon: '🏹', level: 0, maxLevel: 5, cost: 18, damage: 35 }
};

// ========================================
// INITIALIZATION
// ========================================

for (let i = 1; i <= 8; i++) {
    game.inventory[i] = null;
}

// Perlin-like noise for terrain generation
function noise2D(x, y, seed) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453123;
    return n - Math.floor(n);
}

function smoothNoise(x, y, seed) {
    const corners = (noise2D(x-1, y-1, seed) + noise2D(x+1, y-1, seed) + 
                     noise2D(x-1, y+1, seed) + noise2D(x+1, y+1, seed)) / 16;
    const sides = (noise2D(x-1, y, seed) + noise2D(x+1, y, seed) + 
                   noise2D(x, y-1, seed) + noise2D(x, y+1, seed)) / 8;
    const center = noise2D(x, y, seed) / 4;
    return corners + sides + center;
}

function getTerrainAt(x, y) {
    const tileX = Math.floor(x / 50);
    const tileY = Math.floor(y / 50);
    
    // Multiple octaves of noise for varied terrain
    const scale1 = 0.01;
    const scale2 = 0.05;
    const scale3 = 0.1;
    
    const n1 = smoothNoise(tileX * scale1, tileY * scale1, game.world.seed);
    const n2 = smoothNoise(tileX * scale2, tileY * scale2, game.world.seed + 1);
    const n3 = smoothNoise(tileX * scale3, tileY * scale3, game.world.seed + 2);
    
    const combined = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2);
    
    // Terrain based on noise value
    if (combined < 0.2) return TERRAIN.WATER;
    if (combined < 0.3) return TERRAIN.SAND;
    if (combined < 0.5) return TERRAIN.GRASS;
    if (combined < 0.6) return TERRAIN.FOREST;
    if (combined < 0.7) return TERRAIN.DIRT;
    if (combined < 0.8) return TERRAIN.STONE;
    if (combined < 0.9) return TERRAIN.MOUNTAIN;
    return TERRAIN.SNOW;
}

// Character Preview
function updateCharacterPreview() {
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 200, 200);

    const skin = document.getElementById('skin-color').value;
    const hair = document.getElementById('hair-color').value;
    const shirt = document.getElementById('shirt-color').value;
    const pants = document.getElementById('pants-color').value;

    drawCharacter(ctx, 100, 100, 3, skin, hair, shirt, pants);
}

function drawCharacter(ctx, x, y, scale, skin, hair, shirt, pants) {
    ctx.fillStyle = skin;
    ctx.fillRect(x - 8 * scale, y - 15 * scale, 16 * scale, 16 * scale);
    
    ctx.fillStyle = hair;
    ctx.fillRect(x - 10 * scale, y - 18 * scale, 20 * scale, 8 * scale);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 5 * scale, y - 10 * scale, 3 * scale, 3 * scale);
    ctx.fillRect(x + 2 * scale, y - 10 * scale, 3 * scale, 3 * scale);
    
    ctx.fillStyle = shirt;
    ctx.fillRect(x - 10 * scale, y, 20 * scale, 15 * scale);
    
    ctx.fillStyle = skin;
    ctx.fillRect(x - 14 * scale, y + 2 * scale, 4 * scale, 12 * scale);
    ctx.fillRect(x + 10 * scale, y + 2 * scale, 4 * scale, 12 * scale);
    
    ctx.fillStyle = pants;
    ctx.fillRect(x - 8 * scale, y + 15 * scale, 6 * scale, 10 * scale);
    ctx.fillRect(x + 2 * scale, y + 15 * scale, 6 * scale, 10 * scale);
}

document.getElementById('skin-color').addEventListener('input', updateCharacterPreview);
document.getElementById('hair-color').addEventListener('input', updateCharacterPreview);
document.getElementById('shirt-color').addEventListener('input', updateCharacterPreview);
document.getElementById('pants-color').addEventListener('input', updateCharacterPreview);

updateCharacterPreview();

// Start Game
document.getElementById('start-game-btn').addEventListener('click', startGame);

function startGame() {
    const name = document.getElementById('char-name').value.trim();
    if (!name) {
        alert('Please enter a character name!');
        return;
    }

    game.player.name = name;
    game.player.class = document.getElementById('char-class').value;
    game.player.skinTone = document.getElementById('skin-color').value;
    game.player.hairColor = document.getElementById('hair-color').value;
    game.player.shirtColor = document.getElementById('shirt-color').value;
    game.player.pantsColor = document.getElementById('pants-color').value;

    const classStats = {
        warrior: { hp: 150, mp: 30, attack: 15, defense: 10 },
        mage: { hp: 80, mp: 120, attack: 8, defense: 3 },
        rogue: { hp: 100, mp: 60, attack: 12, defense: 5 },
        ranger: { hp: 110, mp: 70, attack: 13, defense: 6 }
    };

    const stats = classStats[game.player.class];
    game.player.maxHp = stats.hp;
    game.player.hp = stats.hp;
    game.player.maxMp = stats.mp;
    game.player.mp = stats.mp;
    game.player.attack = stats.attack;
    game.player.defense = stats.defense;

    document.getElementById('customization-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';

    initializeGame();
}

function initializeGame() {
    game.canvas = document.getElementById('world-canvas');
    game.ctx = game.canvas.getContext('2d');
    game.canvas.width = window.innerWidth - 320;
    game.canvas.height = window.innerHeight - 80;

    // Initialize music system
    MusicSystem.init();
    MusicSystem.play('exploration', true);

    updateHUD();
    generateMassiveWorld();
    createMassiveNPCPopulation();
    createMassiveResourceDistribution();
    createMassiveEnemyPopulation();
    initializeSkills();

    addItem('wood', 5);
    addItem('stone', 3);
    addItem('food', 2);

    updateInventoryDisplay();
    updateSkillsDisplay();

    requestAnimationFrame(gameLoop);

    showNotification(`Welcome, ${game.player.name}! A vast world awaits exploration...`, 'success');
}

// ========================================
// MASSIVE WORLD GENERATION
// ========================================

function generateMassiveWorld() {
    console.log('Generating massive 10000x10000 world...');
    // World generated procedurally on-demand using noise functions
    showNotification('Massive world loaded! Explore 10000x10000 units!', 'info');
}

function createMassiveNPCPopulation() {
    console.log('Spawning 100+ NPCs across the world...');
    
    // Generate 120 NPCs spread across the massive world
    for (let i = 0; i < 120; i++) {
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const type = NPC_TYPES[Math.floor(Math.random() * NPC_TYPES.length)];
        
        const npc = {
            id: i,
            name: `${firstName} ${lastName}`,
            x: Math.random() * game.world.width,
            y: Math.random() * game.world.height,
            relationship: 0,
            type: type,
            dialogue: DIALOGUES[type] || ['Hello!', 'Good day!', 'Greetings!'],
            isAlly: false,
            isAlive: true
        };
        
        game.npcs.push(npc);
        
        // First 5 NPCs become key allies for the story
        if (i < 5) {
            npc.isAlly = true;
            npc.relationship = 50; // Start as friends
            game.story.keyAllies.push(npc);
        }
    }
    
    // Create the main villain
    game.story.villain = {
        id: 999,
        name: 'Lord Malakar the Destroyer',
        x: 9500,
        y: 9500, // Far corner of map
        hp: 500,
        maxHp: 500,
        attack: 50,
        defense: 30,
        alive: true,
        icon: '👹',
        type: 'villain'
    };
    
    game.enemies.push(game.story.villain);
    
    console.log(`${game.npcs.length} NPCs spawned!`);
    console.log(`${game.story.keyAllies.length} key allies identified!`);
    updateNPCList();
}

function createMassiveResourceDistribution() {
    console.log('Distributing resources across the world...');
    
    const resourceTypes = [
        { type: 'wood', icon: '🌲', item: 'wood', count: 500 },
        { type: 'stone', icon: '🪨', item: 'stone', count: 400 },
        { type: 'iron', icon: '⛏️', item: 'iron', count: 200 },
        { type: 'food', icon: '🌾', item: 'food', count: 300 }
    ];

    resourceTypes.forEach(resType => {
        for (let i = 0; i < resType.count; i++) {
            game.resources.push({
                type: resType.type,
                icon: resType.icon,
                item: resType.item,
                x: Math.random() * game.world.width,
                y: Math.random() * game.world.height,
                gathered: false
            });
        }
    });
    
    console.log(`${game.resources.length} resources distributed!`);
}

function createMassiveEnemyPopulation() {
    console.log('Spawning enemies across the world...');
    
    const enemyTypes = [
        { name: 'Goblin', icon: '👺', hp: 30, attack: 8, defense: 2, exp: 25, gold: 10 },
        { name: 'Bandit', icon: '🗡️', hp: 50, attack: 12, defense: 5, exp: 40, gold: 20 },
        { name: 'Wolf', icon: '🐺', hp: 40, attack: 10, defense: 3, exp: 30, gold: 5 },
        { name: 'Orc', icon: '👹', hp: 70, attack: 15, defense: 8, exp: 60, gold: 30 },
        { name: 'Troll', icon: '🧟', hp: 100, attack: 20, defense: 10, exp: 100, gold: 50 }
    ];

    for (let i = 0; i < 200; i++) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        game.enemies.push({
            ...type,
            id: i,
            x: Math.random() * game.world.width,
            y: Math.random() * game.world.height,
            maxHp: type.hp,
            alive: true
        });
    }
    
    console.log(`${game.enemies.length} enemies spawned!`);
}

// ========================================
// GAME LOOP & RENDERING
// ========================================

let lastTime = 0;
let lastMusicCheck = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    updateTime();
    handleMovement();

    if (game.player.stamina < game.player.maxStamina && !game.player.inCombat) {
        game.player.stamina = Math.min(game.player.maxStamina, game.player.stamina + 0.2);
        updateHUD();
    }

    // Dynamic music system - check every 3 seconds
    if (timestamp - lastMusicCheck > 3000) {
        const dynamicTrack = MusicSystem.getDynamicTrack();
        if (dynamicTrack !== MusicSystem.currentTrack) {
            MusicSystem.play(dynamicTrack, true);
        }
        lastMusicCheck = timestamp;
    }

    renderWorld();
    renderEntities();
    renderPlayer();

    requestAnimationFrame(gameLoop);
}

function handleMovement() {
    const speed = game.player.speed;
    let newX = game.player.x;
    let newY = game.player.y;

    if (game.keys['w'] || game.keys['arrowup']) {
        newY -= speed;
        game.player.facing = 'up';
    }
    if (game.keys['s'] || game.keys['arrowdown']) {
        newY += speed;
        game.player.facing = 'down';
    }
    if (game.keys['a'] || game.keys['arrowleft']) {
        newX -= speed;
        game.player.facing = 'left';
    }
    if (game.keys['d'] || game.keys['arrowright']) {
        newX += speed;
        game.player.facing = 'right';
    }

    // Check terrain
    const terrain = getTerrainAt(newX, newY);
    if (terrain.walkable) {
        game.player.x = Math.max(0, Math.min(game.world.width, newX));
        game.player.y = Math.max(0, Math.min(game.world.height, newY));
    }

    // Update camera to follow player
    game.camera.x = game.player.x - game.canvas.width / 2;
    game.camera.y = game.player.y - game.canvas.height / 2;
}

function renderWorld() {
    const ctx = game.ctx;
    const tileSize = 50;
    
    const startX = Math.floor(game.camera.x / tileSize);
    const startY = Math.floor(game.camera.y / tileSize);
    const endX = startX + Math.ceil(game.canvas.width / tileSize) + 1;
    const endY = startY + Math.ceil(game.canvas.height / tileSize) + 1;

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const worldX = x * tileSize;
            const worldY = y * tileSize;
            
            const terrain = getTerrainAt(worldX, worldY);
            
            const screenX = worldX - game.camera.x;
            const screenY = worldY - game.camera.y;
            
            ctx.fillStyle = terrain.color;
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
            
            // Add visual variation
            if (terrain === TERRAIN.MOUNTAIN) {
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(screenX, screenY + tileSize/2, tileSize, tileSize/2);
            } else if (terrain === TERRAIN.FOREST) {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fillRect(screenX + 10, screenY + 10, tileSize - 20, tileSize - 20);
            }
        }
    }
}

function renderEntities() {
    const ctx = game.ctx;
    
    // Render resources
    game.resources.forEach(resource => {
        if (resource.gathered) return;
        
        const screenX = resource.x - game.camera.x;
        const screenY = resource.y - game.camera.y;
        
        if (screenX < -50 || screenX > game.canvas.width || 
            screenY < -50 || screenY > game.canvas.height) return;
        
        ctx.font = '30px Arial';
        ctx.fillText(resource.icon, screenX, screenY + 30);
    });
    
    // Render NPCs
    game.npcs.forEach(npc => {
        const screenX = npc.x - game.camera.x;
        const screenY = npc.y - game.camera.y;
        
        if (screenX < -50 || screenX > game.canvas.width || 
            screenY < -50 || screenY > game.canvas.height) return;
        
        ctx.font = '40px Arial';
        ctx.fillText('👤', screenX, screenY + 40);
        
        // Name tag
        ctx.font = '12px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(npc.name.split(' ')[0], screenX - 20, screenY - 10);
        ctx.fillText(npc.name.split(' ')[0], screenX - 20, screenY - 10);
    });
    
    // Render enemies
    game.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        const screenX = enemy.x - game.camera.x;
        const screenY = enemy.y - game.camera.y;
        
        if (screenX < -50 || screenX > game.canvas.width || 
            screenY < -50 || screenY > game.canvas.height) return;
        
        ctx.font = '35px Arial';
        ctx.fillText(enemy.icon, screenX, screenY + 35);
    });
}

function renderPlayer() {
    const ctx = game.ctx;
    const screenX = game.canvas.width / 2;
    const screenY = game.canvas.height / 2;
    
    // Draw player character
    drawCharacter(ctx, screenX, screenY, 1, 
        game.player.skinTone,
        game.player.hairColor,
        game.player.shirtColor,
        game.player.pantsColor
    );
    
    // Player name
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'gold';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeText(game.player.name, screenX - 30, screenY - 30);
    ctx.fillText(game.player.name, screenX - 30, screenY - 30);
    
    // Mini coordinates display
    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`X: ${Math.floor(game.player.x)} Y: ${Math.floor(game.player.y)}`, 10, game.canvas.height - 10);
}

// ========================================
// NPC SYSTEM
// ========================================

function updateNPCList() {
    const list = document.getElementById('npc-list');
    
    // Show only nearby NPCs (within 500 units)
    const nearbyNPCs = game.npcs.filter(npc => {
        const dist = Math.hypot(game.player.x - npc.x, game.player.y - npc.y);
        return dist < 500;
    }).slice(0, 10); // Show max 10
    
    if (nearbyNPCs.length === 0) {
        list.innerHTML = '<p class="empty-text">No NPCs nearby</p>';
        return;
    }
    
    list.innerHTML = '';

    nearbyNPCs.forEach(npc => {
        const div = document.createElement('div');
        div.className = 'npc-item';
        div.onclick = () => {
            const dist = Math.hypot(game.player.x - npc.x, game.player.y - npc.y);
            if (dist < 100) {
                talkToNPC(npc.id);
            } else {
                showNotification('Too far away!', 'error');
            }
        };

        const relStatus = getRelationshipStatus(npc.relationship);
        const distance = Math.floor(Math.hypot(game.player.x - npc.x, game.player.y - npc.y));
        
        div.innerHTML = `
            <div class="npc-name">${npc.name}</div>
            <div class="npc-status">${npc.type} - ${distance}m - ${relStatus.text}</div>
            <div class="relationship-bar">
                <div class="relationship-fill ${relStatus.class}" style="width: ${50 + npc.relationship / 2}%"></div>
            </div>
        `;
        list.appendChild(div);
    });
}

function getRelationshipStatus(value) {
    if (value >= 75) return { text: 'Best Friend', class: 'rel-best-friend' };
    if (value >= 40) return { text: 'Friend', class: 'rel-friend' };
    if (value >= -20) return { text: 'Neutral', class: 'rel-neutral' };
    return { text: 'Enemy', class: 'rel-enemy' };
}

function talkToNPC(npcId) {
    const npc = game.npcs.find(n => n.id === npcId);
    if (!npc) return;

    const dialogue = npc.dialogue[Math.floor(Math.random() * npc.dialogue.length)];
    
    showDialog(npc.name, dialogue, [
        { text: '😊 Be Kind (+15 relationship)', action: () => changeRelationship(npcId, 15) },
        { text: '😐 Be Neutral', action: () => closeDialog() },
        { text: '😠 Be Rude (-15 relationship)', action: () => changeRelationship(npcId, -15) },
        { text: '💰 Trade', action: () => { showNotification('Trading coming soon!', 'info'); closeDialog(); } }
    ]);
}

function changeRelationship(npcId, amount) {
    const npc = game.npcs.find(n => n.id === npcId);
    if (!npc) return;

    npc.relationship = Math.max(-100, Math.min(100, npc.relationship + amount));
    
    // Track karma for ending system
    if (amount > 0) {
        game.story.karma += amount / 2;
        game.story.heroicActs++;
        showNotification(`${npc.name} likes you more!`, 'success');
    } else if (amount < 0) {
        game.story.karma += amount / 2;
        game.story.betrayals++;
        showNotification(`${npc.name} doesn't like that...`, 'error');
    }
    
    // Cap karma at -100 to 100
    game.story.karma = Math.max(-100, Math.min(100, game.story.karma));
    
    updateNPCList();
    checkStoryProgression();
    closeDialog();
}

// ========================================
// RESOURCE GATHERING
// ========================================

function gatherResource(resource) {
    if (resource.gathered) return;
    if (game.player.stamina < 10) {
        showNotification('Not enough stamina!', 'error');
        return;
    }

    resource.gathered = true;
    game.player.stamina -= 10;
    addItem(resource.item, 1);
    showNotification(`Gathered ${ITEMS[resource.item].name}!`, 'success');
    
    setTimeout(() => { resource.gathered = false; }, 30000);
    
    updateHUD();
}

// ========================================
// COMBAT SYSTEM
// ========================================

function startCombat(enemy) {
    if (!enemy.alive) return;
    
    game.player.inCombat = true;
    game.currentEnemy = enemy;
    
    // Switch to combat music
    MusicSystem.play('combat', true);
    
    document.getElementById('combat-ui').style.display = 'block';
    document.getElementById('enemy-name').textContent = enemy.name;
    updateEnemyHP();
}

function updateEnemyHP() {
    const enemy = game.currentEnemy;
    if (!enemy) return;
    
    const percent = (enemy.hp / enemy.maxHp) * 100;
    document.getElementById('enemy-hp-bar').style.width = percent + '%';
}

function attackEnemy() {
    const enemy = game.currentEnemy;
    if (!enemy) return;

    if (game.player.stamina < 15) {
        showNotification('Not enough stamina!', 'error');
        return;
    }

    game.player.stamina -= 15;
    
    const damage = Math.max(1, game.player.attack - enemy.defense + Math.floor(Math.random() * 10));
    enemy.hp -= damage;
    
    showNotification(`You deal ${damage} damage!`, 'info');

    if (enemy.hp <= 0) {
        enemyDefeated(enemy);
        return;
    }

    setTimeout(() => {
        const enemyDamage = Math.max(1, enemy.attack - game.player.defense + Math.floor(Math.random() * 5));
        game.player.hp = Math.max(0, game.player.hp - enemyDamage);
        showNotification(`${enemy.name} deals ${enemyDamage} damage!`, 'error');
        updateHUD();
        
        if (game.player.hp <= 0) {
            playerDefeated();
        }
    }, 1000);
    
    updateEnemyHP();
    updateHUD();
}

function useSkillInCombat() {
    if (game.player.mp < 20) {
        showNotification('Not enough mana!', 'error');
        return;
    }

    game.player.mp -= 20;
    const damage = 35;
    game.currentEnemy.hp -= damage;
    
    showNotification(`Skill deals ${damage} damage!`, 'success');
    
    if (game.currentEnemy.hp <= 0) {
        enemyDefeated(game.currentEnemy);
        return;
    }
    
    updateEnemyHP();
    updateHUD();
}

function defendInCombat() {
    showNotification('You brace for impact!', 'info');
    game.player.defense += 5;
    
    setTimeout(() => {
        game.player.defense -= 5;
    }, 3000);
}

function fleeCombat() {
    if (Math.random() < 0.7) {
        endCombat();
        showNotification('You escaped!', 'success');
    } else {
        showNotification('Failed to escape!', 'error');
    }
}

function enemyDefeated(enemy) {
    enemy.alive = false;
    enemy.hp = 0;
    
    game.player.exp += enemy.exp;
    game.player.gold += enemy.gold;
    game.story.enemiesKilled++;
    
    // Check if this is the villain
    if (enemy.id === 999) {
        handleVillainDefeated();
        return;
    }
    
    showNotification(`${enemy.name} defeated! +${enemy.exp} EXP, +${enemy.gold} gold`, 'success');
    
    // Play victory music
    MusicSystem.play('victory', false);
    
    // Return to exploration music after victory
    setTimeout(() => {
        MusicSystem.play(MusicSystem.getDynamicTrack(), true);
    }, 5000);
    
    checkLevelUp();
    checkStoryProgression();
    endCombat();
    
    setTimeout(() => {
        enemy.alive = true;
        enemy.hp = enemy.maxHp;
    }, 60000);
}

function playerDefeated() {
    game.player.inCombat = false;
    endCombat();
    
    showNotification('You were defeated! Respawning...', 'error');
    
    game.player.hp = game.player.maxHp / 2;
    game.player.mp = game.player.maxMp / 2;
    game.player.x = 5000;
    game.player.y = 5000;
    
    updateHUD();
}

function endCombat() {
    game.player.inCombat = false;
    game.currentEnemy = null;
    document.getElementById('combat-ui').style.display = 'none';
}

function checkLevelUp() {
    while (game.player.exp >= game.player.expToNext) {
        game.player.level++;
        game.player.exp -= game.player.expToNext;
        game.player.expToNext = Math.floor(game.player.expToNext * 1.5);
        
        game.player.maxHp += 20;
        game.player.hp = game.player.maxHp;
        game.player.maxMp += 10;
        game.player.mp = game.player.maxMp;
        game.player.attack += 3;
        game.player.defense += 2;
        
        // Play level up music
        const currentTrack = MusicSystem.currentTrack;
        MusicSystem.play('levelUp', false);
        setTimeout(() => {
            MusicSystem.play(currentTrack || 'exploration', true);
        }, 3000);
        
        showNotification(`LEVEL UP! You are now level ${game.player.level}!`, 'success');
    }
    
    updateHUD();
}

// ========================================
// INVENTORY SYSTEM
// ========================================

function addItem(itemId, quantity = 1) {
    const item = ITEMS[itemId];
    if (!item) return false;

    if (item.stackable) {
        for (let i = 1; i <= 8; i++) {
            const slot = game.inventory[i];
            if (slot && slot.id === itemId) {
                slot.quantity += quantity;
                updateInventoryDisplay();
                return true;
            }
        }
    }

    for (let i = 1; i <= 8; i++) {
        if (!game.inventory[i]) {
            game.inventory[i] = { id: itemId, quantity: quantity };
            updateInventoryDisplay();
            return true;
        }
    }

    showNotification('Inventory full!', 'error');
    return false;
}

function removeItem(slotId, quantity = 1) {
    const slot = game.inventory[slotId];
    if (!slot) return false;

    slot.quantity -= quantity;
    if (slot.quantity <= 0) {
        game.inventory[slotId] = null;
    }

    updateInventoryDisplay();
    return true;
}

function useItem(slotId) {
    const slot = game.inventory[slotId];
    if (!slot) return;

    const item = ITEMS[slot.id];
    if (!item) return;

    if (item.type === 'consumable' && item.effect) {
        if (item.effect.hp) {
            game.player.hp = Math.min(game.player.maxHp, game.player.hp + item.effect.hp);
            showNotification(`Used ${item.name}! +${item.effect.hp} HP`, 'success');
        }
        if (item.effect.mp) {
            game.player.mp = Math.min(game.player.maxMp, game.player.mp + item.effect.mp);
            showNotification(`Used ${item.name}! +${item.effect.mp} MP`, 'success');
        }
        
        removeItem(slotId, 1);
        updateHUD();
    } else if (item.type === 'weapon') {
        equipItem(slotId, 'weapon');
    } else if (item.type === 'armor') {
        equipItem(slotId, 'armor');
    } else if (item.type === 'shield') {
        equipItem(slotId, 'shield');
    }
}

function equipItem(slotId, equipSlot) {
    const slot = game.inventory[slotId];
    if (!slot) return;

    const item = ITEMS[slot.id];
    
    if (game.equipment[equipSlot]) {
        const oldItem = ITEMS[game.equipment[equipSlot]];
        if (oldItem.attack) game.player.attack -= oldItem.attack;
        if (oldItem.defense) game.player.defense -= oldItem.defense;
        
        addItem(game.equipment[equipSlot], 1);
    }

    game.equipment[equipSlot] = slot.id;
    if (item.attack) game.player.attack += item.attack;
    if (item.defense) game.player.defense += item.defense;
    
    removeItem(slotId, 1);
    
    const display = document.getElementById(`eq-${equipSlot}`);
    if (display) display.textContent = item.icon;
    
    showNotification(`Equipped ${item.name}!`, 'success');
    updateHUD();
}

function updateInventoryDisplay() {
    const hotbar = document.getElementById('hotbar');
    hotbar.innerHTML = '';

    for (let i = 1; i <= 8; i++) {
        const slot = game.inventory[i];
        const div = document.createElement('div');
        div.className = 'hotbar-slot' + (slot ? ' has-item' : '');
        div.onclick = () => useItem(i);

        if (slot) {
            const item = ITEMS[slot.id];
            div.innerHTML = `
                <div class="slot-hotkey">${i}</div>
                <div class="slot-icon">${item.icon}</div>
                ${item.stackable ? `<div class="slot-count">${slot.quantity}</div>` : ''}
            `;
        } else {
            div.innerHTML = `<div class="slot-hotkey">${i}</div>`;
        }

        hotbar.appendChild(div);
    }
}

// ========================================
// CRAFTING SYSTEM
// ========================================

function openCrafting() {
    const menu = document.getElementById('crafting-menu');
    menu.classList.add('show');
    updateRecipeDisplay();
}

function closeCrafting() {
    document.getElementById('crafting-menu').classList.remove('show');
}

function updateRecipeDisplay() {
    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = '';

    RECIPES.forEach(recipe => {
        const canCraft = Object.entries(recipe.requires).every(([itemId, amount]) => {
            return countItem(itemId) >= amount;
        });

        const div = document.createElement('div');
        div.className = 'recipe-card' + (canCraft ? ' craftable' : '');

        const requiresHTML = Object.entries(recipe.requires)
            .map(([itemId, amount]) => {
                const has = countItem(itemId);
                const item = ITEMS[itemId];
                const color = has >= amount ? '#4CAF50' : '#ef4444';
                return `<div style="color: ${color}">${item.icon} ${item.name}: ${has}/${amount}</div>`;
            })
            .join('');

        div.innerHTML = `
            <div class="recipe-icon">${recipe.icon}</div>
            <div class="recipe-name">${recipe.name}</div>
            <div class="recipe-requires">${requiresHTML}</div>
            <button class="craft-btn" ${!canCraft ? 'disabled' : ''} onclick="craftItem('${recipe.id}')">
                Craft
            </button>
        `;

        grid.appendChild(div);
    });
}

function countItem(itemId) {
    let total = 0;
    for (let i = 1; i <= 8; i++) {
        const slot = game.inventory[i];
        if (slot && slot.id === itemId) {
            total += slot.quantity || 1;
        }
    }
    return total;
}

function craftItem(recipeId) {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;

    const canCraft = Object.entries(recipe.requires).every(([itemId, amount]) => {
        return countItem(itemId) >= amount;
    });

    if (!canCraft) {
        showNotification('Not enough materials!', 'error');
        return;
    }

    Object.entries(recipe.requires).forEach(([itemId, amount]) => {
        let remaining = amount;
        for (let i = 1; i <= 8 && remaining > 0; i++) {
            const slot = game.inventory[i];
            if (slot && slot.id === itemId) {
                const toRemove = Math.min(remaining, slot.quantity || 1);
                removeItem(i, toRemove);
                remaining -= toRemove;
            }
        }
    });

    addItem(recipe.gives, 1);
    showNotification(`Crafted ${recipe.name}!`, 'success');
    updateRecipeDisplay();
}

// ========================================
// SKILLS SYSTEM
// ========================================

function initializeSkills() {
    game.skills = { ...SKILLS };
    
    const classSkills = {
        warrior: ['power_strike', 'shield_bash'],
        mage: ['fireball', 'heal'],
        rogue: ['stealth'],
        ranger: ['arrow_rain']
    };

    (classSkills[game.player.class] || []).forEach(skillId => {
        game.skills[skillId].level = 1;
    });

    updateSkillsDisplay();
}

function updateSkillsDisplay() {
    const grid = document.getElementById('skill-grid');
    grid.innerHTML = '';

    Object.entries(game.skills).forEach(([id, skill]) => {
        const div = document.createElement('div');
        div.className = 'skill-slot' + (skill.level > 0 ? ' unlocked' : '');
        div.onclick = () => useSkill(id);

        div.innerHTML = `
            <div class="skill-icon">${skill.icon}</div>
            <div class="skill-name">${skill.name}</div>
            <div class="skill-level">Lvl ${skill.level}/${skill.maxLevel}</div>
        `;

        grid.appendChild(div);
    });
}

function useSkill(skillId) {
    const skill = game.skills[skillId];
    if (!skill || skill.level === 0) return;

    if (game.player.mp < skill.cost) {
        showNotification('Not enough mana!', 'error');
        return;
    }

    game.player.mp -= skill.cost;

    if (skill.heal) {
        game.player.hp = Math.min(game.player.maxHp, game.player.hp + skill.heal);
        showNotification(`${skill.name}! Healed ${skill.heal} HP`, 'success');
    } else if (skill.damage) {
        showNotification(`${skill.name}! Ready to strike!`, 'info');
    }

    updateHUD();
}

// ========================================
// TIME & WEATHER
// ========================================

function updateTime() {
    game.world.time += game.world.timeSpeed / 60;
    if (game.world.time >= 1440) game.world.time = 0;

    const hours = Math.floor(game.world.time / 60);
    const minutes = Math.floor(game.world.time % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    document.getElementById('time-display').textContent = 
        `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;

    if (Math.random() < 0.001) {
        const weathers = ['☀️ Clear', '🌧️ Rain', '⛈️ Storm', '☁️ Cloudy'];
        game.world.weather = weathers[Math.floor(Math.random() * weathers.length)];
        document.getElementById('weather-display').textContent = game.world.weather;
    }
}

// ========================================
// HUD UPDATES
// ========================================

function updateHUD() {
    document.getElementById('player-name').textContent = game.player.name;
    document.getElementById('player-level').textContent = game.player.level;
    document.getElementById('player-class').textContent = ` (${game.player.class})`;

    document.getElementById('attack-stat').textContent = game.player.attack;
    document.getElementById('defense-stat').textContent = game.player.defense;
    document.getElementById('gold-amount').textContent = game.player.gold;

    const hpPercent = (game.player.hp / game.player.maxHp) * 100;
    document.getElementById('hp-bar').style.width = hpPercent + '%';
    document.getElementById('hp-text').textContent = `${Math.floor(game.player.hp)}/${game.player.maxHp}`;

    const mpPercent = (game.player.mp / game.player.maxMp) * 100;
    document.getElementById('mp-bar').style.width = mpPercent + '%';
    document.getElementById('mp-text').textContent = `${Math.floor(game.player.mp)}/${game.player.maxMp}`;

    const stPercent = (game.player.stamina / game.player.maxStamina) * 100;
    document.getElementById('st-bar').style.width = stPercent + '%';
    document.getElementById('st-text').textContent = `${Math.floor(game.player.stamina)}/${game.player.maxStamina}`;

    const xpPercent = (game.player.exp / game.player.expToNext) * 100;
    document.getElementById('xp-bar').style.width = xpPercent + '%';
    document.getElementById('xp-text').textContent = `${game.player.exp}/${game.player.expToNext}`;
}

// ========================================
// DIALOG & UI
// ========================================

function showDialog(speaker, text, options = []) {
    const dialog = document.getElementById('dialog-box');
    document.getElementById('dialog-speaker').textContent = speaker;
    document.getElementById('dialog-text').textContent = text;

    const optionsDiv = document.getElementById('dialog-options');
    optionsDiv.innerHTML = '';

    options.forEach(option => {
        const btn = document.createElement('div');
        btn.className = 'dialog-option';
        btn.textContent = option.text;
        btn.onclick = option.action;
        optionsDiv.appendChild(btn);
    });

    dialog.classList.add('show');
}

function closeDialog() {
    document.getElementById('dialog-box').classList.remove('show');
}

function showNotification(message, type = 'info') {
    const area = document.getElementById('notification-area');
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;

    area.appendChild(notif);

    setTimeout(() => {
        notif.remove();
    }, 5000);
}

// ========================================
// KEYBOARD CONTROLS
// ========================================

document.addEventListener('keydown', (e) => {
    game.keys[e.key.toLowerCase()] = true;

    if (e.key === ' ') {
        e.preventDefault();
        interactNearby();
    }
    if (e.key === 'e') {
        talkToNearbyNPC();
    }
    if (e.key === 'f') {
        attackNearbyEnemy();
    }
    if (e.key === 'c') {
        openCrafting();
    }
    if (e.key === 'r') {
        rest();
    }
    if (e.key === 'm') {
        openMap();
    }

    if (e.key >= '1' && e.key <= '8') {
        useItem(parseInt(e.key));
    }
});

document.addEventListener('keyup', (e) => {
    game.keys[e.key.toLowerCase()] = false;
});

function interactNearby() {
    game.resources.forEach(resource => {
        const dist = Math.hypot(game.player.x - resource.x, game.player.y - resource.y);
        if (dist < 60 && !resource.gathered) {
            gatherResource(resource);
        }
    });
}

function talkToNearbyNPC() {
    game.npcs.forEach(npc => {
        const dist = Math.hypot(game.player.x - npc.x, game.player.y - npc.y);
        if (dist < 100) {
            talkToNPC(npc.id);
        }
    });
}

function attackNearbyEnemy() {
    game.enemies.forEach(enemy => {
        const dist = Math.hypot(game.player.x - enemy.x, game.player.y - enemy.y);
        if (dist < 100 && enemy.alive) {
            startCombat(enemy);
        }
    });
}

function rest() {
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + 30);
    game.player.mp = Math.min(game.player.maxMp, game.player.mp + 20);
    game.player.stamina = game.player.maxStamina;
    showNotification('You rest and recover...', 'success');
    updateHUD();
}

// ========================================
// MAP SYSTEM
// ========================================

function openMap() {
    const menu = document.getElementById('map-menu');
    menu.classList.add('show');
    
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    
    const scale = 800 / game.world.width;
    
    // Draw terrain
    for (let y = 0; y < 800; y += 10) {
        for (let x = 0; x < 800; x += 10) {
            const worldX = x / scale;
            const worldY = y / scale;
            const terrain = getTerrainAt(worldX, worldY);
            ctx.fillStyle = terrain.color;
            ctx.fillRect(x, y, 10, 10);
        }
    }
    
    // Draw player
    const px = game.player.x * scale;
    const py = game.player.y * scale;
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw nearby NPCs
    ctx.fillStyle = '#3b82f6';
    game.npcs.forEach(npc => {
        const nx = npc.x * scale;
        const ny = npc.y * scale;
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw nearby enemies
    ctx.fillStyle = '#ef4444';
    game.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const ex = enemy.x * scale;
        const ey = enemy.y * scale;
        ctx.beginPath();
        ctx.arc(ex, ey, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function closeMap() {
    document.getElementById('map-menu').classList.remove('show');
}

function closeInventory() {
    document.getElementById('inventory-menu').classList.remove('show');
}

// Update NPC list periodically
setInterval(() => {
    if (game.player) {
        updateNPCList();
    }
}, 2000);

// Music control functions
function toggleMusic() {
    const enabled = MusicSystem.toggle();
    const btn = document.getElementById('music-toggle');
    btn.textContent = enabled ? '🎵 Music ON' : '🔇 Music OFF';
    showNotification(enabled ? 'Music enabled' : 'Music disabled', 'info');
}

function changeVolume(value) {
    MusicSystem.setVolume(value / 100);
}

// ========================================
// STORY PROGRESSION & ENDING SYSTEM
// ========================================

function checkStoryProgression() {
    const currentStage = game.story.currentStage;
    const nextStage = game.story.stages[currentStage + 1];
    
    if (!nextStage) return;
    
    const req = nextStage.requirement;
    let canProgress = true;
    
    if (req.level && game.player.level < req.level) canProgress = false;
    if (req.enemiesKilled && game.story.enemiesKilled < req.enemiesKilled) canProgress = false;
    
    if (canProgress) {
        game.story.currentStage++;
        showStoryUpdate(nextStage);
        
        // Check if final battle
        if (game.story.currentStage === 4) {
            offerFinalBattle();
        }
    }
}

function showStoryUpdate(stage) {
    showNotification(`📖 STORY UPDATE: ${stage.name}`, 'info');
    
    setTimeout(() => {
        showDialog('The Story Unfolds...', stage.desc, [
            { text: 'Continue your journey', action: () => closeDialog() }
        ]);
    }, 1000);
}

function offerFinalBattle() {
    game.story.reachedFinalBattle = true;
    
    const message = `The time has come. Lord Malakar awaits in the far reaches of the land. 
    Your choices have shaped your path. Will you face him as a HERO, join him as a TYRANT, or fall to DARKNESS?
    
    Current Karma: ${Math.floor(game.story.karma)}
    Allies Alive: ${game.story.keyAllies.filter(a => a.isAlive).length}/5
    
    Journey to coordinates (9500, 9500) when ready for the FINAL BATTLE.`;
    
    showDialog('⚠️ THE FINAL BATTLE BECKONS', message, [
        { text: 'I am ready', action: () => closeDialog() },
        { text: 'I need more time', action: () => closeDialog() }
    ]);
}

function handleVillainDefeated() {
    // Determine which ending based on player's karma and choices
    const karma = game.story.karma;
    const alliesAlive = game.story.keyAllies.filter(a => a.isAlive).length;
    
    if (karma >= 30 && alliesAlive >= 4) {
        // ENDING 1: GOOD ENDING
        triggerGoodEnding();
    } else if (karma <= -30) {
        // ENDING 2: EVIL ENDING
        triggerEvilEnding();
    } else {
        // ENDING 3: BAD ENDING
        triggerBadEnding();
    }
}

function triggerGoodEnding() {
    game.story.endingAchieved = 'good';
    MusicSystem.play('victory', false);
    
    const allyNames = game.story.keyAllies.map(a => a.name).join(', ');
    
    const endingText = `
    ✨ THE HERO'S TRIUMPH ✨
    
    With courage and compassion, you have defeated Lord Malakar!
    
    Your allies stood by your side:
    ${allyNames}
    
    Together, you drove back the darkness. The kingdom is saved!
    Peace returns to the land. Your name will be sung in legends for generations.
    
    All your friends and companions survive and celebrate with you.
    The people hail you as the TRUE HERO of the realm!
    
    ⭐ GOOD ENDING ACHIEVED ⭐
    
    Final Stats:
    Level: ${game.player.level}
    Karma: ${Math.floor(game.story.karma)} (Heroic)
    Allies Saved: ${game.story.keyAllies.filter(a => a.isAlive).length}/5
    Heroic Acts: ${game.story.heroicActs}
    `;
    
    showEndingScreen(endingText, 'good');
}

function triggerEvilEnding() {
    game.story.endingAchieved = 'evil';
    MusicSystem.play('dramatic', false);
    
    const allyNames = game.story.keyAllies.map(a => a.name).join(', ');
    
    const endingText = `
    💀 THE TYRANT'S RISE 💀
    
    Power corrupted you. Instead of defeating Malakar, you joined forces with him!
    
    Your former allies tried to stop you:
    ${allyNames}
    
    But you betrayed them all. In an epic battle, YOU and MALAKAR fought your friends.
    One by one, they fell to your combined dark power.
    
    You have become what you swore to destroy.
    The kingdom falls under your tyrannical rule.
    
    You sit on a throne of bones, feared and alone.
    The hero has become the VILLAIN.
    
    ⚔️ EVIL ENDING ACHIEVED ⚔️
    
    Final Stats:
    Level: ${game.player.level}
    Karma: ${Math.floor(game.story.karma)} (Evil)
    Betrayals: ${game.story.betrayals}
    Former Allies Defeated: ${game.story.keyAllies.length}
    `;
    
    showEndingScreen(endingText, 'evil');
}

function triggerBadEnding() {
    game.story.endingAchieved = 'bad';
    MusicSystem.play('dramatic', false);
    
    const endingText = `
    💀 DARKNESS PREVAILS 💀
    
    You fought valiantly, but it was not enough.
    Lord Malakar's power proved too great.
    
    In the final battle, you fell.
    Your companions perished trying to save you.
    
    The darkness consumes the land.
    Your allies scatter into hiding, hunted and broken.
    Evil ravages the kingdom unopposed.
    
    Cities burn. Hope dies.
    The age of heroes is over.
    
    Perhaps... in another timeline... you could have been stronger.
    Perhaps you could have made different choices.
    
    But in this world, the darkness won.
    
    💀 BAD ENDING ACHIEVED 💀
    
    Final Stats:
    Level: ${game.player.level}
    Karma: ${Math.floor(game.story.karma)}
    Enemies Killed: ${game.story.enemiesKilled}
    
    The world needed a hero... but found only ash.
    `;
    
    showEndingScreen(endingText, 'bad');
}

function showEndingScreen(text, endingType) {
    // Stop all gameplay
    game.keys = {};
    
    // Create ending overlay
    const overlay = document.createElement('div');
    overlay.id = 'ending-overlay';
    overlay.innerHTML = `
        <div class="ending-panel ${endingType}">
            <pre class="ending-text">${text}</pre>
            <div class="ending-buttons">
                <button onclick="location.reload()" class="ending-btn">Play Again</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Special function to trigger evil path during battle
function betrayAllies() {
    if (!game.story.reachedFinalBattle) return;
    
    showDialog('💀 BETRAY YOUR ALLIES?', 
        'You sense the dark power of Lord Malakar. He offers you a deal: Join him and together you will be unstoppable. Your allies will try to stop you. Will you BETRAY them?',
        [
            { 
                text: '😈 YES - Join the villain and fight my allies!', 
                action: () => {
                    game.story.karma = -100;
                    startBetrayalBattle();
                }
            },
            { 
                text: '😇 NO - Stay true to my friends', 
                action: () => {
                    game.story.karma += 20;
                    closeDialog();
                }
            }
        ]
    );
}

function startBetrayalBattle() {
    closeDialog();
    showNotification('💀 You have chosen the path of DARKNESS!', 'error');
    
    // Kill all allies
    game.story.keyAllies.forEach(ally => {
        ally.isAlive = false;
    });
    
    setTimeout(() => {
        triggerEvilEnding();
    }, 2000);
}

console.log('Medieval RPG - Massive World Edition loaded!');
console.log('World size: 10000x10000 units');
console.log('NPCs: 120+ scattered across the world');
console.log('Resources: 1400+ nodes');
console.log('Enemies: 200+ creatures');
console.log('Music System: Dynamic soundtrack with 12 tracks');
console.log('🎭 STORY SYSTEM: 3 Different Endings Available!');
console.log('- GOOD ENDING: Save everyone and defeat evil');
console.log('- EVIL ENDING: Betray allies and join the villain');
console.log('- BAD ENDING: Fall in battle, darkness wins');
console.log('Explore with WASD, interact with SPACE, talk with E, attack with F!');
