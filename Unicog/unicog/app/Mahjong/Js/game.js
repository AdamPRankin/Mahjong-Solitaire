var game

var gameConfig = {
    width: 1400,
    height: 1000,
    backgroundColor: '#000000',
    type: Phaser.AUTO,
    parent: 'gameDiv',
    scene: {
        preload: preload,
        create: create
    }
}
/**
 * Loads all necessary assets for the game
 * @function Preload
 */
function preload () {
    this.load.image(gameSession.background, '/Assets/Themes/'+gameSession.background)
    
    var tiles = gameSession.tileset.main
    for (var i = 0; i < tiles.length; i++) {
        var index 
        if(i < 10) {
            var index = '0'+i.toString()
        } else {
            var index = i.toString()
        }
        this.load.image('tile'+index, '/Assets/Tilesets/'+gameSession.tileset.name+'/'+tiles[i])
        console.log('tile'+index)
    }

    

    // Load all of the button images
    var buttonList = gameSession.buttons.main
    for (var i = 0; i < buttonList.length; i++) {
        this.load.image(buttonList[i].name, '/Assets/Buttons/'+buttonList[i].file)
        console.log(buttonList[i].name)
    }
    
    console.log('Assets loaded!')

    //load the sound files
    this.load.audio('correct', '/Assets/Audio/correct4.mp3')
    this.load.audio('error', '/Assets/Audio/wrongmatch.mp3')
    this.load.audio('click', '/Assets/Audio/click.mp3')
    this.load.audio('hint', '/Assets/Audio/hint2.mp3')
    this.load.audio('shuffle', '/Assets/Audio/shuffle2.mp3')
    this.load.audio('finishGame', 'Assets/Audio/finish_game.mp3')
}
/**
 * initializes the necessary data stuctures, resizes the game to match the viewing window and begins the Phaser Game 
 * @function Create
 */
function create () {
    console.log('Creating!')
    var background = this.add.sprite(0, 0, gameSession.background).setOrigin(0, 0)
    this.board = new Board(this)
    if (gameSession.timer !== null) {
        gameSession.timer.board = this.board
    }

    console.log('Game created!')
    
    resizeGame(background)
    game.scene.scenes[0].board.layout.positionSprites()
    window.onresize = function () {
        resizeGame(background)
        game.scene.scenes[0].board.layout.positionSprites()
    }
    /*
    this.input.on('gameobjectdown', function (pointer, tileNode) {

        //  Will contain the top-most Game Object (in the display list)
        this.tweens.add({
            targets: tileNode,
            x: { value: 1100, duration: 1500, ease: 'Power2' },
            y: { value: 500, duration: 500, ease: 'Bounce.easeOut', delay: 150 }
        });

    }, this)
    */
    //placing buttons. This will need cleaning up later on

    var emitter = new Phaser.EventEmitter();

    emitter.on('matchedTiles', matchedTilesHandler, this);

    loadButtons(this)

    //add the sound effects to the game.
    this.sound.add('correct')
    this.sound.add('error')
    this.sound.add('click')
    this.sound.add('hint')
    this.sound.add('shuffle')
    this.sound.add('finishGame')
}

function matchedTilesHandler() {
    console.log('tiles matched!')
}

/**
 * Ends The game
 * @function triggerQuit
 */
function triggerQuit () {
    console.log('Quit triggered!')
}
/**
 * Loads button assets for the game
 * @function loadButtons
 * @param {context} scope - The scene that the buttons reside 
 */
function loadButtons (scope) {
    var test = scope.add.sprite(100, 50, 'quit').setInteractive()
    test.on('pointerdown', function() {
        if (!gameSession.practiceGame) {
            gameSession.timer.pauseTimer()
        }
        
        overlay = scope.add.sprite(500, 500, 'overlay').setInteractive()
        overlay.setScale(10)
        overlay.setDepth(20000000000)

        cancel = scope.add.sprite(400, 500, 'cancel').setInteractive()
        cancel.setDepth(20000000001)
        cancel.on('pointerdown', function() {
            if (!gameSession.practiceGame) {
                gameSession.timer.resumeTimer()
            }
            
            overlay.destroy()
            quit.destroy()
            cancel.destroy()
        },scope)

        quit = scope.add.sprite(700, 500, 'quit-blue').setInteractive()
        quit.setDepth(20000000001)
        quit.on('pointerdown', function () {
            
            if (!gameSession.practiceGame) {
                // Statistics for time taken to complete game
                gameStats.endGameTime = gameSession.timer.timeLeft
                console.log("Duration: ", gameStats.startGameTime - gameStats.endGameTime)
            }
            
            endGame(false)
        }, scope)
    }, scope)  
}
/**
 * resizes the game by editing the game renderer.
 * @function resizeGame
 */
function resizeGame (background) {
    var s = gameSession
    var width
    var height

    //determine maximum games size while maintaining a 4:3 ratio
    if (window.innerWidth < window.innerHeight) {
        width = window.innerWidth-16
        height = window.innerWidth * (0.75) - 16
    } 
    if (window.innerWidth > window.innerHeight) {
        width = Math.min(window.innerHeight * (4/3), window.innerWidth) -16
        height = width * (3/4) - 16
    }
    
    game.renderer.resize(width, height, 1);
    game.config.width = width
    game.config.height = height

    //calculate the overall size of the layout
    layoutWidth = (s.sizeX-1) * s.tileset.tileFaceX + s.tileset.tileX
    layoutHeight = (s.sizeY-1) * s.tileset.tileFaceY + s.tileset.tileY
    
    //calculate the optimal tile scaling and necessary offset to center
    scale = Math.min((height * 0.9) / Math.max(layoutWidth, layoutHeight), 1)
    s.scale = scale   
    s.offsetX = (width / 2) - ((layoutWidth * scale) / 2) 
                        + (s.tileset.tileFaceX * scale / 2) 
    s.offsetY = (height / 2) - ((layoutHeight * scale) / 2) 
                        + (s.tileset.tileFaceY * scale / 2)
    
    background.scaleX = width / background.width
    background.scaleY = height / background.height
}

/**
 * Create a new Game object
 * @function startGame
 */
function startGame () {
    game = new Phaser.Game(gameConfig, 'NL')
    if (!gameSession.practiceGame) {
        console.log("Game: ", gameStats.gameNumber)
        gameStats.startGameTime = gameSession.timer.timeLeft
    }
    console.log(game)
}
/**
 * destroys the game object and shows the lobby
 * @function endGame
 */
function endGame (timerDone) {
    this.game.destroy(true)
    if (!gameSession.practiceGame) {
        gameSession.timer.pauseTimer()
        gameStats.resetGameStats()
    }
    
    if (timerDone) {
        window.location.replace('player_login.html')
    } else {
        showLobby()
    }
}