var common = require('common');

var roleTowerTender = {

    /** @param {Spawn} spawn
        @param {int} resources 
    **/
    create: function(spawn, resources) {
        var body = [WORK,CARRY,MOVE];
        resources -= 200;
        if(resources >= 100) {
            body.push(CARRY);
            body.push(MOVE);
            resources -= 100;
        }
        if(resources >= 50) {
            body.push(MOVE);
            resources -= 50;
        }
        var newName = spawn.createCreep(body, undefined, {role: 'towertender'});
        if(newName < 0) {
            newName = common.getErrorString(newName);
        }
        console.log(spawn, 'Spawning new towertender: ' + newName + ' with body ' + body);
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
	    }
	    if(!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.delivering = true;
	    }

	    if(creep.memory.delivering) {
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        } else {
            common.getEnergy(creep);
        }
	}
};

module.exports = roleTowerTender;