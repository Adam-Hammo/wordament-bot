$(document).ready(function() {
    $("#search").click(search)
    $("#reset").click(reset)
})

function getSquareNeigbours(x,y,d) {
    let neighbours = [];
    if (x>0) {
        neighbours.push([x-1,y])
        if (y>0) 
            neighbours.push([x-1,y-1])
        if (y<d)
            neighbours.push([x-1,y+1])
    }
    if (x<d) {
        neighbours.push([x+1,y])
        if (y>0) 
            neighbours.push([x+1,y-1])
        if (y<d)
            neighbours.push([x+1,y+1])
    }
    if (y>0)
        neighbours.push([x,y-1])
    if (y<d)
        neighbours.push([x,y+1])
    return neighbours
}

function recursiveSearch(dict, substr, x, y, visited, grid) {
    if (dict.length === 0) 
        return []
    
    // If there is a hyphen this is a suffix - check for a word and exit
    if (substr.includes('-')) {
        if (dict.includes(substr.replace('-','')))
            return [substr.replace('-','')]
        return []
    }

    // Get a new memory ref
    visited = JSON.parse(JSON.stringify(visited))

    // If substr is a word, add it
    let words = []
    if (dict.includes(substr))
        words.push(substr)

    // Find neighbours
    let neighbours = getSquareNeigbours(x,y,10-1)
    let unvisited = neighbours.filter(n => !visited.includes(JSON.stringify(n)))

    // Search each unvisited neighbour
    unvisited.forEach((c) => {
        x = c[0]
        y = c[1]
        let cell = grid[x][y]
        let valid = true
        if (cell.endsWith('-')) {
            // this is a prefix, can't use this square
            valid = false
        }
        if (valid) {
            if (cell.includes("/")) {
                // This is an either/or square, check both
                cell.split("/").forEach((c => {
                    let nextSubstr = substr+c
                    let filtered_dict = dict.filter(w=>w.startsWith(nextSubstr))
                    words.push(...recursiveSearch(filtered_dict, nextSubstr, x, y, visited + [JSON.stringify(c)], grid)) 
                }))
            }
            let nextSubstr = substr+cell
            let filtered_dict = dict.filter(w=>w.startsWith(nextSubstr))
            words.push(...recursiveSearch(filtered_dict, nextSubstr, x, y, visited + [JSON.stringify(c)], grid))
        }
    })
    return words
}

function search() {
    $("#error").html("")
    $("#results").html("")
    let grid = [
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null]
    ]
    $(".grid-input").each((i,e)=>{
        e=$(e)
        let coords=e.attr('key').split(",")
        grid[coords[0]-1][coords[1]-1]=e.val().toUpperCase()
    })
    if (grid.map(row=>row.includes('') || row.includes(null)).some(e=>e)) {
        $("#error").html("Grid not filled out")
        return
    }
    let words = []
    let v = [0,1,2,3,4,5,6,7,8,9]
    v.forEach(x=>
        v.forEach(y=>{
            let start = grid[x][y]
            if (start.endsWith('-'))
                start = start.replace('-','')

            // If this isn't a suffix, then send it
            if (!start.startsWith('-'))
                words.push(...recursiveSearch(WORDS, grid[x][y], x, y, [JSON.stringify([x,y])], grid))
        })
    )
    words = words.filter((x,i)=>!words.includes(x,i+1))
    words = words.sort((a, b) => b.length - a.length)
    let list = $("#results")
    words.forEach(word=>{
        list.append("<li>"+word+"</li>")
    })
}

function reset() {
    $(".grid-input").each((i,e)=>{
        $(e).val(null)
    })
}
