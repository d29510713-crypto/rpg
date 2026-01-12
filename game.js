// ========================================
// MEDIEVAL RPG - PIXEL PERFECT EDITION
// WITH ROMANCE, ANIMATED CHARACTER, TREES
// ========================================

// Game State
const game = {
    player: {
        name: '',
        gender: 'male',
        x: 400,
        y: 300,
        speed: 2,
        facing: 'down',
        walking: false,
        walkFrame: 0,
        walkTimer: 0,
        level: 1,
        exp: 0,
        expToNext: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        gold: 0,
        skinColor: '#ffd1a3',
        hairColor: '#4a3728',
        shirtColor: '#8b4513',
        pantsColor: '#5a4a3a',
        attack: 10,
        defense: 5
    },
    world: {
        width: 3000,
        height: 3000,
        time: 720,
        timeSpeed: 0.5,
        seed: Math.random()
    },
    camera: { x: 0, y: 0 },
    keys: {},
    inventory: {},
    npcs: [],
    trees: [],
    resources: [],
    enemies: [],
    canvas: null,
    ctx: null
};

// NPC Templates with Romance
const NPC_TEMPLATES = [
    { 
        name: 'Alice', gender: 'female', type: 'merchant', personality: 'Kind',
        dialogues: {
            first: "Oh hello! I haven't seen you around before.",
            neutral: "Welcome to my shop!",
            friend: "Hey! It's good to see you again!",
            romantic: "I always look forward to your visits...",
            love: "I... I think I'm falling for you. ❤️"
        }
    },
    { 
        name: 'Sebastian', gender: 'male', type: 'blacksmith', personality: 'Stoic',
        dialogues: {
            first: "New around here? Need equipment?",
            neutral: "The forge keeps me busy.",
            friend: "You're alright.",
            romantic: "I look forward to seeing you...",
            love: "Never thought I'd feel this way. ❤️"
        }
    },
    { 
        name: 'Emily', gender: 'female', type: 'farmer', personality: 'Cheerful',
        dialogues: {
            first: "Hi there! Beautiful day!",
            neutral: "The crops are growing well!",
            friend: "You're such a good friend!",
            romantic: "I can't stop thinking about you...",
            love: "I love you! ❤️"
        }
    }
];

// Initialize Character Preview
function initCharPreview() {
    const canvas = document.getElementById('char-preview');
    const ctx = canvas.getContext('2d');
    
    function updatePreview() {
        ctx.clearRect(0, 0, 200, 200);
        const skinColor = document.getElementById('skin-color').value;
        const hairColor = document.getElementById('hair-color').value;
        const shirtColor = document.getElementById('shirt-color').value;
        const pantsColor = document.getElementById('pants-color').value;
        
        drawCharacter(ctx, 100, 100, 4, skinColor, hairColor, shirtColor, pantsColor, 'down', 0);
    }
    
    document.getElementById('skin-color').addEventListener('input', updatePreview);
    document.getElementById('hair-color').addEventListener('input', updatePreview);
    document.getElementById('shirt-color').addEventListener('input', updatePreview);
    document.getElementById('pants-color').addEventListener('input', updatePreview);
    
    updatePreview();
}

// Draw Character Function
function drawCharacter(ctx, x, y, scale, skin, hair, shirt, pants, facing, frame) {
    ctx.save();
    ctx.translate(x, y);
    
    // Body
    ctx.fillStyle = shirt;
    ctx.fillRect(-4 * scale, -2 * scale, 8 * scale, 8 * scale);
    
    // Head
    ctx.fillStyle = skin;
    ctx.fillRect(-4 * scale, -10 * scale, 8 * scale, 8 * scale);
    
    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(-5 * scale, -12 * scale, 10 * scale, 4 * scale);
    
    // Eyes
    ctx.fillStyle = '#000';
    if (facing === 'left') {
        ctx.fillRect(-1 * scale, -7 * scale, 2 * scale, 2 * scale);
    } else if (facing === 'right') {
        ctx.fillRect(1 * scale, -7 * scale, 2 * scale, 2 * scale);
    } else {
        ctx.fillRect(-3 * scale, -7 * scale, 2 * scale, 2 * scale);
        ctx.fillRect(1 * scale, -7 * scale, 2 * scale, 2 * scale);
    }
    
    // Arms
    ctx.fillStyle = skin;
    const armOffset = frame === 1 ? 1 * scale : frame === 2 ? -1 * scale : 0;
    ctx.fillRect(-7 * scale, -1 * scale + armOffset, 3 * scale, 6 * scale);
    ctx.fillRect(4 * scale, -1 * scale - armOffset, 3 * scale, 6 * scale);
    
    // Legs
    ctx.fillStyle = pants;
    const legOffset = frame === 1 ? 2 * scale : frame === 2 ? -2 * scale : 0;
    ctx.fillRect(-4 * scale, 6 * scale + legOffset, 3 * scale, 6 * scale);
    ctx.fillRect(1 * scale, 6 * scale - legOffset, 3 * scale, 6 * scale);
    
    ctx.restore();
}

// Start Game
document.getElementById('start-btn').addEventListener('click', () => {
    const name = document.getElementById('player-name').value.trim();
    if (!name) { alert('Please enter a name!'); return; }
    
    game.player.name = name;
    game.player.gender = document.getElementById('player-gender').value;
    game.player.skinColor = document.getElementById('skin-color').value;
    game.player.hairColor = document.getElementById('hair-color').value;
    game.player.shirtColor = document.getElementById('shirt-color').value;
    game.player.pantsColor = document.getElementById('pants-color').value;
    
    document.getElementById('char-creation').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    
    initGame();
});

// Initialize Game
function initGame() {
    game.canvas = document.getElementById('game-canvas');
    game.ctx = game.canvas.getContext('2d');
    game.canvas.width = window.innerWidth;
    game.canvas.height = window.innerHeight - 100;
    
    updateHUD();
    spawnNPCs();
    spawnTrees();
    spawnResources();
    
    game.camera.x = game.player.x - game.canvas.width / 2;
    game.camera.y = game.player.y - game.canvas.height / 2;
    
    requestAnimationFrame(gameLoop);
    showNotification('Welcome, ' + game.player.name + '!', 'info');
}

// Spawn NPCs
function spawnNPCs() {
    NPC_TEMPLATES.forEach((template, index) => {
        game.npcs.push({
            ...template,
            id: index,
            x: 200 + index * 150,
            y: 300,
            relationship: 0,
            romanceLevel: 0,
            giftsGiven: 0,
            lastTalked: 0
        });
    });
}

// Spawn Trees
function spawnTrees() {
    for (let i = 0; i < 100; i++) {
        game.trees.push({
            x: Math.random() * game.world.width,
            y: Math.random() * game.world.height,
            type: Math.random() > 0.5 ? 'oak' : 'pine'
        });
    }
}

// Spawn Resources
function spawnResources() {
    const types = ['wood', 'stone', 'flower'];
    for (let i = 0; i < 50; i++) {
        game.resources.push({
            x: Math.random() * game.world.width,
            y: Math.random() * game.world.height,
            type: types[Math.floor(Math.random() * types.length)],
            gathered: false
        });
    }
}

// Game Loop
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}

// Update
function update(deltaTime) {
    handleMovement(deltaTime);
    updateCamera();
    updateTime();
    
    if (game.player.walking) {
        game.player.walkTimer += deltaTime;
        if (game.player.walkTimer > 0.15) {
            game.player.walkFrame = (game.player.walkFrame + 1) % 3;
            game.player.walkTimer = 0;
        }
    } else {
        game.player.walkFrame = 0;
    }
}

// Handle Movement
function handleMovement(deltaTime) {
    let moving = false;
    let newX = game.player.x;
    let newY = game.player.y;
    
    if (game.keys['w'] || game.keys['arrowup']) {
        newY -= game.player.speed;
        game.player.facing = 'up';
        moving = true;
    }
    if (game.keys['s'] || game.keys['arrowdown']) {
        newY += game.player.speed;
        game.player.facing = 'down';
        moving = true;
    }
    if (game.keys['a'] || game.keys['arrowleft']) {
        newX -= game.player.speed;
        game.player.facing = 'left';
        moving = true;
    }
    if (game.keys['d'] || game.keys['arrowright']) {
        newX += game.player.speed;
        game.player.facing = 'right';
        moving = true;
    }
    
    game.player.walking = moving;
    
    if (newX >= 0 && newX <= game.world.width && newY >= 0 && newY <= game.world.height) {
        game.player.x = newX;
        game.player.y = newY;
    }
}

// Update Camera
function updateCamera() {
    game.camera.x = game.player.x - game.canvas.width / 2;
    game.camera.y = game.player.y - game.canvas.height / 2;
    
    game.camera.x = Math.max(0, Math.min(game.camera.x, game.world.width - game.canvas.width));
    game.camera.y = Math.max(0, Math.min(game.camera.y, game.world.height - game.canvas.height));
}

// Update Time
function updateTime() {
    game.world.time += game.world.timeSpeed;
    if (game.world.time >= 1440) game.world.time = 0;
    
    const hours = Math.floor(game.world.time / 60);
    const minutes = Math.floor(game.world.time % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    document.getElementById('time-display').textContent = 
        `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Render
function render() {
    const ctx = game.ctx;
    ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Sky
    const hour = Math.floor(game.world.time / 60);
    let skyColor1, skyColor2;
    
    if (hour >= 6 && hour < 18) {
        skyColor1 = '#87CEEB';
        skyColor2 = '#E0F6FF';
    } else {
        skyColor1 = '#0B1026';
        skyColor2 = '#1A1A2E';
    }
    
    const gradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
    gradient.addColorStop(0, skyColor1);
    gradient.addColorStop(1, skyColor2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Ground
    ctx.fillStyle = '#4a7c4e';
    ctx.fillRect(0, game.canvas.height / 2, game.canvas.width, game.canvas.height / 2);
    
    // Trees
    game.trees.forEach(tree => {
        const screenX = tree.x - game.camera.x;
        const screenY = tree.y - game.camera.y;
        
        if (screenX > -50 && screenX < game.canvas.width + 50 &&
            screenY > -100 && screenY < game.canvas.height + 100) {
            drawTree(ctx, screenX, screenY, tree.type);
        }
    });
    
    // Resources
    game.resources.forEach(resource => {
        if (resource.gathered) return;
        
        const screenX = resource.x - game.camera.x;
        const screenY = resource.y - game.camera.y;
        
        if (screenX > -50 && screenX < game.canvas.width + 50 &&
            screenY > -50 && screenY < game.canvas.height + 50) {
            drawResource(ctx, screenX, screenY, resource.type);
        }
    });
    
    // NPCs
    game.npcs.forEach(npc => {
        const screenX = npc.x - game.camera.x;
        const screenY = npc.y - game.camera.y;
        
        if (screenX > -50 && screenX < game.canvas.width + 50 &&
            screenY > -50 && screenY < game.canvas.height + 50) {
            const npcSkin = npc.gender === 'female' ? '#ffe5d9' : '#d4a574';
            const npcHair = npc.gender === 'female' ? '#8b4513' : '#4a3728';
            const npcShirt = npc.gender === 'female' ? '#e91e63' : '#1976d2';
            const npcPants = '#5a4a3a';
            
            drawCharacter(ctx, screenX, screenY, 1.5, npcSkin, npcHair, npcShirt, npcPants, 'down', 0);
            
            // Name
            ctx.font = 'bold 12px Courier New';
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText(npc.name, screenX - 25, screenY - 30);
            ctx.fillText(npc.name, screenX - 25, screenY - 30);
            
            if (npc.romanceLevel >= 3) {
                ctx.font = '16px Arial';
                ctx.fillText('❤️', screenX + 20, screenY - 30);
            }
        }
    });
    
    // Player
    const screenX = game.player.x - game.camera.x;
    const screenY = game.player.y - game.camera.y;
    
    drawCharacter(
        ctx, screenX, screenY, 1.5,
        game.player.skinColor,
        game.player.hairColor,
        game.player.shirtColor,
        game.player.pantsColor,
        game.player.facing,
        game.player.walkFrame
    );
    
    // Player name
    ctx.font = 'bold 14px Courier New';
    ctx.fillStyle = '#d4af37';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(game.player.name, screenX - 30, screenY - 35);
    ctx.fillText(game.player.name, screenX - 30, screenY - 35);
}

// Draw Tree
function drawTree(ctx, x, y, type) {
    ctx.fillStyle = '#654321';
    ctx.fillRect(x - 5, y, 10, 25);
    
    if (type === 'oak') {
        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.arc(x, y - 10, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - 12, y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 12, y, 15, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = '#1a5f1a';
        ctx.beginPath();
        ctx.moveTo(x, y - 35);
        ctx.lineTo(x - 15, y);
        ctx.lineTo(x + 15, y);
        ctx.closePath();
        ctx.fill();
    }
}

// Draw Resource
function drawResource(ctx, x, y, type) {
    if (type === 'wood') {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x - 8, y - 8, 16, 16);
    } else if (type === 'stone') {
        ctx.fillStyle = '#808080';
        ctx.fillRect(x - 8, y - 8, 16, 16);
    } else if (type === 'flower') {
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Update HUD
function updateHUD() {
    document.getElementById('hud-name').textContent = game.player.name;
    document.getElementById('hud-level').textContent = game.player.level;
    
    const hpPercent = (game.player.hp / game.player.maxHp) * 100;
    document.getElementById('hp-bar').style.width = hpPercent + '%';
    document.getElementById('hp-text').textContent = `${game.player.hp}/${game.player.maxHp}`;
    
    const mpPercent = (game.player.mp / game.player.maxMp) * 100;
    document.getElementById('mp-bar').style.width = mpPercent + '%';
    document.getElementById('mp-text').textContent = `${game.player.mp}/${game.player.maxMp}`;
    
    const expPercent = (game.player.exp / game.player.expToNext) * 100;
    document.getElementById('exp-bar').style.width = expPercent + '%';
    document.getElementById('exp-text').textContent = `${game.player.exp}/${game.player.expToNext}`;
    
    document.getElementById('gold-amount').textContent = game.player.gold;
}

// Notifications
function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    
    document.getElementById('notifications').appendChild(notif);
    
    setTimeout(() => notif.remove(), 3000);
}

// Interact with NPC
function interactWithNPC(npc) {
    const dialogBox = document.getElementById('dialog-box');
    const npcPortrait = document.getElementById('npc-portrait');
    const npcName = document.getElementById('npc-name');
    const relationshipFill = document.getElementById('relationship-fill');
    const dialogText = document.getElementById('dialog-text');
    const dialogOptions = document.getElementById('dialog-options');
    
    dialogBox.style.display = 'block';
    
    npcPortrait.textContent = npc.gender === 'female' ? '👩' : '👨';
    npcName.textContent = npc.name;
    
    const relPercent = ((npc.relationship + 100) / 200) * 100;
    relationshipFill.style.width = relPercent + '%';
    
    let dialogue;
    if (npc.romanceLevel === 4) {
        dialogue = npc.dialogues.love;
    } else if (npc.romanceLevel === 3) {
        dialogue = npc.dialogues.romantic;
    } else if (npc.relationship >= 40) {
        dialogue = npc.dialogues.friend;
    } else if (npc.lastTalked === 0) {
        dialogue = npc.dialogues.first;
        npc.lastTalked = 1;
    } else {
        dialogue = npc.dialogues.neutral;
    }
    
    dialogText.textContent = dialogue;
    dialogOptions.innerHTML = '';
    
    // Talk
    const talkOption = document.createElement('div');
    talkOption.className = 'dialog-option';
    talkOption.textContent = '💬 Chat (+5 relationship)';
    talkOption.onclick = () => {
        npc.relationship = Math.min(100, npc.relationship + 5);
        checkRomanceLevel(npc);
        showNotification(`${npc.name} enjoyed talking!`, 'success');
        dialogBox.style.display = 'none';
    };
    dialogOptions.appendChild(talkOption);
    
    // Gift
    const giftOption = document.createElement('div');
    giftOption.className = 'dialog-option';
    giftOption.textContent = '🎁 Give Gift (+15)';
    giftOption.onclick = () => {
        npc.relationship = Math.min(100, npc.relationship + 15);
        checkRomanceLevel(npc);
        showNotification(`${npc.name} loved your gift! ❤️`, 'success');
        dialogBox.style.display = 'none';
    };
    dialogOptions.appendChild(giftOption);
    
    // Flirt
    if (npc.relationship >= 40 && npc.romanceLevel < 4) {
        const flirtOption = document.createElement('div');
        flirtOption.className = 'dialog-option romance';
        flirtOption.textContent = '💖 Flirt (+10)';
        flirtOption.onclick = () => {
            npc.relationship = Math.min(100, npc.relationship + 10);
            checkRomanceLevel(npc);
            showNotification(`${npc.name} is blushing! 😊`, 'success');
            dialogBox.style.display = 'none';
        };
        dialogOptions.appendChild(flirtOption);
    }
    
    // Confess
    if (npc.relationship >= 100 && npc.romanceLevel === 3) {
        const confessOption = document.createElement('div');
        confessOption.className = 'dialog-option romance';
        confessOption.textContent = '💍 Confess Love';
        confessOption.onclick = () => {
            npc.romanceLevel = 4;
            showNotification(`${npc.name} loves you too! ❤️❤️❤️`, 'success');
            dialogBox.style.display = 'none';
        };
        dialogOptions.appendChild(confessOption);
    }
    
    // Close
    const closeOption = document.createElement('div');
    closeOption.className = 'dialog-option';
    closeOption.textContent = '👋 Goodbye';
    closeOption.onclick = () => { dialogBox.style.display = 'none'; };
    dialogOptions.appendChild(closeOption);
}

// Check Romance
function checkRomanceLevel(npc) {
    if (npc.relationship >= 80 && npc.romanceLevel < 3) {
        npc.romanceLevel = 3;
        showNotification(`Dating ${npc.name}! 💕`, 'success');
    } else if (npc.relationship >= 60 && npc.romanceLevel < 2) {
        npc.romanceLevel = 2;
        showNotification(`${npc.name} has a crush! 😊`, 'success');
    } else if (npc.relationship >= 40 && npc.romanceLevel < 1) {
        npc.romanceLevel = 1;
        showNotification(`${npc.name} is your friend!`, 'success');
    }
}

// Keyboard Events
document.addEventListener('keydown', (e) => {
    game.keys[e.key.toLowerCase()] = true;
    
    if (e.key.toLowerCase() === 'e') {
        game.npcs.forEach(npc => {
            const dist = Math.hypot(game.player.x - npc.x, game.player.y - npc.y);
            if (dist < 80) interactWithNPC(npc);
        });
    }
    
    if (e.key === ' ') {
        e.preventDefault();
        game.resources.forEach(resource => {
            if (resource.gathered) return;
            const dist = Math.hypot(game.player.x - resource.x, game.player.y - resource.y);
            if (dist < 40) {
                resource.gathered = true;
                showNotification(`Gathered ${resource.type}!`, 'success');
                setTimeout(() => { resource.gathered = false; }, 30000);
            }
        });
    }
    
    if (e.key.toLowerCase() === 'i') {
        const inv = document.getElementById('inventory-screen');
        inv.style.display = inv.style.display === 'none' ? 'flex' : 'none';
    }
    
    if (e.key.toLowerCase() === 'm') {
        const map = document.getElementById('map-screen');
        if (map.style.display === 'none') {
            openMap();
        } else {
            map.style.display = 'none';
        }
    }
});

document.addEventListener('keyup', (e) => {
    game.keys[e.key.toLowerCase()] = false;
});

// Open Map
function openMap() {
    const map = document.getElementById('map-screen');
    map.style.display = 'flex';
    
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    const scale = canvas.width / game.world.width;
    
    ctx.fillStyle = '#4a7c4e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#2d5016';
    game.trees.forEach(tree => {
        ctx.fillRect(tree.x * scale - 2, tree.y * scale - 2, 4, 4);
    });
    
    ctx.fillStyle = '#1976d2';
    game.npcs.forEach(npc => {
        ctx.fillRect(npc.x * scale - 3, npc.y * scale - 3, 6, 6);
    });
    
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(game.player.x * scale, game.player.y * scale, 5, 0, Math.PI * 2);
    ctx.fill();
}

// Close functions
function closeInventory() {
    document.getElementById('inventory-screen').style.display = 'none';
}

function closeMap() {
    document.getElementById('map-screen').style.display = 'none';
}

// Initialize on load
window.addEventListener('load', initCharPreview);
