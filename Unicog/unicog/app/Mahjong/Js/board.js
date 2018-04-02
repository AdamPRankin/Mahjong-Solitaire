/** Class representing a Mahjong board. */
class Board {
    /**
     * Create a Board 
     * <p>
     * Also initializes a layout
     * @param {context} scene - The scene in which the sprite resides.
     * @see Layout
     */
    constructor (scene) { 
        this.scene = scene
        
        this.tileSelected = null
        this.currentSelection = null
        this.animating = false
        
        this.failedMatches = 0
        
        var gameSession = new GameSession()
        this.layout = new Layout(this.scene)
        this.hintButton = null
        
        for (var i = 1; i <= this.layout.height; i++) {
            this.layout.addJsonLayer(gameSession.layout['layer'+i], i)
        }
        gameSession.sizeX = this.layout.layers[0][0].length
        gameSession.sizeY = this.layout.layers[0].length
        
        this.layout.buildHierarchy()
        this.layout.generateTiles() 
        if (gameSession.beginnerMode) {
            this.layout.initializeBeginnerMode()
        } 
    }
    /**
     * Selects a given TileNode
     * <p>
     * If a tile was previously selected check for a match
     * @param {TileNode} tile - The hexadecimal value used to tint the sprite
     */
    selectTile (tile) {
        // The tile can be selected
        if (tile.selectable & !this.animating) {
            this.currentSelection = tile
            
            var music = this.scene.sound.add('click')
            music.play()
            
            if (this.tileSelected != null) {
                if (this.tileSelected == this.currentSelection) {
                    this.currentSelection.resetTileHighlight()
                    this.tileSelected = null
                    
                    if (!gameSession.practiceGame) {
                        // Statistics for deselections
                        gameStats.deselections += 1
                        console.log("Deselect: ",gameStats.deselections)
                    }
                    
                } else {
                    this.checkMatch()
                }
            } else {
                // Tile has not been selected yet
                this.currentSelection.highlightTile()
                this.tileSelected = this.currentSelection
                
                if (!gameSession.practiceGame) {
                    // Statistics for selections
                    gameStats.selections += 1
                    console.log("Select: ",gameStats.selections)
                }
            }
        }
    }
    /**
     * Checks if the player has made a successful match
     * <p>
     * In the case of a match the TileNode will be removed along with the previously selected TileNode
     * In the case of The TileNode already being selected it will be deselected
     * In the case of a mismatch The TileNode will be highlighted and the previous deselected
     */
    checkMatch () {
        const UIDepth = 20000000001
        const animationDelay = 300
        
        this.animating = true
        
        // The two tiles match, remove them
        if (this.tileSelected.tile.texture.key === this.currentSelection.tile.texture.key) {
            var that = this
            this.tileSelected.highlightTile(0x32CD32)
            this.currentSelection.highlightTile(0x32CD32)

            this.failedMatches = 0
            
            if (!gameSession.practiceGame) {
                // Statistics for correct match
                gameStats.correctMatches += 1
                console.log("CM: ",gameStats.correctMatches)
            }
            
            // Keeps the layout updated
            this.layout.size -= 2

            // Gives audio feedback to the player
            var music = this.scene.sound.add('correct')
            music.play()
            
            if (this.hintButton !== null) {
                this.hintButton.destroy()
                this.hintButton = null
            }
            
            setTimeout(function () {
                that.layout.removeTile(that.tileSelected)
                that.layout.removeTile(that.currentSelection)
                that.layout.removeHint()
                that.tileSelected = null
                that.currentSelection = null
                
                if (that.layout.size === 0) {
                    that.scoreScreen(false)

                    var music = that.scene.sound.add('finishGame')
                    music.play()
                } else {
                    if(!that.layout.validMatchAvailable()) {
                        console.log('No matches')
                        var shuffleButton = that.scene.add.sprite(600, 50,'shuffle').setInteractive()
                        shuffleButton.setDepth(UIDepth)
                        
                        // Shuffle is happening
                        shuffleButton.on('pointerdown', function () {
                            that.layout.shuffle()
                            shuffleButton.destroy()
                            that.failedMatches = 0

                            // Gives audio feedback to the player
                            var music = that.scene.sound.add('shuffle')
                            music.play()
                            
                            if (!gameSession.practiceGame) {
                                // Statistics for shuffling
                                gameStats.timesShuffled += 1
                                console.log('Shuffle: ',gameStats.timesShuffled)
                            }
                        }, that)
                    }
                }
                that.animating = false
            }, animationDelay)
        } else {
            // The two tiles don't match so only select the most recent tile
            var that = this
            this.tileSelected.highlightTile(0xFF0000)
            this.currentSelection.highlightTile(0xFF0000)
            
            if (!gameSession.practiceGame) {
                // Statistics for incorrect match 
                gameStats.incorrectMatches += 1
                console.log("ICM: ",gameStats.incorrectMatches)
                
                // Statistics for selections
                gameStats.selections += 1
                console.log("Select: ",gameStats.selections)
            }
            
            // Gives audio feedback to the player
            var music = this.scene.sound.add('error')
            music.play()

            setTimeout(function () {
                if (that.tileSelected !== null & that.currentSelection !== null) {
                    that.tileSelected.resetTileHighlight()
                    that.tileSelected = that.currentSelection
                    that.currentSelection.highlightTile()
                }
                
                if (++that.failedMatches === 3 & that.layout.validMatchAvailable() & gameSession.enabledHints & that.layout.activeHintTile1 === null) {
                    // Hint button appears
                    that.hintButton = that.scene.add.sprite(700, 50, 'hint').setInteractive()
                    that.hintButton.setDepth(UIDepth)

                    // Gives audio feedback to the player
                    var music = that.scene.sound.add('hint')
                    music.play()
                    
                    // Hint is being given
                    that.hintButton.on('pointerdown', function() {
                        that.tileSelected.resetTileHighlight()
                        that.tileSelected = null
                        that.currentSelection.resetTileHighlight()
                        that.currentSelection = null
                        
                        that.layout.giveHint()
                        that.failedMatches = 0
                        that.hintButton.destroy()
                        
                        if (!gameSession.practiceGame) {
                            // Statistics for giving hint
                            gameStats.hintsUsed += 1
                            console.log("Hint: ",gameStats.hintsUsed)
                        }
                        
                    }, that)
                }
                that.animating = false
            }, animationDelay)
        }
    }
    
    scoreScreen (timerDone) {
        const UIDepth = 20000000001
        
        // End the game here
        var overlay = this.scene.add.sprite(500, 500, 'overlay').setInteractive()
        overlay.setScale(10)
        overlay.setDepth(UIDepth - 1)
        
        if (!gameSession.practiceGame) {
            // Statistics for time taken to complete game
            gameSession.timer.pauseTimer()
            gameStats.endGameTime = gameSession.timer.timeLeft
            console.log("Duration: ", gameStats.startGameTime - gameStats.endGameTime)
        }
        
        var continueButton = this.scene.add.sprite(400, 500, 'continue').setInteractive()
        continueButton.setDepth(UIDepth)
        continueButton.on('pointerdown', function() {
            if (!gameSession.practiceGame & !timerDone) {
                gameStats.completion = true
            }
            endGame(timerDone)
        },this)
    }
}
