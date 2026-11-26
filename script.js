
// ==========================================
// LOST IN DREAMS
// CAPITULO 1 - O JARDIM ESQUECIDO
// ==========================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const $ = (id) => document.getElementById(id);

const W = canvas.width;
const H = canvas.height;
const TILE = 40;

let gameStarted = false;
let gameState = "exploration";
let worldHorror = false;
let memories = 0;
let cameraX = 0;
let cameraY = 0;
let frame = 0;

const keys = {};

const world = {
    width: 40,
    height: 22,
    name: "Jardim das Flores"
};

// ==========================================
// PERSONAGENS
// ==========================================

const player = {
    x: 100,
    y: 150,
    w: 24,
    h: 30,
    speed: 3,
    color: "#f4e8ef",
    direction: "down",
    emotion: "normal",
    moving: false
};

const party = [
    {
        name: "NICO",
        hp: 100,
        maxHp: 100,
        attack: 17,
        emotion: "normal"
    },
    {
        name: "LUNA",
        hp: 80,
        maxHp: 80,
        attack: 20,
        emotion: "normal"
    },
    {
        name: "KAI",
        hp: 90,
        maxHp: 90,
        attack: 23,
        emotion: "normal"
    }
];

// ==========================================
// MAPA
// ==========================================

// 0 = grama
// 1 = parede
// 2 = flores
// 3 = água
// 4 = caminho

const map = [];

for (let y = 0; y < world.height; y++) {
    const row = [];

    for (let x = 0; x < world.width; x++) {
        if (
            x === 0 ||
            y === 0 ||
            x === world.width - 1 ||
            y === world.height - 1
        ) {
            row.push(1);
        } else if (
            (x === 8 && y > 3 && y < 17) ||
            (x === 17 && y > 2 && y < 15) ||
            (x === 27 && y > 5 && y < 18)
        ) {
            row.push(1);
        } else if (
            (x > 3 && x < 7 && y > 4 && y < 8) ||
            (x > 11 && x < 15 && y > 12 && y < 17)
        ) {
            row.push(3);
        } else if ((x + y) % 7 === 0) {
            row.push(2);
        } else {
            row.push(0);
        }
    }

    map.push(row);
}

// Caminhos para atravessar o mapa
for (let x = 1; x < world.width - 1; x++) {
    map[10][x] = 4;
}

for (let y = 1; y < world.height - 1; y++) {
    map[y][20] = 4;
}

// ==========================================
// OBJETOS DO MAPA
// ==========================================

const objects = [
    {
        id: "luna",
        x: 250,
        y: 390,
        name: "Luna",
        type: "npc",
        active: true
    },
    {
        id: "kai",
        x: 560,
        y: 390,
        name: "Kai",
        type: "npc",
        active: true
    },
    {
        id: "memory1",
        x: 440,
        y: 220,
        name: "Fragmento de memória",
        type: "memory",
        active: true
    },
    {
        id: "memory2",
        x: 850,
        y: 380,
        name: "Fragmento de memória",
        type: "memory",
        active: true
    },
    {
        id: "memory3",
        x: 1320,
        y: 180,
        name: "Fragmento de memória",
        type: "memory",
        active: true
    },
    {
        id: "enemy1",
        x: 720,
        y: 220,
        name: "Sombra Pequena",
        type: "enemy",
        active: true
    },
    {
        id: "enemy2",
        x: 1130,
        y: 390,
        name: "Flor Perdida",
        type: "enemy",
        active: true
    },
    {
        id: "portal",
        x: 1510,
        y: 390,
        name: "Portão do Jardim",
        type: "portal",
        active: true
    }
];

// ==========================================
// DESENHO DO MAPA
// ==========================================

function drawMap() {
    for (let y = 0; y < world.height; y++) {
        for (let x = 0; x < world.width; x++) {
            const tile = map[y][x];

            const px = x * TILE - cameraX;
            const py = y * TILE - cameraY;

            if (px < -TILE || px > W || py < -TILE || py > H) {
                continue;
            }

            if (tile === 0) {
                ctx.fillStyle = worldHorror ? "#25202a" : "#69a96d";
            }

            if (tile === 1) {
                ctx.fillStyle = worldHorror ? "#17121b" : "#347c50";
            }

            if (tile === 2) {
                ctx.fillStyle = worldHorror ? "#49303d" : "#78b979";
            }

            if (tile === 3) {
                ctx.fillStyle = worldHorror ? "#201b32" : "#60b6d4";
            }

            if (tile === 4) {
                ctx.fillStyle = worldHorror ? "#46323a" : "#b8a477";
            }

            ctx.fillRect(px, py, TILE, TILE);

            // Textura pixelada
            if (tile === 0 || tile === 4) {
                ctx.fillStyle = worldHorror ? "#ffffff08" : "#ffffff12";
                ctx.fillRect(px + 7, py + 8, 5, 4);
                ctx.fillRect(px + 25, py + 26, 4, 4);
            }

            // Flores
            if (tile === 2) {
                ctx.fillStyle = worldHorror ? "#a34b68" : "#f5a6d6";
                ctx.fillRect(px + 12, py + 10, 8, 8);
                ctx.fillStyle = "#f8dc89";
                ctx.fillRect(px + 14, py + 12, 4, 4);
            }

            // Água
            if (tile === 3) {
                ctx.fillStyle = "#ffffff20";
                ctx.fillRect(px + 5, py + 12, 20, 3);
            }
        }
    }
}

// ==========================================
// DESENHO DOS PERSONAGENS
// ==========================================

function drawCharacter(x, y, color, direction, isPlayer = false) {
    const px = Math.round(x - cameraX);
    const py = Math.round(y - cameraY);

    // Sombra
    ctx.fillStyle = "#00000035";
    ctx.fillRect(px + 2, py + 27, 23, 5);

    // Cabelo
    ctx.fillStyle = isPlayer ? "#292438" : "#3b2944";
    ctx.fillRect(px + 3, py, 19, 8);

    // Cabeça
    ctx.fillStyle = color;
    ctx.fillRect(px + 5, py + 5, 15, 13);

    // Corpo
    ctx.fillStyle = isPlayer ? "#aaa3d7" : "#e7a9d0";
    ctx.fillRect(px + 3, py + 18, 19, 11);

    // Pernas
    ctx.fillStyle = "#292438";
    ctx.fillRect(px + 5, py + 28, 6, 5);
    ctx.fillRect(px + 15, py + 28, 6, 5);

    // Olhos
    ctx.fillStyle = "#282238";

    if (direction !== "up") {
        ctx.fillRect(px + 8, py + 10, 2, 2);
        ctx.fillRect(px + 15, py + 10, 2, 2);
    }

    // Animação simples de movimento
    if (isPlayer && player.moving) {
        const offset = Math.sin(frame / 4) * 2;
        ctx.fillStyle = "#292438";
        ctx.fillRect(px + 5, py + 28 + offset, 6, 5);
        ctx.fillRect(px + 15, py + 28 - offset, 6, 5);
    }
}

function drawPlayer() {
    drawCharacter(
        player.x,
        player.y,
        "#f4e8ef",
        player.direction,
        true
    );
}

// ==========================================
// OBJETOS E NPCS
// ==========================================

function drawObjects() {
    for (const obj of objects) {
        if (!obj.active) continue;

        const x = obj.x - cameraX;
        const y = obj.y - cameraY;

        if (obj.type === "npc") {
            if (obj.id === "luna") {
                drawCharacter(obj.x, obj.y, "#f1c2a0", "down");
            } else {
                drawCharacter(obj.x, obj.y, "#b5c5ec", "down");
            }
        }

        if (obj.type === "memory") {
            ctx.fillStyle = "#fff2a1";
            ctx.fillRect(x + 7, y + 5, 15, 15);

            ctx.fillStyle = "#ffffff55";
            ctx.fillRect(x + 1, y - 1, 27, 27);
        }

        if (obj.type === "enemy") {
            ctx.fillStyle = worldHorror ? "#a42b4a" : "#55416f";
            ctx.fillRect(x + 3, y + 8, 28, 25);

            ctx.fillStyle = "#f5a4cf";
            ctx.fillRect(x + 8, y + 15, 5, 4);
            ctx.fillRect(x + 21, y + 15, 5, 4);
        }

        if (obj.type === "portal") {
            ctx.fillStyle = worldHorror ? "#9b283e" : "#9d78cf";
            ctx.fillRect(x, y - 45, 55, 80);

            ctx.fillStyle = worldHorror ? "#e36b81" : "#d8baff";
            ctx.fillRect(x + 8, y - 37, 39, 70);

            ctx.fillStyle = worldHorror ? "#21101a" : "#514078";
            ctx.fillRect(x + 14, y - 30, 27, 62);
        }
    }
}

// ==========================================
// MOVIMENTAÇÃO E COLISÃO
// ==========================================

function isBlocked(x, y) {
    const left = Math.floor(x / TILE);
    const right = Math.floor((x + player.w - 1) / TILE);
    const top = Math.floor(y / TILE);
    const bottom = Math.floor((y + player.h - 1) / TILE);

    for (let ty = top; ty <= bottom; ty++) {
        for (let tx = left; tx <= right; tx++) {
            if (
                ty < 0 || tx < 0 ||
                ty >= world.height || tx >= world.width
            ) {
                return true;
            }

            if (map[ty][tx] === 1 || map[ty][tx] === 3) {
                return true;
            }
        }
    }

    return false;
}

function updatePlayer() {
    if (gameState !== "exploration") return;

    let dx = 0;
    let dy = 0;

    if (keys["ArrowLeft"] || keys["KeyA"]) {
        dx = -player.speed;
        player.direction = "left";
    }

    if (keys["ArrowRight"] || keys["KeyD"]) {
        dx = player.speed;
        player.direction = "right";
    }

    if (keys["ArrowUp"] || keys["KeyW"]) {
        dy = -player.speed;
        player.direction = "up";
    }

    if (keys["ArrowDown"] || keys["KeyS"]) {
        dy = player.speed;
        player.direction = "down";
    }

    player.moving = dx !== 0 || dy !== 0;

    // Movimento horizontal
    if (!isBlocked(player.x + dx, player.y)) {
        player.x += dx;
    }

    // Movimento vertical
    if (!isBlocked(player.x, player.y + dy)) {
        player.y += dy;
    }

    player.x = Math.max(TILE, Math.min(
        world.width * TILE - TILE - player.w,
        player.x
    ));

    player.y = Math.max(TILE, Math.min(
        world.height * TILE - TILE - player.h,
        player.y
    ));
}

// ==========================================
// CÂMERA
// ==========================================

function updateCamera() {
    cameraX = player.x - W / 2;
    cameraY = player.y - H / 2;

    cameraX = Math.max(
        0,
        Math.min(world.width * TILE - W, cameraX)
    );

    cameraY = Math.max(
        0,
        Math.min(world.height * TILE - H, cameraY)
    );
}

// ==========================================
// SISTEMA DE DIÁLOGOS
// ==========================================

let dialogueLines = [];
let dialogueIndex = 0;
let dialogueCallback = null;

function startDialogue(lines, callback = null) {
    gameState = "dialogue";
    dialogueLines = lines;
    dialogueIndex = 0;
    dialogueCallback = callback;

    $("dialogue").classList.remove("hidden");
    showDialogueLine();
}

function showDialogueLine() {
    const line = dialogueLines[dialogueIndex];

    $("dialogue-name").textContent = line.name;
    $("dialogue-text").textContent = line.text;
}

function nextDialogue() {
    dialogueIndex++;

    if (dialogueIndex >= dialogueLines.length) {
        $("dialogue").classList.add("hidden");
        gameState = "exploration";

        const callback = dialogueCallback;
        dialogueCallback = null;

        if (callback) callback();
    } else {
        showDialogueLine();
    }
}

$("dialogue-next").addEventListener("click", nextDialogue);

// ==========================================
// INTERAÇÃO COM OBJETOS
// ==========================================

function interact() {
    if (gameState !== "exploration") return;

    let closest = null;
    let minDistance = 65;

    for (const obj of objects) {
        if (!obj.active) continue;

        const distance = Math.hypot(
            player.x - obj.x,
            player.y - obj.y
        );

        if (distance < minDistance) {
            minDistance = distance;
            closest = obj;
        }
    }

    if (!closest) return;

    // LUNA
    if (closest.id === "luna") {
        closest.active = false;

        startDialogue([
            {
                name: "LUNA",
                text: "Ei! Você finalmente acordou!"
            },
            {
                name: "NICO",
                text: "Onde estamos? Eu não lembro de ter vindo para cá."
            },
            {
                name: "LUNA",
                text: "Estamos no Reino dos Sonhos! Pelo menos... acho que estamos."
            },
            {
                name: "LUNA",
                text: "Precisamos encontrar três fragmentos de memória. Você vem comigo?"
            },
            {
                name: "NICO",
                text: "Acho que não tenho muita escolha..."
            }
        ]);

        return;
    }

    // KAI
    if (closest.id === "kai") {
        closest.active = false;

        startDialogue([
            {
                name: "KAI",
                text: "Então você é o Nico."
            },
            {
                name: "NICO",
                text: "Como sabe meu nome?"
            },
            {
                name: "KAI",
                text: "Não sei. Apenas... senti que deveria saber."
            },
            {
                name: "LUNA",
                text: "Ele fala pouco, mas é nosso amigo."
            }
        ]);

        return;
    }

    // MEMÓRIAS
    if (closest.type === "memory") {
        closest.active = false;
        memories++;

        $("memory-count").textContent = "MEMÓRIAS: " + memories + "/3";

        startDialogue([
            {
                name: "NICO",
                text: "Encontrei um fragmento de memória..."
            },
            {
                name: "???",
                text: "Você realmente deseja lembrar?"
            }
        ], () => {
            if (memories === 3) {
                startDialogue([
                    {
                        name: "LUNA",
                        text: "Conseguimos! Os três fragmentos estão conosco."
                    },
                    {
                        name: "KAI",
                        text: "Então podemos abrir o portão."
                    }
                ]);
            }
        });

        return;
    }

    // INIMIGOS
    if (closest.type === "enemy") {
        closest.active = false;

        const enemyName = closest.id === "enemy1"
            ? "Sombra Pequena"
            : "Flor Perdida";

        startBattle(enemyName);

        return;
    }

    // PORTAL
    if (closest.id === "portal") {
        if (memories < 3) {
            startDialogue([
                {
                    name: "NICO",
                    text: "O portão está fechado..."
                },
                {
                    name: "KAI",
                    text: "Ainda faltam fragmentos de memória."
                }
            ]);
        } else {
            finishChapter();
        }
    }
}

// ==========================================
// EMOÇÕES
// ==========================================

// feliz > triste
// triste > bravo
// bravo > feliz

const emotionNames = {
    normal: "NORMAL",
    happy: "FELIZ",
    sad: "TRISTE",
    angry: "BRAVO"
};

function emotionAdvantage(attacker, defender) {
    const advantages = {
        happy: "sad",
        sad: "angry",
        angry: "happy"
    };

    return advantages[attacker] === defender;
}

function applyEmotion(member, emotion) {
    member.emotion = emotion;
}

// ==========================================
// SISTEMA DE BATALHA
// ==========================================

let enemy = null;
let battleAction = "attack";
let battleMessage = "";

function startBattle(name) {
    gameState = "battle";

    const isFlower = name === "Flor Perdida";

    enemy = {
        name,
        hp: isFlower ? 115 : 75,
        maxHp: isFlower ? 115 : 75,
        attack: isFlower ? 13 : 10,
        emotion: isFlower ? "sad" : "angry",
        icon: isFlower ? "✿" : "☻"
    };

    $("battle-screen").classList.remove("hidden");
    $("battle-actions").classList.remove("hidden");
    $("emotion-actions").classList.add("hidden");
    $("battle-continue").classList.add("hidden");

    battleMessage = name + " apareceu!";
    refreshBattle();
}

function refreshBattle() {
    if (!enemy) return;

    $("enemy-name").textContent = enemy.name;
    $("enemy-sprite").textContent = enemy.icon;

    $("enemy-hp").textContent =
        enemy.hp + " / " + enemy.maxHp + " HP";

    $("enemy-health").style.width =
        (enemy.hp / enemy.maxHp * 100) + "%";

    $("enemy-emotion").textContent =
        "EMOÇÃO: " + emotionNames[enemy.emotion];

    $("battle-message").textContent = battleMessage;

    party.forEach(member => {
        $(member.name.toLowerCase() + "-hp").textContent =
            member.hp + "/" + member.maxHp + " HP";

        $(member.name.toLowerCase() + "-emotion").textContent =
            emotionNames[member.emotion];
    });
}

// Botões de batalha
$("battle-actions").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button || gameState !== "battle") return;

    const action = button.dataset.action;

    if (action === "attack") {
        performAttack();
    }

    if (action === "emotion") {
        $("battle-actions").classList.add("hidden");
        $("emotion-actions").classList.remove("hidden");
        battleMessage = "Escolha uma emoção.";
        refreshBattle();
    }

    if (action === "item") {
        useItem();
    }

    if (action === "flee") {
        battleMessage = "Você não pode fugir desta batalha!";
        refreshBattle();
    }
});

// ==========================================
// ATAQUE
// ==========================================

function performAttack() {
    if (gameState !== "battle") return;

    const attacker = party[0];

    let damage = attacker.attack;

    if (emotionAdvantage(attacker.emotion, enemy.emotion)) {
        damage *= 1.5;
        battleMessage = "Vantagem emocional! Ataque poderoso!";
    } else {
        battleMessage = attacker.name + " atacou!";
    }

    damage = Math.round(damage);

    enemy.hp = Math.max(0, enemy.hp - damage);

    if (enemy.hp <= 0) {
        finishBattle(true);
        return;
    }

    enemyTurn();
}

// ==========================================
// SISTEMA DE EMOÇÕES
// ==========================================

$("emotion-actions").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-emotion]");

    if (!button || gameState !== "battle") return;

    const emotion = button.dataset.emotion;

    party[0].emotion = emotion;

    $("emotion-actions").classList.add("hidden");
    $("battle-actions").classList.remove("hidden");

    battleMessage =
        "NICO agora está " + emotionNames[emotion] + "!";

    enemyTurn();
});

// ==========================================
// ITENS
// ==========================================

let potions = 3;

function useItem() {
    const member = party.find(
        character => character.hp < character.maxHp
    );

    if (potions <= 0) {
        battleMessage = "Você não possui mais itens!";
        refreshBattle();
        return;
    }

    if (!member) {
        battleMessage = "Todos estão com HP completo!";
        refreshBattle();
        return;
    }

    const healing = 35;

    member.hp = Math.min(
        member.maxHp,
        member.hp + healing
    );

    potions--;

    battleMessage =
        member.name + " recuperou " + healing + " HP!";

    enemyTurn();
}

// ==========================================
// TURNO DO INIMIGO
// ==========================================

function enemyTurn() {
    if (!enemy || enemy.hp <= 0) return;

    const aliveMembers = party.filter(member => member.hp > 0);

    if (aliveMembers.length === 0) {
        finishBattle(false);
        return;
    }

    const target = aliveMembers[
        Math.floor(Math.random() * aliveMembers.length)
    ];

    let damage = enemy.attack;

    if (emotionAdvantage(enemy.emotion, target.emotion)) {
        damage = Math.round(damage * 1.5);
    }

    target.hp = Math.max(0, target.hp - damage);

    battleMessage =
        enemy.name + " atacou " +
        target.name + " causando " + damage + " de dano!";

    refreshBattle();

    if (party.every(member => member.hp <= 0)) {
        finishBattle(false);
    }
}

// ==========================================
// FINAL DA BATALHA
// ==========================================

function finishBattle(won) {
    if (won) {
        battleMessage = "Você venceu a batalha!";
    } else {
        battleMessage = "Seu grupo foi derrotado...";
    }

    $("battle-actions").classList.add("hidden");
    $("emotion-actions").classList.add("hidden");
    $("battle-continue").classList.remove("hidden");

    refreshBattle();

    $("battle-continue").onclick = () => {
        $("battle-screen").classList.add("hidden");
        $("battle-continue").classList.add("hidden");

        if (won) {
            gameState = "exploration";
        } else {
            finishChapter(false);
        }
    };
}

// ==========================================
// MUDANÇA PARA O MUNDO DE TERROR
// ==========================================

function activateHorror() {
    if (worldHorror) return;

    worldHorror = true;

    document.body.classList.add("horror");

    $("world-label").textContent = "MUNDO ESQUECIDO";
    $("location").textContent = "Jardim das Sombras";

    startDialogue([
        {
            name: "LUNA",
            text: "Espera... por que as flores estão ficando escuras?"
        },
        {
            name: "NICO",
            text: "O céu também está mudando..."
        },
        {
            name: "KAI",
            text: "Não olhem para trás."
        },
        {
            name: "???",
            text: "Vocês não deveriam ter acordado."
        }
    ]);
}

// ==========================================
// FINAL DO CAPÍTULO
// ==========================================

function finishChapter(success = true) {
    gameState = "ending";

    $("ending-screen").classList.remove("hidden");

    if (success) {
        $("ending-description").textContent =
            "Os três fragmentos foram reunidos. Mas uma voz desconhecida parece conhecer Nico. A história continuará...";
    } else {
        $("ending-description").textContent =
            "A jornada terminou antes que o mistério fosse resolvido.";
    }
}

// ==========================================
// ATUALIZAÇÃO DO MUNDO
// ==========================================

function updateWorld() {
    if (gameState !== "exploration") return;

    frame++;

    updatePlayer();
    updateCamera();

    // O mundo fica sombrio depois da segunda memória
    if (memories >= 2 && !worldHorror) {
        activateHorror();
    }
}

// ==========================================
// EFEITOS VISUAIS
// ==========================================

function drawAtmosphere() {
    if (!worldHorror) return;

    // Escurecimento
    ctx.fillStyle = "rgba(20, 4, 20, 0.40)";
    ctx.fillRect(0, 0, W, H);

    // Névoa
    for (let i = 0; i < 7; i++) {
        const x = (i * 150 + frame * 0.3) % (W + 100);

        ctx.fillStyle = "rgba(190, 80, 120, 0.045)";
        ctx.fillRect(x - 50, 300, 130, 90);
    }

    // Vinheta escura
    const gradient = ctx.createRadialGradient(
        W / 2, H / 2, 100,
        W / 2, H / 2, 450
    );

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.65)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
}

// ==========================================
// RENDERIZAÇÃO
// ==========================================

function draw() {
    ctx.clearRect(0, 0, W, H);

    drawMap();
    drawObjects();
    drawPlayer();
    drawAtmosphere();

    if (gameState === "exploration") {
        // Indicador de interação
        for (const obj of objects) {
            if (!obj.active) continue;

            const distance = Math.hypot(
                player.x - obj.x,
                player.y - obj.y
            );

            if (distance < 65) {
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 18px monospace";
                ctx.fillText(
                    "[ E ]",
                    obj.x - cameraX,
                    obj.y - cameraY - 15
                );
            }
        }
    }
}

// ==========================================
// CONTROLES
// ==========================================

document.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)
    ) {
        event.preventDefault();
    }

    if (event.code === "KeyE" && !event.repeat) {
        if (gameState === "exploration") {
            interact();
        } else if (gameState === "dialogue") {
            nextDialogue();
        }
    }

    if (event.code === "Escape") {
        // Não interrompe batalhas ou diálogos.
    }
});

document.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

// ==========================================
// INICIAR JOGO
// ==========================================

function startGame() {
    player.x = 100;
    player.y = 150;
    player.direction = "down";
    player.emotion = "normal";

    party.forEach(member => {
        member.hp = member.maxHp;
        member.emotion = "normal";
    });

    memories = 0;
    potions = 3;
    worldHorror = false;
    cameraX = 0;
    cameraY = 0;

    objects.forEach(obj => {
        obj.active = true;
    });

    gameStarted = true;
    gameState = "exploration";

    document.body.classList.remove("horror");

    $("memory-count").textContent = "MEMÓRIAS: 0/3";
    $("location").textContent = "Jardim das Flores";
    $("world-label").textContent = "REINO DOS SONHOS";

    $("start-screen").classList.add("hidden");
    $("ending-screen").classList.add("hidden");
    $("dialogue").classList.add("hidden");
    $("battle-screen").classList.add("hidden");

    $("battle-actions").classList.remove("hidden");
    $("emotion-actions").classList.add("hidden");
    $("battle-continue").classList.add("hidden");

    startDialogue([
        {
            name: "NARRADOR",
            text: "Tudo estava silencioso."
        },
        {
            name: "NARRADOR",
            text: "Um lugar colorido, cheio de flores e lembranças."
        },
        {
            name: "NICO",
            text: "Onde... onde estou?"
        },
        {
            name: "NARRADOR",
            text: "Você acordou no Jardim das Flores."
        }
    ]);
}

$("start-button").addEventListener("click", startGame);

$("restart-button").addEventListener("click", () => {
    startGame();
});

// ==========================================
// LOOP DO JOGO
// ==========================================

function gameLoop() {
    if (gameStarted) {
        updateWorld();
        draw();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
