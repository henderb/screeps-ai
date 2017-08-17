var common = require('common');

var roleColonizer = {

    /** @param {Spawn} spawn
        @param {int} resources 
    **/
    create: function(spawn, resources) {
        var body = [CLAIM,MOVE];
        resources -= 650;
        while(resources >= 60) {
            body.push(MOVE);
            body.push(TOUGH);
            resources -= 60;
        }

        // Find a room to colonize
        for(var room in Game.map.describeExits(spawn.room.name)) {
            if(Game.map.isRoomAvailable(room)) {
                memory.target = {
                    'room': room.name,
                    'x': room.controller.pos.x,
                    'y': room.controller.pos.y,
                }
            }
        }

        var newName = spawn.createCreep(body, undefined, {role: 'colonizer'});
        if(newName < 0) {
            newName = common.getErrorString(newName);
        }
        console.log('Spawning new colonizer: ' + newName + ' with body ' + body);
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.room.name != memory.target[room]) {
            creep.moveTo(new RoomPosition(memory.target[x], memory.target[y], memory.target[room]));
        } else {
            if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE){
                creep.moveTo(creep.room.controller);
            }
        }
	}
};

module.exports = roleContainerizer;