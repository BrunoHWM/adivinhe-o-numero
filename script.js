/* ========================================
   ADIVINHE O NÚMERO
======================================== */


/* ========================================
   CONFIGURAÇÕES
======================================== */

const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const INITIAL_POINTS = 1000;


/* ========================================
   ELEMENTOS
======================================== */

const playerNameInput =
    document.getElementById("playerName");

const guessInput =
    document.getElementById("guess");

const guessButton =
    document.getElementById("guessButton");

const message =
    document.getElementById("message");

const attemptsElement =
    document.getElementById("attempts");

const possiblePointsElement =
    document.getElementById("possiblePoints");

const bestScoreElement =
    document.getElementById("bestScore");

const newGameButton =
    document.getElementById("newGameButton");

const rankingList =
    document.getElementById("rankingList");

const roundNumberElement =
    document.getElementById("roundNumber");


/* ========================================
   VARIÁVEIS
======================================== */

let secretNumber;

let attempts = 0;

let round = 1;

let gameFinished = false;


/* ========================================
   RANKING
======================================== */

let ranking =
    JSON.parse(
        localStorage.getItem("numberGameRanking")
    ) || [];


/* ========================================
   GERAR NÚMERO
======================================== */

function generateRandomNumber() {

    return Math.floor(
        Math.random() *
        (MAX_NUMBER - MIN_NUMBER + 1)
    ) + MIN_NUMBER;

}


/* ========================================
   INICIAR JOGO
======================================== */

function startGame() {

    secretNumber =
        generateRandomNumber();

    attempts = 0;

    gameFinished = false;

    guessInput.disabled = false;

    guessButton.disabled = false;

    newGameButton.hidden = true;

    attemptsElement.textContent = "0";

    possiblePointsElement.textContent =
        INITIAL_POINTS;

    roundNumberElement.textContent =
        round;

    showMessage(
        "Pronto para começar?",
        "Digite um palpite entre 1 e 100.",
        "💡"
    );

    guessInput.value = "";

    guessInput.focus();

    updateBestScore();
}


/* ========================================
   FAZER PALPITE
======================================== */

function makeGuess() {

    if (gameFinished) {
        return;
    }


    const playerName =
        playerNameInput.value.trim();


    if (!playerName) {

        showMessage(
            "Digite seu nome!",
            "Precisamos saber quem está jogando.",
            "👤",
            "warning"
        );

        playerNameInput.focus();

        return;
    }


    const guess =
        Number(guessInput.value);


    if (
        !guess ||
        guess < MIN_NUMBER ||
        guess > MAX_NUMBER
    ) {

        showMessage(
            "Número inválido!",
            "Digite um número entre 1 e 100.",
            "⚠️",
            "warning"
        );

        guessInput.focus();

        return;
    }


    attempts++;

    attemptsElement.textContent =
        attempts;


    if (guess === secretNumber) {

        winGame(playerName);

        return;
    }


    if (guess < secretNumber) {

        showMessage(
            "O número secreto é MAIOR!",
            `Tente um número acima de ${guess}.`,
            "⬆️"
        );

    } else {

        showMessage(
            "O número secreto é MENOR!",
            `Tente um número abaixo de ${guess}.`,
            "⬇️"
        );

    }


    updatePossiblePoints();

    guessInput.value = "";

    guessInput.focus();
}


/* ========================================
   VITÓRIA
======================================== */

function winGame(playerName) {

    gameFinished = true;

    guessInput.disabled = true;

    guessButton.disabled = true;

    newGameButton.hidden = false;


    const score =
        calculateScore();


    showMessage(
        "🎉 Você acertou!",
        `O número era ${secretNumber}. Você fez ${score} pontos!`,
        "🏆",
        "success"
    );


    possiblePointsElement.textContent =
        score;


    saveScore(
        playerName,
        score,
        attempts
    );


    updateRanking();

    updateBestScore();
}


/* ========================================
   PONTUAÇÃO
======================================== */

function calculateScore() {

    const score =
        INITIAL_POINTS -
        ((attempts - 1) * 50);

    return Math.max(score, 100);
}


function updatePossiblePoints() {

    const points =
        Math.max(
            INITIAL_POINTS -
            (attempts * 50),
            100
        );

    possiblePointsElement.textContent =
        points;
}


/* ========================================
   MENSAGEM
======================================== */

function showMessage(
    title,
    description,
    icon,
    type = ""
) {

    message.className = "message";


    if (type) {
        message.classList.add(type);
    }


    message.innerHTML = `

        <div class="message-icon">
            ${icon}
        </div>

        <div>

            <strong>
                ${title}
            </strong>

            <p>
                ${description}
            </p>

        </div>

    `;
}


/* ========================================
   SALVAR PONTUAÇÃO
======================================== */

function saveScore(
    playerName,
    score,
    attempts
) {

    const player = {

        name: playerName,

        score: score,

        attempts: attempts,

        date:
            new Date()
                .toLocaleDateString("pt-BR")
    };


    ranking.push(player);


    ranking.sort(
        (a, b) =>
            b.score - a.score
    );


    ranking =
        ranking.slice(0, 10);


    localStorage.setItem(
        "numberGameRanking",
        JSON.stringify(ranking)
    );
}


/* ========================================
   ATUALIZAR RANKING
======================================== */

function updateRanking() {

    rankingList.innerHTML = "";


    if (ranking.length === 0) {

        rankingList.innerHTML = `

            <div class="empty-ranking">

                <div>

                    <span>
                        🏆
                    </span>

                    <p>
                        Ainda não existem jogadores
                        <br>
                        no ranking.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    ranking.forEach(
        (player, index) => {

            const item =
                document.createElement("div");


            item.className =
                "ranking-item";


            let position;


            if (index === 0) {

                position = "🥇";

            } else if (index === 1) {

                position = "🥈";

            } else if (index === 2) {

                position = "🥉";

            } else {

                position = index + 1;
            }


            item.innerHTML = `

                <div class="ranking-position">
                    ${position}
                </div>

                <div>

                    <div class="ranking-name">
                        ${escapeHTML(player.name)}
                    </div>

                    <div class="ranking-attempts">
                        ${player.attempts}
                        tentativa(s)
                    </div>

                </div>

                <div class="ranking-score">
                    ${player.score}
                </div>

            `;


            rankingList.appendChild(item);
        }
    );
}


/* ========================================
   MELHOR PONTUAÇÃO
======================================== */

function updateBestScore() {

    if (ranking.length === 0) {

        bestScoreElement.textContent =
            "0";

        return;
    }


    bestScoreElement.textContent =
        ranking[0].score;
}


/* ========================================
   SEGURANÇA
======================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* ========================================
   NOVA RODADA
======================================== */

function newGame() {

    round++;

    startGame();
}


/* ========================================
   EVENTOS
======================================== */

guessButton.addEventListener(
    "click",
    makeGuess
);


newGameButton.addEventListener(
    "click",
    newGame
);


guessInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            makeGuess();
        }

    }
);


playerNameInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            guessInput.focus();
        }

    }
);


/* ========================================
   INICIALIZAÇÃO
======================================== */

updateRanking();

updateBestScore();

startGame();