// ========================================
// MEDIEVAL RPG - COMPLETE GAME SYSTEM
// ========================================

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
        x: 400,
        y: 300,
        facing: 'down',
        skinTone: '#ffd1a3',
        hairColor: '#4a3728',
        shirtColor: '#8b4513',
        pantsColor: '#2f4f4f',
        inCombat: false
    },
    world: {
        time: 720, // minutes from midnight (12:00 PM)
        weather: 'clear',
        timeSpeed: 1
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
    camera: { x: 0, y: 0 }
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

// Crafting Recipes
const RECIPES = [
    { id: 'iron_sword', name: 'Iron Sword', icon: '⚔️', requires: { wood: 2, iron: 3 }, gives: 'iron_sword' },
    { id: 'pickaxe', name: 'Pickaxe', icon: '⛏️', requires: { wood: 3, stone: 2 }, gives: 'pickaxe' },
    { id: 'axe', name: 'Axe', icon: '🪓', requires: { wood: 2, stone: 3 }, gives: 'axe' },
    { id: 'potion', name: 'Health Potion', icon: '🧪', requires: { food: 2 }, gives: 'potion' },
    { id: 'leather_armor', name: 'Leather Armor', icon: '🦺', requires: { wood: 5 }, gives: 'leather_armor' },
    { id: 'wooden_shield', name: 'Wooden Shield', icon: '🛡️', requires: { wood: 4 }, gives: 'wooden_shield' },
    { id: 'steel_sword', name: 'Steel Sword', icon: '🗡️', requires: { iron: 5, wood: 1 }, gives: 'steel_sword' }
];

// Skills Database
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

// Initialize inventory with 8 hotbar slots
for (let i = 1; i <= 8; i++) {
    game.inventory[i] = null;
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
    // Head
    ctx.fillStyle = skin;
    ctx.fillRect(x - 8 * scale, y - 15 * scale, 16 * scale, 16 * scale);
    
    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(x - 10 * scale, y - 18 * scale, 20 * scale, 8 * scale);
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 5 * scale, y - 10 * scale, 3 * scale, 3 * scale);
    ctx.fillRect(x + 2 * scale, y - 10 * scale, 3 * scale, 3 * scale);
    
    // Body
    ctx.fillStyle = shirt;
    ctx.fillRect(x - 10 * scale, y, 20 * scale, 15 * scale);
    
    // Arms
    ctx.fillStyle = skin;
    ctx.fillRect(x - 14 * scale, y + 2 * scale, 4 * scale, 12 * scale);
    ctx.fillRect(x + 10 * scale, y + 2 * scale, 4 * scale, 12 * scale);
    
    // Legs
    ctx.fillStyle = pants;
    ctx.fillRect(x - 8 * scale, y + 15 * scale, 6 * scale, 10 * scale);
    ctx.fillRect(x + 2 * scale, y + 15 * scale, 6 * scale, 10 * scale);
}

// Event Listeners for Customization
document.getElementById('skin-color').addEventListener('input', updateCharacterPreview);
document.getElementById('hair-color').addEventListener('input', updateCharacterPreview);
document.getElementById('shirt-color').addEventListener('input', updateCharacterPreview);
document.getElementById('pants-color').addEventListener('input', updateCharacterPreview);

// Initialize preview
updateCharacterPreview();

// Start Game
document.getElementById('start-game-btn').addEventListener('click', startGame);

function startGame() {
    const name = document.getElementById('char-name').value.trim();
    if (!name) {
        alert('Please enter a character name!');
        return;
    }

    // Set character data
    game.player.name = name;
    game.player.class = document.getElementById('char-class').value;
    game.player.skinTone = document.getElementById('skin-color').value;
    game.player.hairColor = document.getElementById('hair-color').value;
    game.player.shirtColor = document.getElementById('shirt-color').value;
    game.player.pantsColor = document.getElementById('pants-color').value;

    // Set class stats
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

    // Hide customization, show game
    document.getElementById('customization-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';

    initializeGame();
}

function initializeGame() {
    // Setup canvas
    game.canvas = document.getElementById('world-canvas');
    game.ctx = game.canvas.getContext('2d');
    game.canvas.width = window.innerWidth - 320;
    game.canvas.height = window.innerHeight - 80;

    // Update HUD
    updateHUD();

    // Generate world
    generateWorld();

    // Create NPCs
    createNPCs();

    // Create resources
    createResources();

    // Create enemies
    createEnemies();

    // Initialize skills
    initializeSkills();

    // Add starter items
    addItem('wood', 5);
    addItem('stone', 3);
    addItem('food', 2);
    addItem('iron', 1);

    // Update displays
    updateInventoryDisplay();
    updateNPCList();
    updateSkillsDisplay();

    // Start game loop
    requestAnimationFrame(gameLoop);

    // Show welcome notification
    showNotification(`Welcome, ${game.player.name}! Your adventure begins...`, 'success');
}

// ========================================
// GAME LOOP
// ========================================

let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Update time
    updateTime();

    // Regenerate stamina
    if (game.player.stamina < game.player.maxStamina && !game.player.inCombat) {
        game.player.stamina = Math.min(game.player.maxStamina, game.player.stamina + 0.2);
        updateHUD();
    }

    // Render world
    renderWorld();

    requestAnimationFrame(gameLoop);
}

// ========================================
// WORLD GENERATION
// ========================================

function generateWorld() {
    const ctx = game.ctx;
    const tileSize = 50;
    
    // Draw grass background
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

    // Add some variation
    for (let y = 0; y < game.canvas.height; y += tileSize) {
        for (let x = 0; x < game.canvas.width; x += tileSize) {
            if (Math.random() < 0.1) {
                ctx.fillStyle = '#1a4d1a';
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
    }
}

function renderWorld() {
    generateWorld(); // Redraw world each frame
    // Player will be rendered as an entity
}

// ========================================
// NPCs
// ========================================

function createNPCs() {
    game.npcs = [
        { id: 1, name: 'Blacksmith Tom', x: 400, y: 150, relationship: 0, type: 'blacksmith', dialogue: ['Need weapons or armor?', 'The forge is hot today!', 'I can craft you something special.'] },
        { id: 2, name: 'Merchant Mary', x: 100, y: 400, relationship: 0, type: 'merchant', dialogue: ['Welcome to my shop!', 'Fine goods for sale!', 'What can I get you?'] },
        { id: 3, name: 'Farmer John', x: 600, y: 300, relationship: 0, type: 'farmer', dialogue: ['The crops grow well.', 'Hard work, honest pay.', 'Fresh produce today!'] },
        { id: 4, name: 'Knight Arthur', x: 800, y: 200, relationship: 0, type: 'knight', dialogue: ['Honor and valor!', 'The kingdom needs defenders.', 'Train hard, fight harder.'] }
    ];

    updateNPCList();
}

function updateNPCList() {
    const list = document.getElementById('npc-list');
    list.innerHTML = '';

    game.npcs.forEach(npc => {
        const div = document.createElement('div');
        div.className = 'npc-item';
        div.onclick = () => talkToNPC(npc.id);

        const relStatus = getRelationshipStatus(npc.relationship);
        
        div.innerHTML = `
            <div class="npc-name">${npc.name}</div>
            <div class="npc-status">${npc.type} - ${relStatus.text}</div>
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
        { text: '😐 Be Neutral (no change)', action: () => closeDialog() },
        { text: '😠 Be Rude (-15 relationship)', action: () => changeRelationship(npcId, -15) },
        { text: '💰 Trade', action: () => openTrade(npcId) }
    ]);
}

function changeRelationship(npcId, amount) {
    const npc = game.npcs.find(n => n.id === npcId);
    if (!npc) return;

    npc.relationship = Math.max(-100, Math.min(100, npc.relationship + amount));
    updateNPCList();
    
    if (amount > 0) {
        showNotification(`${npc.name} likes you more!`, 'success');
    } else if (amount < 0) {
        showNotification(`${npc.name} doesn't like that...`, 'error');
    }
    
    closeDialog();
}

// ========================================
// RESOURCES
// ========================================

function createResources() {
    const resourceTypes = [
        { type: 'wood', icon: '🌲', item: 'wood', count: 10 },
        { type: 'stone', icon: '🪨', item: 'stone', count: 8 },
        { type: 'iron', icon: '⛏️', item: 'iron', count: 5 },
        { type: 'food', icon: '🌾', item: 'food', count: 6 }
    ];

    resourceTypes.forEach(resType => {
        for (let i = 0; i < resType.count; i++) {
            game.resources.push({
                type: resType.type,
                icon: resType.icon,
                item: resType.item,
                x: Math.random() * (game.canvas.width - 100),
                y: Math.random() * (game.canvas.height - 100),
                gathered: false
            });
        }
    });
}

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
    
    // Respawn after 30 seconds
    setTimeout(() => { resource.gathered = false; }, 30000);
    
    updateHUD();
}

// ========================================
// ENEMIES
// ========================================

function createEnemies() {
    const enemyTypes = [
        { name: 'Goblin', icon: '👺', hp: 30, attack: 8, defense: 2, exp: 25, gold: 10 },
        { name: 'Bandit', icon: '🗡️', hp: 50, attack: 12, defense: 5, exp: 40, gold: 20 },
        { name: 'Wolf', icon: '🐺', hp: 40, attack: 10, defense: 3, exp: 30, gold: 5 }
    ];

    for (let i = 0; i < 8; i++) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        game.enemies.push({
            ...type,
            id: i,
            x: Math.random() * (game.canvas.width - 100),
            y: Math.random() * (game.canvas.height - 100),
            maxHp: type.hp,
            alive: true
        });
    }
}

function startCombat(enemy) {
    if (!enemy.alive) return;
    
    game.player.inCombat = true;
    game.currentEnemy = enemy;
    
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

    // Enemy attacks back
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
    
    showNotification(`${enemy.name} defeated! +${enemy.exp} EXP, +${enemy.gold} gold`, 'success');
    
    checkLevelUp();
    endCombat();
    
    // Respawn enemy after 60 seconds
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
    game.player.x = 400;
    game.player.y = 300;
    
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
        
        // Increase stats
        game.player.maxHp += 20;
        game.player.hp = game.player.maxHp;
        game.player.maxMp += 10;
        game.player.mp = game.player.maxMp;
        game.player.attack += 3;
        game.player.defense += 2;
        
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

    // Find existing stack or empty slot
    if (item.stackable) {
        // Find existing stack
        for (let i = 1; i <= 8; i++) {
            const slot = game.inventory[i];
            if (slot && slot.id === itemId) {
                slot.quantity += quantity;
                updateInventoryDisplay();
                return true;
            }
        }
    }

    // Find empty slot
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
    
    // Unequip current item
    if (game.equipment[equipSlot]) {
        const oldItem = ITEMS[game.equipment[equipSlot]];
        if (oldItem.attack) game.player.attack -= oldItem.attack;
        if (oldItem.defense) game.player.defense -= oldItem.defense;
        
        // Return to inventory
        addItem(game.equipment[equipSlot], 1);
    }

    // Equip new item
    game.equipment[equipSlot] = slot.id;
    if (item.attack) game.player.attack += item.attack;
    if (item.defense) game.player.defense += item.defense;
    
    removeItem(slotId, 1);
    
    // Update display
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

    // Check if can craft
    const canCraft = Object.entries(recipe.requires).every(([itemId, amount]) => {
        return countItem(itemId) >= amount;
    });

    if (!canCraft) {
        showNotification('Not enough materials!', 'error');
        return;
    }

    // Remove materials
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

    // Add crafted item
    addItem(recipe.gives, 1);
    showNotification(`Crafted ${recipe.name}!`, 'success');
    updateRecipeDisplay();
}

// ========================================
// SKILLS SYSTEM
// ========================================

function initializeSkills() {
    game.skills = { ...SKILLS };
    
    // Unlock starting skills based on class
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
// TIME & WEATHER SYSTEM
// ========================================

function updateTime() {
    game.world.time += game.world.timeSpeed / 60; // Increase time
    if (game.world.time >= 1440) game.world.time = 0; // Reset at midnight

    const hours = Math.floor(game.world.time / 60);
    const minutes = Math.floor(game.world.time % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    document.getElementById('time-display').textContent = 
        `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;

    // Random weather changes
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
    // Player name and level
    document.getElementById('player-name').textContent = game.player.name;
    document.getElementById('player-level').textContent = game.player.level;
    document.getElementById('player-class').textContent = ` (${game.player.class})`;

    // Stats
    document.getElementById('attack-stat').textContent = game.player.attack;
    document.getElementById('defense-stat').textContent = game.player.defense;
    document.getElementById('gold-amount').textContent = game.player.gold;

    // HP
    const hpPercent = (game.player.hp / game.player.maxHp) * 100;
    document.getElementById('hp-bar').style.width = hpPercent + '%';
    document.getElementById('hp-text').textContent = `${Math.floor(game.player.hp)}/${game.player.maxHp}`;

    // MP
    const mpPercent = (game.player.mp / game.player.maxMp) * 100;
    document.getElementById('mp-bar').style.width = mpPercent + '%';
    document.getElementById('mp-text').textContent = `${Math.floor(game.player.mp)}/${game.player.maxMp}`;

    // Stamina
    const stPercent = (game.player.stamina / game.player.maxStamina) * 100;
    document.getElementById('st-bar').style.width = stPercent + '%';
    document.getElementById('st-text').textContent = `${Math.floor(game.player.stamina)}/${game.player.maxStamina}`;

    // EXP
    const xpPercent = (game.player.exp / game.player.expToNext) * 100;
    document.getElementById('xp-bar').style.width = xpPercent + '%';
    document.getElementById('xp-text').textContent = `${game.player.exp}/${game.player.expToNext}`;
}

// ========================================
// DIALOG SYSTEM
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

// ========================================
// NOTIFICATIONS
// ========================================

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

    // Movement
    const speed = 5;
    if (e.key === 'w' || e.key === 'ArrowUp') {
        game.player.y = Math.max(0, game.player.y - speed);
        game.player.facing = 'up';
    }
    if (e.key === 's' || e.key === 'ArrowDown') {
        game.player.y = Math.min(game.canvas.height - 50, game.player.y + speed);
        game.player.facing = 'down';
    }
    if (e.key === 'a' || e.key === 'ArrowLeft') {
        game.player.x = Math.max(0, game.player.x - speed);
        game.player.facing = 'left';
    }
    if (e.key === 'd' || e.key === 'ArrowRight') {
        game.player.x = Math.min(game.canvas.width - 50, game.player.x + speed);
        game.player.facing = 'right';
    }

    // Actions
    if (e.key === ' ') {
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

    // Hotbar
    if (e.key >= '1' && e.key <= '8') {
        useItem(parseInt(e.key));
    }
});

document.addEventListener('keyup', (e) => {
    game.keys[e.key.toLowerCase()] = false;
});

function interactNearby() {
    // Check for resources
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
        if (dist < 70) {
            talkToNPC(npc.id);
        }
    });
}

function attackNearbyEnemy() {
    game.enemies.forEach(enemy => {
        const dist = Math.hypot(game.player.x - enemy.x, game.player.y - enemy.y);
        if (dist < 70 && enemy.alive) {
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
// MENU FUNCTIONS
// ========================================

function openInventory() {
    document.getElementById('inventory-menu').classList.add('show');
}

function closeInventory() {
    document.getElementById('inventory-menu').classList.remove('show');
}

function openMap() {
    const menu = document.getElementById('map-menu');
    menu.classList.add('show');
    
    // Draw simple map
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, 800, 600);
    
    // Draw player
    ctx.fillStyle = 'gold';
    ctx.fillRect(390, 290, 20, 20);
    
    // Draw NPCs
    ctx.fillStyle = '#3b82f6';
    game.npcs.forEach(npc => {
        const x = (npc.x / game.canvas.width) * 800;
        const y = (npc.y / game.canvas.height) * 600;
        ctx.fillRect(x - 5, y - 5, 10, 10);
    });
    
    // Draw enemies
    ctx.fillStyle = '#ef4444';
    game.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const x = (enemy.x / game.canvas.width) * 800;
        const y = (enemy.y / game.canvas.height) * 600;
        ctx.fillRect(x - 5, y - 5, 10, 10);
    });
}

function closeMap() {
    document.getElementById('map-menu').classList.remove('show');
}

function openTrade(npcId) {
    showNotification('Trading system coming soon!', 'info');
    closeDialog();
}

// Initialize game when ready
console.log('Medieval RPG loaded! Press Start to begin your adventure!');
