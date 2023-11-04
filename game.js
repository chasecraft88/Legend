const canvasModule = {
  gameContainer: document.getElementById("gameContainer"),
  canvas: document.getElementById("gameCanvas"),
  ctx: null,
};

const canvasBorderWidth = 5; // Width of the canvas border
const canvasBorderHeight = 5; // Height of the canvas border

canvasModule.setupCanvas = () => {
  canvasModule.ctx = canvasModule.canvas.getContext("2d");
  canvasModule.canvas.width = canvasModule.gameContainer.clientWidth;
  canvasModule.canvas.height = canvasModule.gameContainer.clientHeight;
};

canvasModule.setupCanvas();

const playerModule = {
  player: {
    x: 0,
    y: 0,
    radius: 20,
    velocityX: 0,
    accelerationX: 0.1,
  },

  setupPlayer: () => {
    playerModule.player.x = canvasModule.canvas.width / 2;
    playerModule.player.y = canvasModule.canvas.height - 30;
  },

  drawPlayer: () => {
    const player = playerModule.player;
    canvasModule.ctx.beginPath();
    canvasModule.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    canvasModule.ctx.fillStyle = "blue";
    canvasModule.ctx.fill();
    canvasModule.ctx.closePath();
  },

  updatePlayer: () => {
    const player = playerModule.player;

    // Handle player's movement with physics
    player.x += player.velocityX;
    player.velocityX += player.accelerationX;

    // Ensure the player stays within the game field
    if (player.x - player.radius < canvasBorderWidth) {
      player.x = player.radius + canvasBorderWidth;
      player.velocityX = -player.velocityX; // Bounce off the border
    }
    if (player.x + player.radius > canvasModule.canvas.width - canvasBorderWidth) {
      player.x = canvasModule.canvas.width - player.radius - canvasBorderWidth;
      player.velocityX = -player.velocityX; // Bounce off the border
    }
  },
};

playerModule.setupPlayer();

const enemyModule = {
  enemies: [],

  colors: ["red", "green", "blue", "yellow"],

  createEnemy: () => {
    const enemy = {
      x: Math.random() * canvasModule.canvas.width,
      y: Math.random() * canvasModule.canvas.height,
      radius: 15,
      dx: Math.random() * 2 - 1, // Random X-axis velocity
      dy: Math.random() * 2 - 1, // Random Y-axis velocity
      color: enemyModule.colors[Math.floor(Math.random() * enemyModule.colors.length)],
    };

    // Ensure the enemy stays within the canvas boundaries
    if (enemy.x - enemy.radius < canvasBorderWidth) {
      enemy.x = enemy.radius + canvasBorderWidth;
    }
    if (enemy.x + enemy.radius > canvasModule.canvas.width - canvasBorderWidth) {
      enemy.x = canvasModule.canvas.width - enemy.radius - canvasBorderWidth;
    }
    if (enemy.y - enemy.radius < canvasBorderHeight) {
      enemy.y = enemy.radius + canvasBorderHeight;
    }
    if (enemy.y + enemy.radius > canvasModule.canvas.height - canvasBorderHeight) {
      enemy.y = canvasModule.canvas.height - enemy.radius - canvasBorderHeight;
    }

    // Push the enemy object to the array
    enemyModule.enemies.push(enemy);
  },

  drawEnemies: () => {
    enemyModule.enemies.forEach((enemy) => {
      canvasModule.ctx.beginPath();
      canvasModule.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      canvasModule.ctx.fillStyle = enemy.color;
      canvasModule.ctx.fill();
      canvasModule.ctx.closePath();
    });
  },

  updateEnemies: () => {
    enemyModule.enemies.forEach((enemy, index) => {
      if (collisionModule.detectCollision(playerModule.player, enemy)) {
        // Increase player's radius when colliding with an enemy
        playerModule.player.radius += 2;
        enemyModule.enemies.splice(index, 1);
      } else {
        // Update enemy positions with slight random movement
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;

        // Ensure enemies stay within the canvas boundaries
        if (enemy.x - enemy.radius < canvasBorderWidth) {
          enemy.x = enemy.radius + canvasBorderWidth;
          enemy.dx = -enemy.dx; // Bounce off the canvas edge
        }
        if (enemy.x + enemy.radius > canvasModule.canvas.width - canvasBorderWidth) {
          enemy.x = canvasModule.canvas.width - enemy.radius - canvasBorderWidth;
          enemy.dx = -enemy.dx; // Bounce off the canvas edge
        }
        if (enemy.y - enemy.radius < canvasBorderHeight) {
          enemy.y = enemy.radius + canvasBorderHeight;
          enemy.dy = -enemy.dy; // Bounce off the canvas edge
        }
        if (enemy.y + enemy.radius > canvasModule.canvas.height - canvasBorderHeight) {
          enemy.y = canvasModule.canvas.height - enemy.radius - canvasBorderHeight;
          enemy.dy = -enemy.dy; // Bounce off the canvas edge
        }
      }
    });
  },
};

const collisionModule = {
  detectCollision: (obj1, obj2) => {
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.radius + obj2.radius;
  },
};

const gameModule = {
  isGameOver: false,
  winCondition: false,

  // Score variable
  score: 0,

  // Display score on the canvas
  drawScore: () => {
    canvasModule.ctx.font = "24px Arial";
    canvasModule.ctx.fillStyle = "black";
    canvasModule.ctx.fillText(`Score: ${gameModule.score}`, 20, 40);
  },

  updateGame: () => {
    if (!gameModule.isGameOver) {
      canvasModule.ctx.clearRect(0, 0, canvasModule.canvas.width, canvasModule.canvas.height);

      // Draw the game border
      canvasModule.ctx.beginPath();
      canvasModule.ctx.lineWidth = canvasBorderWidth;
      canvasModule.ctx.strokeStyle = "black";
      canvasModule.ctx.rect(
        canvasBorderWidth / 2,
        canvasBorderHeight / 2,
        canvasModule.canvas.width - canvasBorderWidth,
        canvasModule.canvas.height - canvasBorderHeight
      );
      canvasModule.ctx.stroke();
      canvasModule.ctx.closePath();

      playerModule.updatePlayer();
      playerModule.drawPlayer();

      // Generate new enemies
      if (Math.random() < 0.02) {
        enemyModule.createEnemy();
      }

      enemyModule.updateEnemies();
      enemyModule.drawEnemies();

      // Update and draw the score
      gameModule.drawScore();

      // Check for win condition
      if (playerModule.player.radius > enemyModule.biggestEnemy().radius) {
        gameModule.isGameOver = true;
        gameModule.winCondition = true;
        gameModule.gameOver();
      }

      // Continue the game loop
      requestAnimationFrame(gameModule.updateGame);
    } else {
      if (gameModule.winCondition) {
        // Display win message
        canvasModule.ctx.font = "24px Arial";
        canvasModule.ctx.fillStyle = "green";
        canvasModule.ctx.fillText("You Win!", canvasModule.canvas.width / 2 - 60, canvasModule.canvas.height / 2);
      } else {
        gameModule.gameOver();
        // Display game over message
        canvasModule.ctx.font = "20px Arial";
        canvasModule.ctx.fillStyle = "red";
        canvasModule.ctx.fillText("Game Over", canvasModule.canvas.width / 2 - 60, canvasModule.canvas.height / 2);
        canvasModule.ctx.fillText("Click to restart", canvasModule.canvas.width / 2 - 90, canvasModule.canvas.height / 2 + 30);
      }
    }
  },

  startGame: () => {
    gameModule.updateGame();
  },

  gameOver: () => {
    // Handle game over logic

    // Add a restart game event listener
    canvasModule.canvas.addEventListener("click", function (event) {
      if (gameModule.isGameOver) {
        // Reset game variables and restart the game
        playerModule.setupPlayer();
        enemyModule.enemies = [];
        playerModule.player.radius = 20;
        gameModule.isGameOver = false;
        gameModule.winCondition = false;
        gameModule.score = 0; // Reset the score
        gameModule.startGame();
      }
    });
  },
};

gameModule.startGame();
