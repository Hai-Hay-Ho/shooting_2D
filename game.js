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
    this.load.image('heart', 'assets/heart.png');
    this.load.image('gun', 'assets/gun.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('move_right', 'assets/right.png');
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

    // Initial Shop Levels
    this.gunLevel = 0;
    this.hpLevel = 0;
    this.attackSpeedLevel = 0;
    this.playerDamage = 10;
    this.fireRateMultiplier = 1.0;
    this.baseUpgradeCost = 40;//giá cơ bản 40 xu
    this.upgradeStep = 5;
    

    this.shopContainer = this.add.container(400, 300).setDepth(30).setVisible(false);
    
    let shopBg = this.add.rectangle(0, 0, 500, 400, 0x000000, 0.8)
        .setStrokeStyle(4, 0xffffff);
    this.shopContainer.add(shopBg);

    let shopTitle = this.add.text(0, -160, "CỬA HÀNG NÂNG CẤP", {
        fontSize: "28px",
        fill: "#ffffff",
        fontStyle: "bold"
    }).setOrigin(0.5);
    this.shopContainer.add(shopTitle);

    // Gun Upgrade (Damage)
    let gunIcon = this.add.image(-130, -80, 'gun').setScale(0.6);
    this.gunLevelText = this.add.text(-80, -80, "Level: 0", { fontSize: "20px", fill: "#ffffff" }).setOrigin(0, 0.5);
    let gunDesc = this.add.text(30, -80, "+2.5 DMG", { fontSize: "16px", fill: "#00ff00" }).setOrigin(0, 0.5);
    let gunBtn = this.add.text(140, -80, "40 Xu", {
        fontSize: "20px",
        fill: "#ffffff",
        backgroundColor: "#d4af37",
        padding: { x: 10, y: 5 }
    }).setOrigin(0, 0.5).setInteractive();
    this.shopContainer.add([gunIcon, this.gunLevelText, gunDesc, gunBtn]);

    // HP Upgrade
    let hpIcon = this.add.image(-130, 0, 'heart').setScale(0.7);
    this.hpLevelText = this.add.text(-80, 0, "Level: 0", { fontSize: "20px", fill: "#ffffff" }).setOrigin(0, 0.5);
    let hpDesc = this.add.text(30, 0, "+25 HP", { fontSize: "16px", fill: "#00ff00" }).setOrigin(0, 0.5);
    let hpBtn = this.add.text(140, 0, "40 Xu", {
        fontSize: "20px",
        fill: "#ffffff",
        backgroundColor: "#d4af37",
        padding: { x: 10, y: 5 }
    }).setOrigin(0, 0.5).setInteractive();
    this.shopContainer.add([hpIcon, this.hpLevelText, hpDesc, hpBtn]);

    // Attack Speed Upgrade
    let spdIcon = this.add.image(-130, 80, 'bullet').setScale(0.06);
    this.spdLevelText = this.add.text(-80, 80, "Level: 0", { fontSize: "20px", fill: "#ffffff" }).setOrigin(0, 0.5);
    let spdDesc = this.add.text(30, 80, "+0.025 Spd", { fontSize: "16px", fill: "#00ff00" }).setOrigin(0, 0.5);
    let spdBtn = this.add.text(140, 80, "40 Xu", {
        fontSize: "20px",
        fill: "#ffffff",
        backgroundColor: "#d4af37",
        padding: { x: 10, y: 5 }
    }).setOrigin(0, 0.5).setInteractive();
    this.shopContainer.add([spdIcon, this.spdLevelText, spdDesc, spdBtn]);

    // Close Button
    let closeBtn = this.add.text(180, -175, "X", {
        fontSize: "24px",
        fill: "#ff0000",
        fontStyle: "bold"
    }).setInteractive();
    closeBtn.on('pointerdown', () => this.shopContainer.setVisible(false));
    this.shopContainer.add(closeBtn);

    this.shopIcon.on('pointerdown', () => {
        this.shopContainer.setVisible(!this.shopContainer.visible);
    });

    gunBtn.on('pointerdown', () => {
        let currentCost = this.baseUpgradeCost + (this.gunLevel * this.upgradeStep);
        if (this.coins >= currentCost) {
            this.coins -= currentCost;
            this.gunLevel++;
            this.playerDamage += 2.5;
            this.coinText.setText(this.coins);
            this.gunLevelText.setText("Level: " + this.gunLevel);
            
            let nextCost = this.baseUpgradeCost + (this.gunLevel * this.upgradeStep);
            gunBtn.setText(nextCost + " Xu");

            gunBtn.setBackgroundColor('#00ff00');
            this.time.delayedCall(200, () => gunBtn.setBackgroundColor('#d4af37'));
        } else {
            gunBtn.setBackgroundColor('#ff0000');
            this.time.delayedCall(200, () => gunBtn.setBackgroundColor('#d4af37'));
        }
    });

    hpBtn.on('pointerdown', () => {
        let currentCost = this.baseUpgradeCost + (this.hpLevel * this.upgradeStep);
        if (this.coins >= currentCost) {
            this.coins -= currentCost;
            this.hpLevel++;
            this.player.maxHp += 25;
            this.player.hp += 25; // Hồi máu khi nâng cấp
            this.coinText.setText(this.coins);
            this.hpLevelText.setText("Level: " + this.hpLevel);

            let nextCost = this.baseUpgradeCost + (this.hpLevel * this.upgradeStep);
            hpBtn.setText(nextCost + " Xu");

            hpBtn.setBackgroundColor('#00ff00');
            this.time.delayedCall(200, () => hpBtn.setBackgroundColor('#d4af37'));
        } else {
            hpBtn.setBackgroundColor('#ff0000');
            this.time.delayedCall(200, () => hpBtn.setBackgroundColor('#d4af37'));
        }
    });

    spdBtn.on('pointerdown', () => {
        let currentCost = this.baseUpgradeCost + (this.attackSpeedLevel * this.upgradeStep);
        if (this.coins >= currentCost) {
            this.coins -= currentCost;
            this.attackSpeedLevel++;
            this.fireRateMultiplier += 0.025;
            this.coinText.setText(this.coins);
            this.spdLevelText.setText("Level: " + this.attackSpeedLevel);

            let nextCost = this.baseUpgradeCost + (this.attackSpeedLevel * this.upgradeStep);
            spdBtn.setText(nextCost + " Xu");

            spdBtn.setBackgroundColor('#00ff00');
            this.time.delayedCall(200, () => spdBtn.setBackgroundColor('#d4af37'));
        } else {
            spdBtn.setBackgroundColor('#ff0000');
            this.time.delayedCall(200, () => spdBtn.setBackgroundColor('#d4af37'));
        }
    });

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

    this.isRightDown = false;

    // Tạo một vùng nền cho nút để dễ thấy hơn (Nút Right ở bên phải)
    this.rightBtnBg = this.add.rectangle(100, 520, 80, 80, 0x000000, 0.4)
        .setInteractive()
        .setDepth(100)
        .setScrollFactor(0);

    this.rightBtn = this.add.image(100, 520, 'move_right')
        .setScale(1.2)
        .setDepth(101)
        .setScrollFactor(0)
        .setAlpha(0.8);

    // Xử lý sự kiện cho nút
    this.rightBtnBg.on('pointerdown', () => {
        this.isRightDown = true;
        this.rightBtn.setAlpha(1);
        this.rightBtnBg.setAlpha(0.7);
    });

    const release = () => {
        this.isRightDown = false;
        this.rightBtn.setAlpha(0.8);
        this.rightBtnBg.setAlpha(0.4);
    };

    this.rightBtnBg.on('pointerup', release);
    this.rightBtnBg.on('pointerout', release);
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
                this.time.delayedCall(i * 400, () => {//mỗi con quái spam cách nhau 0.4s
                    this.spawnEnemy(850 + (i * 40), 310);
                });
            }
        }
    }

    if (!this.isGameOver) {
        let enemiesList = this.enemies.getChildren();
        move.call(this);

        //logic nhắm bắn và gây sát thương
        //tìm con quái đầu tiên đang hiện trên màn hình
        let targetEnemy = enemiesList.find(enemy => enemy.active && enemy.x > 0 && enemy.x < 800);

        if (targetEnemy) {
            let currentTime = this.time.now;
            // Bắn nhanh hơn dựa trên fireRateMultiplier
            let currentShootDelay = 400 / this.fireRateMultiplier;
            
            if (currentTime - this.lastShootTime > currentShootDelay) { 
                targetEnemy.hp -= this.playerDamage;
                this.lastShootTime = currentTime;

                targetEnemy.setTint(0xff0000);
                this.time.delayedCall(100, () => {
                    if (targetEnemy.active) targetEnemy.clearTint();
                });

                if (targetEnemy.hp <= 0) {
                    targetEnemy.hp = 0;
                    if (targetEnemy.hpBar) targetEnemy.hpBar.clear();
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

function move() {
    if (this.isGameOver) return;

    let enemiesList = this.enemies.getChildren();
    let enemyOnScreen = enemiesList.some(enemy => enemy.active && enemy.x > 0 && enemy.x < 800);
    
    let isMovingRight = this.cursors.right.isDown || this.isRightDown;

    if (isMovingRight) {
        this.bg.tilePositionX += 5;
        this.player.setFlipX(false);
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

    // Cập nhật trạng thái cho tất cả quái vật
    enemiesList.forEach(enemy => {
        if (enemy.active) {
            let speed = isMovingRight ? -250 : -100;
            
            enemy.setVelocityX(speed);

            if (Math.floor(this.time.now / 200) % 2 === 0) {
                enemy.setTexture('enemy');
            } else {
                enemy.setTexture('enemy_walk');
            }

            if (enemy.x < -100) enemy.x = 900;
            if (enemy.x > 900) enemy.x = -100;

            // Vẽ thanh máu cho mỗi con quái
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
