var roads = {

    recordUse: function(body, roomPosition) {
        var room = roomPosition.roomName;
        var pos = roomPosition.x + ',' + roomPosition.y;
        if(!Memory.roads) {
            Memory.roads = {};
        }
        if(!Memory.roads[room]) {
            Memory.roads[room] = {};
        }
        if(!Memory.roads[room][pos]) {
            Memory.roads[room][pos] = 0;
        }
        //console.log('Used road: room ' + room + ' pos ' + pos);
        Memory.roads[room][pos] += body.length * 50;
    },

    decayUse: function() {
        for(var room in Memory.roads) {
            for( var pos in Memory.roads[room]) {
                Memory.roads[room][pos] -= 1;
                if(Memory.roads[room][pos] <= 0) {
                    delete Memory.roads[room][pos];
                }
            }
        }
    },

    buildOne: function(roomPosition) {
        room = roomPosition.roomName;
        positions = Memory.roads[room];

        var sortable = [];
        for(var p in positions) {
            sortable.push([p, positions[p]]);
        }
        sortable.sort(function(a,b) { return b[1] - a[1]})

        for(var pos in sortable) {
            if(sortable[pos][1] >= 1000) {
                if(sortable[pos][1] > 9999) {
                    Memory.roads[roomPosition.roomName][roomPosition.x + ',' + roomPosition.y] = 9999;
                }
                var x = sortable[pos][0].split(',')[0];
                var y = sortable[pos][0].split(',')[1];
                var rp = new RoomPosition(x, y, room);
                if(rp.createConstructionSite(STRUCTURE_ROAD) == OK) {
                    console.log('Building road scored ' + sortable[pos][1] + ' at ' + rp);
                    break;
                }
            }
        }
    },
}
module.exports = roads;