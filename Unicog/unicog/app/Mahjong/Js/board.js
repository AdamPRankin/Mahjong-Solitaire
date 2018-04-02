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
            
            this.playSound('click')
            
            if (this.tileSelected != null) {
                if (this.tileSelected == this.currentSelection) {
                    this.currentSelection.unhighlightTile()
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
        const greenHighlight = 0x32CD32
        const redHighlight = 0xFF0000
        
        this.animating = true
        
        // The two tiles match, remove them
        if (this.tileSelected.tile.texture.key === this.currentSelection.tile.texture.key) {
            this.tileMatch()
        } else {
            this.tileMismatch()
        }
    }

    tileMatch () {
        const UIDepth = 20000000001
        const animationDelay = 300
        const greenHighlight = 0x32CD32
        var self = this

        this.failedMatches = 0
        
        if (!gameSession.practiceGame) {
            // Statistics for correct match
            gameStats.correctMatches += 1
            console.log("CM: ",gameStats.correctMatches)
        }
        
        // Keeps the layout updated
        this.layout.size -= 2

        //gives audio feedback to the player
        this.playSound('correct')
        
        if (this.hintButton !== null) {
            this.hintButton.destroy()
            this.hintButton = null
        }
        
        this.tileSelected.highlightTile(greenHighlight)
        this.currentSelection.highlightTile(greenHighlight)

        console.log(this.layout.findNeighbours(this.tileSelected)[0])
        console.log(this.tileSelected.x)
        //console.log(this.tileSelected)

        if (this.layout.findNeighbours(this.tileSelected)[0] === undefined) {
            this.tileSelected.state.tweens.add({
                targets: self.tileSelected.tile,
                x: { value: 1000, duration: 800, ease: 'Power2' }
            })
        }
        else if (this.layout.findNeighbours(this.tileSelected)[0].x < this.tileSelected.x) {
            this.tileSelected.state.tweens.add({
                targets: self.tileSelected.tile,
                x: { value: 1000, duration: 800, ease: 'Power2' }
            })
        } else {
            this.tileSelected.state.tweens.add({
                targets: self.tileSelected.tile,
                x: { value: -300, duration: 800, ease: 'Power2' }
            })
        }
        
        if (this.layout.findNeighbours(this.currentSelection)[0] === undefined) {
            this.currentSelection.state.tweens.add({
                targets: self.currentSelection.tile,
                x: { value: 1000, duration: 800, ease: 'Power2' }
            }) 
        }
        else if (this.layout.findNeighbours(this.currentSelection)[0].x < this.currentSelection.x) {
            this.currentSelection.state.tweens.add({
                targets: self.currentSelection.tile,
                x: { value: 1000, duration: 800, ease: 'Power2' }
            }) 
        } else {
            this.currentSelection.state.tweens.add({
                targets: self.currentSelection.tile,
                x: { value: -300, duration: 800, ease: 'Power2' }
            })
        }
        

        
        setTimeout(function () {
            self.layout.removeTile(self.tileSelected)
            self.layout.removeTile(self.currentSelection)
            self.tileSelected = null
            self.currentSelection = null
            
            if (self.layout.size === 0) {
                self.scoreScreen(false)

                self.playSound('finishGame')
            } else {
                if(!self.layout.validMatchAvailable()) {
                    console.log('No matches')
                    var shuffleButton = self.scene.add.sprite(600, 50,'shuffle').setInteractive()
                    shuffleButton.setDepth(UIDepth)
                    
                    // Shuffle is happening
                    shuffleButton.on('pointerdown', function () {
                        self.layout.shuffle()
                        shuffleButton.destroy()
                        self.failedMatches = 0

                        //gives audio feedback to the player
                        this.playSound('shuffle')
                        
                        if (!gameSession.practiceGame) {
                            // Statistics for shuffling
                            gameStats.timesShuffled += 1
                            console.log('Shuffle: ',gameStats.timesShuffled)
                        }
                    }, self)
                }
            }
            self.animating = false
        }, animationDelay)
    }

    tileMismatch() {
        const UIDepth = 20000000001
        const animationDelay = 300
        const greenHighlight = 0x32CD32
        const redHighlight = 0xFF0000
        // The two tiles don't match so only select the most recent tile
        var self = this
        this.tileSelected.highlightTile(redHighlight)
        this.currentSelection.highlightTile(redHighlight)

        setTimeout(function () {
            self.tileSelected.unhighlightTile()
            self.tileSelected = self.currentSelection
            self.currentSelection.highlightTile()
            
            self.animating = false
        }, animationDelay)
        
        if (!gameSession.practiceGame) {
            // Statistics for incorrect match 
            gameStats.incorrectMatches += 1
            console.log("ICM: ",gameStats.incorrectMatches)
            
            // Statistics for selections
            gameStats.selections += 1
            console.log("Select: ",gameStats.selections)
        }
        
        //gives audio feedback to the player
        this.playSound('error')

        if (++this.failedMatches === 3 & this.layout.validMatchAvailable() & gameSession.enabledHints) {
            
            // Hint button appears
            this.hintButton = this.scene.add.sprite(700, 50, 'hint').setInteractive()
            this.hintButton.setDepth(UIDepth)

            //gives audio feedback to the player
            this.playSound('hint')
            
            // Hint is being given
            this.hintButton.on('pointerdown', function() {
                this.layout.giveHint()
                this.failedMatches = 0
                this.hintButton.destroy()
                
                if (!gameSession.practiceGame) {
                    // Statistics for giving hint
                    gameStats.hintsUsed += 1
                    console.log("Hint: ",gameStats.hintsUsed)
                }
                
            },this)
        }
    }

    playSound(sound) {
        var music = this.scene.sound.add(sound)
        music.play()
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
