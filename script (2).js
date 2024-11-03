// Canvas setup and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Inventory panel and items list elements
const inventoryPanel = document.getElementById('inventoryPanel');
const inventoryItemsList = document.getElementById('inventoryItems');
const equipButtonSlipper = document.getElementById('equipButtonSlipper');
const equipButtonBottle = document.getElementById('equipButtonBottle');
const shopButton = document.getElementById('shopButton');
const respawnButton = document.getElementById('respawnButton');

// Image setups
const playerImage = new Image();
playerImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/image_2024-11-01_162704710.png";

const slipperImage = new Image();
slipperImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/file.png";

const bottleImage = new Image();
bottleImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/image_2024-11-01_210214474.png";

const houseImage = new Image();
houseImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/image_2024-11-01_161736155.png";

const squareImage = new Image();
squareImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/image_2024-11-01_163043863.png";

const weaponImage = new Image();
weaponImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/file.png";

// House background image setup with loading handler
const houseBackgroundImage = new Image();
houseBackgroundImage.src = "https://assets.onecompiler.app/42wswghpg/42wv9ajwg/house_interior.png";
let houseBackgroundLoaded = false;
houseBackgroundImage.addEventListener('load', () => {
    houseBackgroundLoaded = true;
    console.log('House background loaded successfully');
});

// Player properties
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    speed: 2
};

// Key press tracking
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
};

// House properties
const house = {
    x: canvas.width - 100,
    y: 10,
    width: 80,
    height: 80
};

// Square position and properties
const square = {
    x: house.x + 10,
    y: house.y + 30,
    width: 60,
    height: 40,
    collided: false,
    velocity: {
        x: 0,
        y: 0
    },
    friction: 0.98
};

// Area states
let currentArea = "Outside";
const exitBox = {
    x: (canvas.width / 2) - 40,
    y: canvas.height - 60,
    width: 80,
    height: 40
};

// Beach properties
const beachEntrance = {
    x: 20,
    y: canvas.height / 2 - 20,
    width: 40,
    height: 40
};

const beachExit = {
    x: (canvas.width / 2) - 40,
    y: canvas.height - 60,
    width: 80,
    height: 40
};

const weapon = {
    x: (3 * canvas.width) / 4,
    y: canvas.height / 2,
    width: 40,
    height: 40
};

// Game state variables
let inventory = [];
let equippedWeapon = null;
let coins = 0;
let canHitSquare = true;

// Slipper pickup properties
const slipperPickup = {
    x: house.x + 20,
    y: house.y + 10,
    width: 40,
    height: 40
};

// Shop setup
const shopPanel = document.createElement('div');
const shopItemsList = document.createElement('ul');
const buyBottleButton = document.createElement('button');
shopPanel.id = 'shopPanel';
buyBottleButton.textContent = "Buy Bottle (10 Coins)";
shopPanel.appendChild(shopItemsList);
shopPanel.appendChild(buyBottleButton);
document.body.appendChild(shopPanel);

// Respawn button functionality
respawnButton.addEventListener('click', () => {
    square.x = player.x;
    square.y = player.y;
    square.velocity.x = 0;
    square.velocity.y = 0;
});

function toggleEquipSlipper() {
    if (equippedWeapon === "Slipper") {
        equippedWeapon = null;
        equipButtonSlipper.textContent = "Equip Slipper";
    } else if (inventory.includes("Slipper")) {
        equippedWeapon = "Slipper";
        equipButtonSlipper.textContent = "Unequip Slipper";
    }
    updateInventoryDisplay();
}

function toggleEquipBottle() {
    if (equippedWeapon === "Bottle") {
        equippedWeapon = null;
        equipButtonBottle.textContent = "Equip Bottle";
    } else if (inventory.includes("Bottle")) {
        equippedWeapon = "Bottle";
        equipButtonBottle.textContent = "Unequip Bottle";
    }
    updateInventoryDisplay();
}

function addToInventory(item) {
    if (!inventory.includes(item)) {
        inventory.push(item);
        updateInventoryDisplay();
    }
}

function updateInventoryDisplay() {
    inventoryItemsList.innerHTML = '';
    inventory.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        inventoryItemsList.appendChild(li);
    });
    inventoryPanel.style.display = inventory.length > 0 ? 'block' : 'none';
}

shopButton.addEventListener('click', () => {
    shopPanel.style.display = shopPanel.style.display === 'none' ? 'block' : 'none';
    updateShopDisplay();
});

function updateShopDisplay() {
    shopItemsList.innerHTML = '';
    const li = document.createElement('li');
    li.textContent = "Bottle - 10 Coins";
    shopItemsList.appendChild(li);
}

buyBottleButton.addEventListener('click', () => {
    if (coins >= 10) {
        coins -= 10;
        addToInventory("Bottle");
        updateInventoryDisplay();
        updateShopDisplay();
        console.log(`Coins: ${coins}`);
    } else {
        alert("Not enough coins to buy the Bottle!");
    }
});

function update() {
    // Movement
    if (keys.w && player.y > 0) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.height) player.y += player.speed;
    if (keys.a && player.x > 0) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.width) player.x += player.speed;

    // Area transitions and collisions
    if (player.x < house.x + house.width && player.x + player.width > house.x &&
        player.y < house.y + house.height && player.y + player.height > house.y) {
        currentArea = "House";
    }

    if (currentArea === "House" && player.x < exitBox.x + exitBox.width &&
        player.x + player.width > exitBox.x && player.y < exitBox.y + exitBox.height &&
        player.y + player.height > exitBox.y) {
        currentArea = "Outside";
    }

    if (currentArea === "Outside" && player.x < beachEntrance.x + beachEntrance.width &&
        player.x + player.width > beachEntrance.x && player.y < beachEntrance.y + beachEntrance.height &&
        player.y + player.height > beachEntrance.y) {
        currentArea = "Beach";
    }

    if (currentArea === "Beach" && player.x < beachExit.x + beachExit.width &&
        player.x + player.width > beachExit.x && player.y < beachExit.y + beachExit.height &&
        player.y + player.height > beachExit.y) {
        currentArea = "Outside";
    }

    // Square collision and mechanics
    if (currentArea === "House" && player.x < square.x + square.width &&
        player.x + player.width > square.x && player.y < square.y + square.height &&
        player.y + player.height > square.y) {
        if (canHitSquare) {
            let coinReward = 5;
            if (equippedWeapon === "Slipper") {
                coinReward *= 1.5;
            } else if (equippedWeapon === "Bottle") {
                coinReward *= 2;
            }
            coins += Math.floor(coinReward);
            console.log(`Coins: ${coins}`);

            const hitDirectionX = (player.x + player.width / 2) - (square.x + square.width / 2);
            const hitDirectionY = (player.y + player.height / 2) - (square.y + square.height / 2);
            const magnitude = Math.sqrt(hitDirectionX * hitDirectionX + hitDirectionY * hitDirectionY);

            if (magnitude !== 0) {
                square.velocity.x = (hitDirectionX / magnitude) * 5;
                square.velocity.y = (hitDirectionY / magnitude) * 5;
            }
            canHitSquare = false;
            setTimeout(() => {
                canHitSquare = true;
            }, 1000);
        }
    }

    // Slipper pickup collision
    if (currentArea === "House" && player.x < slipperPickup.x + slipperPickup.width &&
        player.x + player.width > slipperPickup.x && player.y < slipperPickup.y + slipperPickup.height &&
        player.y + player.height > slipperPickup.y) {
        addToInventory("Slipper");
        slipperPickup.x = -100;
    }

    // Update square physics
    square.x += square.velocity.x;
    square.y += square.velocity.y;
    square.velocity.x *= square.friction;
    square.velocity.y *= square.friction;

    // Clear and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentArea === "House") {
        // Draw house background only if loaded
        if (houseBackgroundLoaded) {
            ctx.drawImage(houseBackgroundImage, 0, 0, canvas.width, canvas.height);
        } else {
            // Fallback color if image hasn't loaded
            ctx.fillStyle = "#8B0000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(houseImage, house.x, house.y, house.width, house.height);
        ctx.drawImage(squareImage, square.x, square.y, square.width, square.height);
        ctx.drawImage(slipperImage, slipperPickup.x, slipperPickup.y, slipperPickup.width, slipperPickup.height);
    } else if (currentArea === "Beach") {
        ctx.fillStyle = "lightblue";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(weaponImage, weapon.x, weapon.y, weapon.width, weapon.height);
    } else {
        ctx.fillStyle = "lightgreen";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`Coins: ${coins}`, 10, 20);

    requestAnimationFrame(update);
}

// Event listeners
window.addEventListener('keydown', (e) => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
});

equipButtonSlipper.addEventListener('click', toggleEquipSlipper);
equipButtonBottle.addEventListener('click', toggleEquipBottle);

// Start game
update();
