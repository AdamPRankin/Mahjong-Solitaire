class Board {
    constructor(scene) { 
        this.scene = scene
        
        this.tileSelected = null
        this.currentSelection = null
        
        var session = new GameSession()
        var json = this.scene.cache.json.get('jsonLayout')
        this.layout = new Layout(this.scene, json)
        
        session.numChildren = json.header.numChildren
        var height = json.header.height
        
        for(var i = 1; i <= height; i++) {
            this.layout.addJsonLayer(json['layer'+i], i)
        }
        
        this.layout.buildHierarchy()
        this.layout.generateTiles()        
    };
   
    selectTile(tile) {
        // The tile can be selected
        if (tile.selectable) {
            this.currentSelection = tile
            
            if (this.tileSelected != null) {
                if (this.tileSelected == this.currentSelection) {
                    this.currentSelection.unhighlightTile()
                    this.tileSelected = null
                } else {
                    this.checkMatch()
                }
            } else {
                // Tile has not been selected yet
                this.currentSelection.highlightTile()
                this.tileSelected = this.currentSelection
            }
        }
    }

    checkMatch(){
        // The two tiles match, remove them
        if (this.tileSelected.tile.texture.key === this.currentSelection.tile.texture.key) {
            this.layout.removeTile(this.tileSelected)
            this.layout.removeTile(this.currentSelection)
            this.tileSelected = null
            this.currentSelection = null
        } else {
            // The two tiles don't match so only select the most recent tile
            this.tileSelected.unhighlightTile()
            this.tileSelected = this.currentSelection
            this.currentSelection.highlightTile()
        }        
    }

    checkAvailableMoves() {
       
    }

    shuffle(){
        
    }
}