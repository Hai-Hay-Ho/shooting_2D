const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'assets/background.jpg');
    this.load.image('character', 'assets/character.png');
    this.load.image('run', 'assets/run.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('enemy_walk', 'assets/enemy_walk.png');
    this.load.image('run_shoot', 'assets/run_shoot.png');
    this.load.image('shoot', 'assets/shoot.png');
    this.load.image('shop', 'assets/shop.png');
    this.load.image('coin', 'assets/coin.png');
}

function create() {

    this.isGameOver = false;
    this.startTime = this.time.now;

    this.timeText = this.add.text(400, 20, "00:00", {
        fontSize: "28px",
        fill: "#ffffff",
        fontStyle: "bold"
    }).setOrigin(0.5).setDepth(20);

    // SHOP & COINS
    this.shopIcon = this.add.image(660, 30, 'shop').setScale(0.5).setDepth(20).setInteractive();
    
    this.coinIcon = this.add.image(785, 35, 'coin').setScale(0.7).setDepth(20);
    this.coins = 0;
    this.coinText = this.add.text(720, 35, "0", {
        fontSize: "24px",
        fill: "#ffd700",
        fontStyle: "bold"
    }).setOrigin(0, 0.5).setDepth(20);

    this.bg = this.add.tileSprite(0, 0, 800, 600, 'background').setOrigin(0, 0);

    // PLAYER
    this.player = this.physics.add.sprite(100, 250, 'character');
    this.player.setScale(0.5);
    this.player.setCollideWorldBounds(true);

    this.player.body.setSize(
        this.player.displayWidth * 0.6,
        this.player.displayHeight * 0.8
    );

    this.player.body.setOffset(
        this.player.displayWidth * 0.2,
        this.player.displayHeight * 0.1
    );

    this.player.maxHp = 100;
    this.player.hp = 100;

    // ENEMY GROUP
    this.enemies = this.physics.add.group();
    this.enemyHPBars = this.add.group();

    // Hàm tạo 1 con quái
    this.spawnEnemy = (x, y) => {
        let enemy = this.enemies.create(x, y, 'enemy');
        enemy.setCollideWorldBounds(true);
        enemy.body.setSize(enemy.displayWidth * 0.6, enemy.displayHeight * 0.8);
        enemy.body.setOffset(enemy.displayWidth * 0.2, enemy.displayHeight * 0.1);
        enemy.maxHp = 50;
        enemy.hp = 50;
        
        // Gán riêng 1 graphics cho mỗi con quái
        enemy.hpBar = this.add.graphics();
        this.enemyHPBars.add(enemy.hpBar);
        return enemy;
    };

    // Spawn đợt đầu ngẫu nhiên 1-2 con cách nhau 300ms
    this.spawnCount = 2; 
    this.lastDifficultyUpdate = 0;
    
    let initialCount = Phaser.Math.Between(1, this.spawnCount);
    for (let i = 0; i < initialCount; i++) {
        this.time.delayedCall(i * 300, () => {
            this.spawnEnemy(700 + (i * 40), 310);
        });
    }

    this.playerHPBar = this.add.graphics();

    this.cursors = this.input.keyboard.createCursorKeys();

    this.lastHitTime = 0;
    this.lastShootTime = 0;

    this.physics.add.collider(this.player, this.enemies, hitPlayer, null, this);
}

function update() {
    if (!this.isGameOver) {

        let elapsed = this.time.now - this.startTime;

        let totalSeconds = Math.floor(elapsed / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        let formatted =
            String(minutes).padStart(2, '0') +
            ":" +
            String(seconds).padStart(2, '0');

        this.timeText.setText(formatted);

        // Mỗi 20 giây tăng độ khó
        if (totalSeconds > 0 && totalSeconds % 20 === 0 && totalSeconds !== this.lastDifficultyUpdate) {
            this.lastDifficultyUpdate = totalSeconds;
            this.spawnCount += 1; // Tăng giới hạn số lượng quái tối đa
            
            // Spam thêm một đợt quái ngẫu nhiên 1 đến spawnCount
            let extraSpawn = Phaser.Math.Between(1, this.spawnCount);
            for (let i = 0; i < extraSpawn; i++) {
                this.time.delayedCall(i * 100, () => {
                    this.spawnEnemy(850 + (i * 40), 310);
                });
            }
        }
    }

    if (!this.isGameOver) {
        let enemiesList = this.enemies.getChildren();
        let enemyOnScreen = enemiesList.some(enemy => enemy.active && enemy.x > 0 && enemy.x < 800);
        let isMoving = this.cursors.right.isDown;

        if (isMoving) {
            this.bg.tilePositionX += 5;
            if (Math.floor(this.time.now / 150) % 2 === 0) {
                this.player.setTexture(enemyOnScreen ? 'run_shoot' : 'run');
            } else {
                this.player.setTexture('character');
            }
        } 
        else if (enemyOnScreen) {
            if (Math.floor(this.time.now / 200) % 2 === 0) {
                this.player.setTexture('shoot');
            } else {
                this.player.setTexture('character');
            }
        } 
        else {
            this.player.setTexture('character');
        }

        //tìm con quái đầu tiên đang hiện trên màn hình
        let targetEnemy = enemiesList.find(enemy => enemy.active && enemy.x > 0 && enemy.x < 800);

        if (targetEnemy) {
            let currentTime = this.time.now;
            if (currentTime - this.lastShootTime > 400) { // bắn mỗi 400ms
                targetEnemy.hp -= 10;
                this.lastShootTime = currentTime;

                targetEnemy.setTint(0xff0000);
                this.time.delayedCall(100, () => {
                    targetEnemy.clearTint();
                });

                if (targetEnemy.hp <= 0) {
                    targetEnemy.hp = 0;
                    targetEnemy.hpBar.clear();
                    targetEnemy.setActive(false).setVisible(false);
                    targetEnemy.destroy();

                    // Cộng tiền khi diệt quái
                    this.coins += 10;
                    this.coinText.setText(this.coins);

                    this.time.delayedCall(800, () => { // spam quái mới sau 0.8s
                        this.spawnEnemy(850, 310);
                    });
                }
            }
        }

        // Cập nhật trạng thái cho tất cả quái vật
        enemiesList.forEach(enemy => {
            if (enemy.active) {
                enemy.setVelocityX(-100);

                if (Math.floor(this.time.now / 200) % 2 === 0) {
                    enemy.setTexture('enemy');
                } else {
                    enemy.setTexture('enemy_walk');
                }

                if (enemy.x < -50) {
                    enemy.x = 850;
                }

                // Vẽ thanh máu ngay tại đây cho mỗi con quái
                drawHealthBar(
                    enemy.hpBar,
                    enemy.x - 30,
                    enemy.y - 70,
                    enemy.hp,
                    enemy.maxHp,
                    60
                );
            }
        });
    }

    // thanh máu player
    drawHealthBar(
        this.playerHPBar,
        this.player.x - 30,
        this.player.y - 40,
        this.player.hp,
        this.player.maxHp,
        60
    );
}

function hitPlayer(player, enemy) {

    let currentTime = this.time.now;

    if (currentTime - this.lastHitTime < 1000) return;

    this.lastHitTime = currentTime;

    player.hp -= 40;
    if (player.hp < 0) player.hp = 0;

    player.setTint(0xff0000);

    this.time.delayedCall(200, () => {
        player.clearTint();
    });

    if (player.hp === 0 && !this.isGameOver) {

        this.isGameOver = true;
        this.physics.pause();
        showGameOver.call(this);
    }
}

function showGameOver() {

    let overlay = this.add.rectangle(
        400,
        300,
        800,
        600,
        0x000000
    ).setAlpha(0.6).setDepth(10);

    this.add.text(400, 250, "GAME OVER", {
        fontSize: "48px",
        fill: "#ff0000"
    }).setOrigin(0.5).setDepth(11);

    let restartBtn = this.add.text(400, 320, "CHƠI LẠI", {
        fontSize: "32px",
        fill: "#ffffff",
        backgroundColor: "#000000"
    })
    .setOrigin(0.5)
    .setPadding(12)
    .setDepth(11)
    .setInteractive();

    restartBtn.on('pointerdown', () => {
        this.scene.restart();
    });
}

function drawHealthBar(graphics, x, y, hp, maxHp, width) {

    graphics.clear();

    graphics.fillStyle(0x333333);
    graphics.fillRect(x, y, width, 8);

    if (hp > 0) {
        graphics.fillStyle(0xff0000);
        let healthWidth = (hp / maxHp) * width;
        graphics.fillRect(x, y, healthWidth, 8);
    }
}
