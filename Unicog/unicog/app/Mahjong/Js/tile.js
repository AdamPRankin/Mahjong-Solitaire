class Layout {
    constructor(state, json){
        console.log("layout constructor")
        console.log(json)
        var session = new GameSession();
        this.state = state,
        this.size = json.header.size,
        this.height = json.header.height,
        this.tileFaceX = session.tileFaceX,
        this.tileFaceY = session.tileFaceY,
        this.tileX = session.tileX,
        this.tileY = session.tileY,
        this.uniqueTiles = json.header.uniqueTiles,
        this.maxDuplicates = json.header.maxDuplicates,
        this.numChildren = json.header.numChildren,
        this.layers = [],
        this.roots = []
    }
    
    //add a single layer to the layout 
    addJsonLayer(layer, height) {
        var generated = []
        for (var i = 0; i < layer.length; i++) {
            var row = []
            for (var j = 0; j < layer[i].length; j++) {
                if(layer[i][j] == 1) {
                    row.push(new TileNode(this.state, j, i, height, this.numChildren))
                }else {
                    row.push(null)
                }
            }
            generated.push(row)
        }
        this.layers.push(generated)
    }
    
    //constructs the tree structure between tileNodes within the layers array 
    buildHierarchy() {
        for (var i = this.layers.length - 1; i >= 0; i--) {
            for (var j = 0; j < this.layers[i].length; j++) {
                for (var k = 0; k < this.layers[i][j].length; k++) {
                    if (this.layers[i][j][k] == null) {
                        continue
                    }
                    if (this.layers[i][j][k].parents.length < 1){
                        this.roots.push(this.layers[i][j][k].findChildren(this, this.numChildren))
                    }
                }
            }
        }
        console.log("roots")
        console.log(this.roots)
    }
    
    findNeighbours(tile, findEmpty = false) {
        if (tile == null) {return false}
        var neighbors = []
        for (var i = tile.x - 1; i >= 0; i--) {
            if (this.layers[tile.z][tile.y][i] != null) {
               if (findEmpty && this.layers[tile.z][tile.y][i].isSet()) {
                   break
               } else {
                   neighbors.push(this.layers[tile.z][tile.y][i]) 
                   break
               }
            }
        }
        for (var i = tile.x + 1; i < this.layers[tile.z][tile.y].length; i++) {
            if (this.layers[tile.z][tile.y][i] != null) {
               if (findEmpty && this.layers[tile.z][tile.y][i].isSet()) {
                   break
               } else {
                    neighbors.push(this.layers[tile.z][tile.y][i])
                    break
               }
            }
        }
        return neighbors
    }
    
    removeTile(tile) {
        //remove from root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i] === tile) {
                this.roots.splice(i, 1)
            }
        } 
        //add children to root and make selectable if applicable
        for (var i = 0; i < tile.children.length; i++) {
            if (tile.children[i].parents.length < 2)
            {
                this.roots.push(tile.children[i])
                if (this.findNeighbours(tile.children[i]).length < 2) {
                    tile.children[i].selectable = true
                }
            }
            tile.children[i].removeParent(tile)
        }
        //set the adjacent tile to be selectable
        var neighbour = this.findNeighbours(tile)
        console.log(neighbour)
        if (neighbour.length > 0) {
            this.findNeighbours(tile)[0].selectable = true
        }
        tile.tile.destroy()
        this.layers[tile.z][tile.y][tile.x] = null
    }
    
    generateTiles() {
        var session = new GameSession()
        var counts = new Array(Math.min(this.uniqueTiles, session.tileSetSize)).fill(0)
        var possible = [...Array(counts.length).keys()]
        var upperTiles = []
        var lowerTiles = []
        
        for (var i = 0; i < this.roots.length; i++) {
            console.log(this.findNeighbours(this.roots[i], true))
            if (this.findNeighbours(this.roots[i], true).length < 2) {
                this.roots[i].selectable = true
                if (this.roots[i].height === this.height) {
                    upperTiles.push(this.roots[i])
                } else {
                    lowerTiles.push(this.roots[i])
                }
            }
        }
        
        for (var n = 0; n < this.size/2; n++) {
            console.log(counts)
            console.log(possible)
            //get tile
            var randTile = Math.floor(Math.random() * Math.floor(possible.length))
            
            if (upperTiles.length < 1) {
                this.height--
                var temporaryArray = []
                for (var i = lowerTiles.length - 1; i >= 0; i--) {
                    if (lowerTiles[i].height === this.height) {
                        upperTiles.push(lowerTiles.splice(i, 1)[0])
                    } else {
                        lowerTiles[i]
                    }
                    
                    //console.log("---------------------")
                }
                
            }
                
            
            if (lowerTiles.length < 3 || upperTiles.length < 2) {
                var randPos1 = Math.floor(Math.random() * Math.floor(upperTiles.length))
                var pos1 = upperTiles.splice(randPos1, 1)[0]
            } else {
                
                // May need a +1 if we die
                var randPos1 = Math.floor(Math.random() * Math.floor(upperTiles.length + lowerTiles.length))
                if (randPos1 > upperTiles.length - 1) {
                    var pos1 = lowerTiles.splice(randPos1 - upperTiles.length, 1)[0]
                } else {
                    var pos1 = upperTiles.splice(randPos1, 1)[0]
                }
            }
            
            var randPos2 = Math.floor(Math.random() * Math.floor(upperTiles.length + lowerTiles.length))
            if (randPos2 > upperTiles.length - 1) {
                var pos2 = lowerTiles.splice(randPos2 - upperTiles.length, 1)[0]
            } else {
                var pos2 = upperTiles.splice(randPos2, 1)[0]
            }
            
            try {
                // Adjust the offset for this tile
                pos1.setSpritePosition(this.numChildren, this.tileFaceX, this.tileFaceY, this.tileX, this.tileY)
                pos2.setSpritePosition(this.numChildren, this.tileFaceX, this.tileFaceY, this.tileX, this.tileY)
                
                //assign the tile to the two selected positions
                pos1.setTile("tile"+possible[randTile])
                pos2.setTile("tile"+possible[randTile])
            }
            catch (err) {
                console.log("critical failure!")
                console.log(counts)
                console.log(possible)
                console.log(upperTiles)
                console.log(lowerTiles)
                console.log(pos1)
                console.log(pos2)
                throw("TypeError")
            }
                            
            //if we have placed as many pairs of this tile as possible remove from list
            if (++counts[possible[randTile]] == this.maxDuplicates) {
                possible.splice(randTile, 1)
            }
            
            
            var childrenToPush = []
            
            
            //find the new child positions opened by the assignment of position 1
            for (var i = 0; i < pos1.children.length; i++){
                if (pos1.children[i].allParentsGenerated() && this.findNeighbours(pos1.children[i], true).length < 2){
                    childrenToPush.push(pos1.children[i])
                }
            }           
            
            //find the new child positions opened by the assignment of position 2
            for (var i = 0; i < pos2.children.length; i++){
                if (pos2.children[i].allParentsGenerated() && this.findNeighbours(pos2.children[i], true).length < 2){
                    childrenToPush.push(pos2.children[i])
                }
            }
            
            if (pos1.height === this.height) {
                this.mergeArrays(upperTiles, this.findNeighbours(pos1, true))   
            } else {
                this.mergeArrays(lowerTiles, this.findNeighbours(pos1, true))
            }
            if (pos2.height === this.height) {
                this.mergeArrays(upperTiles, this.findNeighbours(pos2, true))   
            } else {
                this.mergeArrays(lowerTiles, this.findNeighbours(pos2, true))
            }
            
            
            this.mergeArrays(lowerTiles, childrenToPush)
            
            console.log(counts)
            console.log(possible)
        }
    }
    
    mergeArrays(array, newObjects) {
        for (var i = 0; i < newObjects.length; i++) {
            var invalidTile = false
            //Check all children are generated for the tile
            if (!newObjects[i].allParentsGenerated()) {
                invalidTile = true
            } else {
                //Ensure a duplicate is not pushed into open tiles
                for (var j = 0; j < array.length; j++){
                    if (newObjects[i] === array[j]) {
                        invalidTile = true
                        break
                    }
                }
            }
            // Good to go - push it
            if (!invalidTile) {
                array.push(newObjects[i])
            }
        }   
    }
    
    setAll() {
        
        //console.log("set all!")
        for (var i = 0; i < this.layers.length; i++) {
            //console.log("layer to set")
            //console.log(this.layers[i])
            this.setLayer(this.layers[i])
        }
    }
    
    setLayer(layer) {
        for (var i = 0; i < layer.length; i++) {
            for (var j = 0; j < layer[i].length; j++) {
                if (layer[i][j] != null) {
                    layer[i][j].setTile("tile0")
                }
            }
        }
    }
}

class TileNode {
    constructor(state, x, y, height, numChildren){
        var session = new GameSession()
        this.state = state,
        this.x = x,
        this.y = y,
        this.z = height-1,
        this.xPos = null,
        this.yPos = null,
        this.height = height,
        this.parents = [], 
        this.children = [],
        this.tile = null,
        this.selectable = false
    }
    
    highlightTile(tint = 0xFFFD9A) {  
        this.tile.setTint(tint)
    }
    
    unhighlightTile() {
        this.tile.clearTint()
    }
    
    dimTile(dim = 0xCCCCCC) {
        this.tile.setTint(dim)
    }
    
    setSpritePosition(numChildren, tileFaceX, tileFaceY, tileX, tileY) {
        //console.log(tileFaceX)
        //console.log(tileFaceY)
        //console.log("++++++++++++++")
        // Sets to the faces of the tile
        this.xPos = tileFaceX * this.x + 100
        this.yPos = tileFaceY * this.y + 100
        
        // For two and four children
        if (numChildren === 2) {
            this.xPos += ((tileFaceX / 2) * (this.z + 1))
            this.yPos += (tileFaceY / 2)
        } else if (numChildren === 4) {
            this.xPos += (tileFaceX / 2) * (this.z + 1)
            this.yPos += (tileFaceY / 2) * (this.z + 1)
        } else if (numChildren === 1) {
            this.xPos += (tileFaceX / 2)
            this.yPos += (tileFaceY / 2)
        }
        
        // Adjusts center point of tile to the center of the face 
        this.xPos += ((tileX - tileFaceX) / 2) 
        this.yPos += ((tileY - tileFaceY) / 2) 
        this.yPos -= ((tileY - tileFaceY)) * this.z
        this.xPos -= ((tileX - tileFaceX)) * this.z
    }
    
    setTile(img) {
        
        this.tile = this.state.add.sprite(this.xPos, this.yPos, img).setInteractive()
        // Assures each tile has a unique depth per layout
        this.tile.setDepth(this.height*1000000 + this.y*1000 + this.x)
        var self = this;
        this.tile.on('pointerdown', function () {  
            self.state.board.selectTile(self)
        })
    }
    
    isSet() {
        if (this.tile == null) {
            return false
        }
        return true
    }
    
    removeParent(tileNode) {
        for( var i = 0; i < this.parents.length; i++) {
            if (tileNode === this.parents[i]) {
                this.parents.splice(i,1)
            }
        }
    }
    
    //Checks if the Tiles for all the child nodes are set
    allChildrenGenerated() {
        for (var i = 0; i < this.children.length; i++) {
            if (!this.children[i].isSet()){
                console.log(this.children[i])
                return false
            }            
        }
        return true
    }
    
    //Checks if the Tiles for all the parent nodes are set
    allParentsGenerated() {
        for (var i = 0; i < this.parents.length; i++) {
            if (!this.parents[i].isSet()){
                //console.log(this.parents[i])
                return false
            }            
        }
        return true
    }
    
    findChildren(layout, numChildren) {
        if (this.height == 1){
            return this
        }
        
        //get the children for the current position
        var children = []
        if (numChildren == 1) {
            children.push(layout.layers[this.z-1][this.y][this.x])
        }
        if (numChildren == 2) {
            children.push(layout.layers[this.z-1][this.y][this.x])
            children.push(layout.layers[this.z-1][this.y][this.x+1])
        }
        if (numChildren == 4) {
            children.push(layout.layers[this.z-1][this.y][this.x])
            children.push(layout.layers[this.z-1][this.y][this.x+1])
            children.push(layout.layers[this.z-1][this.y+1][this.x])
            children.push(layout.layers[this.z-1][this.y+1][this.x+1])
        }
        
        for (var i = 0; i < children.length; i++) {
            //If the child hasn't already already been looked at and isn't a leaf recursively call findChildren 
            if (children[i].children.length < 1 && children[i].height > 1) {
                this.children.push(children[i].findChildren(layout, numChildren))
            } else {
                this.children.push(children[i])
            }
            children[i].parents.push(this)
        }
        
        return this  
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}