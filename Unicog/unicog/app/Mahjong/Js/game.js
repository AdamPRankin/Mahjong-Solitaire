
//determine aspect ratio
var game

var gameConfig = {
    width: 1000,//window.innerWidth,
    height: 1000,//window.innerWidth*(3/4),
    backgroundColor: '#00422c',
    type: Phaser.AUTO,
    parent: 'gameDiv',
    scene: {
        preload: preload,
        create: create
    }
}
/*
if(window.innerWidth < window.innerHeight) {
    console.log("tall")
    gameConfig.width = window.innerWidth-16
    gameConfig.height = window.innerWidth * (0.75) - 16
} 
else{
    console.log("wide")
    gameConfig.width = Math.min(window.innerHeight * (4/3), window.innerWidth) -16
    gameConfig.height = gameConfig.width * (3/4) - 16
}
*/
function preload () {
    console.log("width: "+window.innerWidth)
    console.log("height: "+window.innerWidth*(3/4))
    //In theory at this point we should have out tileset selected but for now we don't
    var session = new GameSession();
    session.tiles.main = [
        "Mahjong-Dot-1.png",
        "Mahjong-Dot-2.png",
        "Mahjong-Dot-3.png",
        "Mahjong-Dot-4.png",
        "Mahjong-Bamboo-2.png",
        "Mahjong-Bamboo-3.png",
        "1.png"
        ]
    session.tileSetName = "Testv2"
    session.tileSetSize = 7
    session.layoutName = "Demo5.json"
    session.tileFaceX = 100,
    session.tileFaceY = 160,
    session.tileX = 110,
    session.tileY = 169
    
    //calculate the game scale/offset settings
    //session.offsetX = 
    //session.offsetY = 
    //session.scale = 1
    
    //load the layout file specified by the lobby for later use
    this.load.json('jsonLayout', '/Assets/Layouts/'+session.layoutName)
    
    //load all of the main tiles specified in the game lobby
    var tiles = session.tiles.main
    for (var i = 0; i < tiles.length; i++) {
        //console.log('/Assets/Tilesets/'+session.tileSetName+"/"+tiles[i])
        this.load.image('tile'+i, '/Assets/Tilesets/'+session.tileSetName+"/"+tiles[i])
    }
    
    console.log("Assets loaded!")
}

function create () {
    console.log("creating!")
    this.board = new Board(this)
    console.log("Game created!")
    
    resizeGame()
    game.scene.scenes[0].board.layout.positionSprites()
    window.onresize = function () {
        resizeGame()
        game.scene.scenes[0].board.layout.positionSprites()
    }

    this.input.on('pointerdown', function (pointer) {
        if (pointer.isDown) {
            //this.add.image(pointer.x, pointer.y, 'tile1', Phaser.Math.Between(0, 5));
            console.log(pointer.x+" "+ pointer.y)
        }
    }, this);

}

function update () {
}

function resizeGame() {
    var session = new GameSession()
    var width
    var height

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

    layoutWidth = (session.sizeX-1) * session.tileFaceX + session.tileX
    layoutHeight = (session.sizeY-1) * session.tileFaceY + session.tileY
    
    console.log('LX', layoutWidth)
    console.log ('LY', layoutHeight)
    
    scale = Math.min((height * 0.9) / Math.max(layoutWidth, layoutHeight), 1)
    session.scale = scale
    
    session.offsetX = (width / 2) - ((layoutWidth * scale) / 2) + (session.tileFaceX * scale / 2)
    session.offsetY = (height / 2) - ((layoutHeight * scale) / 2) + (session.tileFaceY * scale / 2)
}


function startGame () {
    game = new Phaser.Game(gameConfig)
    console.log(game)
}

function endGame () {
    // This will have to close the game when that is implemented, it's a placeholder for now.
    // This shouldn't be called when game.html is first loaded.
    // When this function is implemented that check should be done there or in this function, whatever works best.
}