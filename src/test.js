const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_HEIGHT = 30;
const COIN_SIZE = 20;
const LEVEL_WIDTH = 2400;
const MONSTER_WIDTH = 32;
const MONSTER_HEIGHT = 32;

let gameState = {
    level: 1,
    scrollOffset: 0,
    gameOver: false,
    lives: 3
};

const marioSprite = new Image();
marioSprite.src = 'images/mario.png';
const blockSprite = new Image();
blockSprite.src = 'images/block.png';
const coinSprite = new Image();
coinSprite.src = 'images/coin.png';
const monsterSprite = new Image();
monsterSprite.src = 'images/monster.png';

const player = {
    x: 50,
    y: 300,
    width: 32,
    height: 32,
    speed: 5,
    jumping: false,
    velocityY: 0,
    direction: 'right',
    frame: 0,
    frameCount: 3,
    frameDelay: 5,
    frameTimer: 0,
    score: 0
};

const trees = [
    { x: 100, y: CANVAS_HEIGHT - GROUND_HEIGHT - 80, width: 40, height: 80, type: 'pine' },
    { x: 300, y: CANVAS_HEIGHT - GROUND_HEIGHT - 60, width: 40, height: 60, type: 'oak' },
    { x: 500, y: CANVAS_HEIGHT - GROUND_HEIGHT - 70, width: 40, height: 70, type: 'pine' },
    { x: 700, y: CANVAS_HEIGHT - GROUND_HEIGHT - 65, width: 40, height: 65, type: 'oak' },
    { x: 900, y: CANVAS_HEIGHT - GROUND_HEIGHT - 75, width: 40, height: 75, type: 'pine' },
    { x: 1200, y: CANVAS_HEIGHT - GROUND_HEIGHT - 70, width: 40, height: 70, type: 'oak' }
];

const clouds = [
    { x: 150, y: 50, radius: 20, speed: 0.2, type: 'small' },
    { x: 400, y: 80, radius: 25, speed: 0.3, type: 'medium' },
    { x: 600, y: 60, radius: 30, speed: 0.1, type: 'large' },
    { x: 800, y: 70, radius: 22, speed: 0.25, type: 'small' },
    { x: 1000, y: 40, radius: 28, speed: 0.15, type: 'medium' }
];

const createLevel = (level) => {
    switch(level) {
        case 1:
            return {
                blocks: [
                    { x: 200, y: 250, width: 32, height: 32 },
                    { x: 232, y: 250, width: 32, height: 32 },
                    { x: 400, y: 200, width: 32, height: 32 },
                    { x: 600, y: 250, width: 32, height: 32 },
                    { x: 800, y: 200, width: 32, height: 32 },
                    { x: 1000, y: 250, width: 32, height: 32 },
                    { x: 1200, y: 200, width: 32, height: 32 }
                ],
                coins: [
                    { x: 200, y: 200, size: COIN_SIZE, collected: false },
                    { x: 400, y: 150, size: COIN_SIZE, collected: false },
                    { x: 600, y: 200, size: COIN_SIZE, collected: false },
                    { x: 800, y: 150, size: COIN_SIZE, collected: false },
                    { x: 1000, y: 200, size: COIN_SIZE, collected: false }
                ],
                monsters: [
                    { x: 300, y: 300, width: MONSTER_WIDTH, height: MONSTER_HEIGHT, speed: 2, direction: 1 },
                    { x: 700, y: 300, width: MONSTER_WIDTH, height: MONSTER_HEIGHT, speed: 3, direction: 1 },
                    { x: 1100, y: 300, width: MONSTER_WIDTH, height: MONSTER_HEIGHT, speed: 2, direction: -1 }
                ],
                boundaries: [
                    { x: 250, x2: 400 },
                    { x: 650, x2: 800 },
                    { x: 1050, x2: 1200 }
                ],
                endFlag: { x: 2200, y: CANVAS_HEIGHT - 100, width: 32, height: 100 }
            };
        case 2:
            return {
                blocks: [
                    { x: 200, y: 200, width: 32, height: 32 },
                    { x: 400, y: 150, width: 32, height: 32 },
                    { x: 600, y: 200, width: 32, height: 32 },
                    { x: 800, y: 150, width: 32, height: 32 },
                    { x: 1000, y: 200, width: 32, height: 32 }
                ],
                coins: [
                    { x: 300, y: 150, size: COIN_SIZE, collected: false },
                    { x: 500, y: 100, size: COIN_SIZE, collected: false },
                    { x: 700, y: 150, size: COIN_SIZE, collected: false },
                    { x: 900, y: 100, size: COIN_SIZE, collected: false }
                ],
                monsters: [
                    { x: 400, y: 300, width: MONSTER_WIDTH, height: MONSTER_HEIGHT, speed: 3, direction: 1 },
                    { x: 800, y: 300, width: MONSTER_WIDTH, height: MONSTER_HEIGHT, speed: 4, direction: 1 }
                ],
                boundaries: [
                    { x: 350, x2: 500 },
                    { x: 750, x2: 900 }
                ],
                endFlag: { x: 2200, y: CANVAS_HEIGHT - 100, width: 32, height: 100 }
            };
    }
};

const gravity = 0.5;
const jumpForce = -12;

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowRight':
            player.x += player.speed;
            player.direction = 'right';
            updatePlayerAnimation();
            break;
        case 'ArrowLeft':
            player.x -= player.speed;
            player.direction = 'left';
            updatePlayerAnimation();
            break;
        case ' ':
            if (!player.jumping) {
                player.velocityY = jumpForce;
                player.jumping = true;
            }
            break;
        case 'Enter':
            if (gameState.gameOver) {
                resetGame();
            }
            break;
    }
});

function updatePlayerAnimation() {
    player.frameTimer++;
    if (player.frameTimer >= player.frameDelay) {
        player.frameTimer = 0;
        player.frame = (player.frame + 1) % player.frameCount;
    }
}

function drawTree(tree) {
    const gradient = ctx.createLinearGradient(tree.x, tree.y, tree.x + tree.width, tree.y + tree.height);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(1, '#654321');
    ctx.fillStyle = gradient;
    ctx.fillRect(tree.x, tree.y, tree.width, tree.height);
    
    ctx.fillStyle = tree.type === 'pine' ? '#005000' : '#228B22';
    if (tree.type === 'pine') {
        ctx.beginPath();
        ctx.moveTo(tree.x - tree.width/2, tree.y);
        ctx.lineTo(tree.x + tree.width * 1.5, tree.y);
        ctx.lineTo(tree.x + tree.width/2, tree.y - tree.height/2);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(tree.x + tree.width/2, tree.y - tree.height/4, tree.width, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCloud(cloud) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    
    switch(cloud.type) {
        case 'small':
            ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.radius, cloud.y, cloud.radius * 0.6, 0, Math.PI * 2);
            break;
        case 'medium':
            ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.radius, cloud.y, cloud.radius * 0.8, 0, Math.PI * 2);
            ctx.arc(cloud.x - cloud.radius, cloud.y, cloud.radius * 0.7, 0, Math.PI * 2);
            break;
        case 'large':
            ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.radius, cloud.y, cloud.radius * 0.9, 0, Math.PI * 2);
            ctx.arc(cloud.x - cloud.radius, cloud.y, cloud.radius * 0.8, 0, Math.PI * 2);
            ctx.arc(cloud.x, cloud.y - cloud.radius/2, cloud.radius * 0.7, 0, Math.PI * 2);
            break;
    }
    ctx.fill();
}

function drawMonster(monster) {
    ctx.save();
    if (monster.direction < 0) {
        ctx.scale(-1, 1);
        ctx.drawImage(monsterSprite, 
            -monster.x - monster.width, monster.y, 
            monster.width, monster.height);
    } else {
        ctx.drawImage(monsterSprite, 
            monster.x, monster.y, 
            monster.width, monster.height);
    }
    ctx.restore();
}

function updateMonsters(currentLevel) {
    currentLevel.monsters.forEach((monster, index) => {
        const boundary = currentLevel.boundaries[index];
        monster.x += monster.speed * monster.direction;
        
        if (monster.x <= boundary.x || monster.x >= boundary.x2) {
            monster.direction *= -1;
        }
    });
}

function checkCollisions(currentLevel) {
    currentLevel.blocks.forEach(block => {
        if (player.x < block.x + block.width &&
            player.x + player.width > block.x &&
            player.y < block.y + block.height &&
            player.y + player.height > block.y) {
            
            if (player.velocityY < 0) {
                player.y = block.y + block.height;
                player.velocityY = 0;
            } else if (player.velocityY > 0) {
                player.y = block.y - player.height;
                player.jumping = false;
                player.velocityY = 0;
            }
        }
    });

    currentLevel.coins.forEach(coin => {
        if (!coin.collected &&
            player.x < coin.x + coin.size &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.size &&
            player.y + player.height > coin.y) {
            coin.collected = true;
            player.score += 100;
        }
    });

    currentLevel.monsters.forEach(monster => {
        if (player.x < monster.x + monster.width &&
            player.x + player.width > monster.x &&
            player.y < monster.y + monster.height &&
            player.y + player.height > monster.y) {
            
            if (player.velocityY > 0) {
                player.velocityY = jumpForce;
                player.score += 150;
                monster.y = CANVAS_HEIGHT + 100;
            } else {
                gameState.lives--;
                if (gameState.lives <= 0) {
                    gameState.gameOver = true;
                } else {
                    player.x = 50;
                    player.y = 300;
                }
            }
        }
    });
}

function resetGame() {
    gameState = {
        level: 1,
        scrollOffset: 0,
        gameOver: false,
        lives: 3
    };
    player.x = 50;
    player.y = 300;
    player.score = 0;
}

function gameLoop() {
    if (gameState.gameOver) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.fillText('GAME OVER', CANVAS_WIDTH/2 - 100, CANVAS_HEIGHT/2);
        ctx.font = '24px Arial';
        ctx.fillText('Press ENTER to restart', CANVAS_WIDTH/2 - 100, CANVAS_HEIGHT/2 + 50);
        ctx.fillText(`Final Score: ${player.score}`, CANVAS_WIDTH/2 - 100, CANVAS_HEIGHT/2 + 100);
        return requestAnimationFrame(gameLoop);
    }

    const currentLevel = createLevel(gameState.level);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (player.x > CANVAS_WIDTH / 2) {
        gameState.scrollOffset = -player.x + CANVAS_WIDTH / 2;
    }
    if (gameState.scrollOffset < -(LEVEL_WIDTH - CANVAS_WIDTH)) {
        gameState.scrollOffset = -(LEVEL_WIDTH - CANVAS_WIDTH);
    }
    if (gameState.scrollOffset > 0) {
        gameState.scrollOffset = 0;
    }

    ctx.save();
    ctx.translate(gameState.scrollOffset, 0);

    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(-gameState.scrollOffset, 0, LEVEL_WIDTH, CANVAS_HEIGHT);

    clouds.forEach(cloud => {
        cloud.x += cloud.speed;
        if (cloud.x > LEVEL_WIDTH + cloud.radius * 2) {
            cloud.x = -cloud.radius * 2;
        }
        drawCloud(cloud);
    });

    trees.forEach(tree => drawTree(tree));

    ctx.fillStyle = '#90EE90';
    ctx.fillRect(-gameState.scrollOffset, CANVAS_HEIGHT - GROUND_HEIGHT, LEVEL_WIDTH, GROUND_HEIGHT);

    currentLevel.blocks.forEach(block => {
        ctx.drawImage(blockSprite, block.x, block.y, block.width, block.height);
    });

    currentLevel.coins.forEach(coin => {
        if (!coin.collected) {
            ctx.drawImage(coinSprite, coin.x, coin.y, coin.size, coin.size);
        }
    });

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(currentLevel.endFlag.x, currentLevel.endFlag.y, 
                currentLevel.endFlag.width, currentLevel.endFlag.height);

    updateMonsters(currentLevel);
    currentLevel.monsters.forEach(monster => drawMonster(monster));

    player.velocityY += gravity;
    player.y += player.velocityY;

    if (player.y > CANVAS_HEIGHT - player.height - GROUND_HEIGHT) {
        player.y = CANVAS_HEIGHT - player.height - GROUND_HEIGHT;
        player.jumping = false;
        player.velocityY = 0;
    }

    checkCollisions(currentLevel);

    ctx.save();
    if (player.direction === 'left') {
        ctx.scale(-1, 1);
        ctx.drawImage(
            marioSprite,
            player.frame * player.width, player.jumping ? player.height : 0,
            player.width, player.height,
            -player.x - player.width, player.y,
            player.width, player.height
        );
    } else {
        ctx.drawImage(
            marioSprite,
            player.frame * player.width, player.jumping ? player.height : 0,
            player.width, player.height,
            player.x, player.y,
            player.width, player.height
        );
    }
    ctx.restore();

    ctx.restore();

    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText(`Level: ${gameState.level}`, 20, 30);
    ctx.fillText(`Lives: ${gameState.lives}`, 20, 60);
    ctx.fillText(`Score: ${player.score}`, 20, 90);

    if (player.x > currentLevel.endFlag.x) {
        gameState.level++;
        player.x = 50;
        player.y = 300;
        if (gameState.level > 2) {
            gameState.gameOver = true;
        }
    }

    if (player.y > CANVAS_HEIGHT) {
        gameState.lives--;
        if (gameState.lives <= 0) {
            gameState.gameOver = true;
        } else {
            player.x = 50;
            player.y = 300;
        }
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();