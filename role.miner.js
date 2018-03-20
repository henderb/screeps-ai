var common = require('common');

var roleMiner = {

    /** @param {Spawn} spawn
        @param {int} resources 
    **/
    create: function(spawn, resources) {
        // Limit resources to build one step above 10/tick source replenishment rate
        //resources = Math.min(resources, 850);
        var body = [WORK,CARRY,MOVE];
        resources -= 200;
        if(resources >= 100) {
            body.unshift(WORK);
            resources -= 100;
        }
        if(resources >= 50) {
            body.push(MOVE);
            resources -= 50;
        }
        if(resources >= 50) {
            body.push(MOVE);
            resources -= 50;
        }
        var newName = spawn.createCreep(body, undefined, {role: 'miner'});
        if(newName < 0) {
            newName = common.getErrorString(newName);
        }
        console.log(spawn, 'Spawning new miner: ' + newName + ' with body ' + body);
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.delivering && _.sum(creep.carry) == 0) {
            creep.memory.delivering = false;
	    }
	    if(!creep.memory.delivering && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.delivering = true;
        }

	    if(creep.memory.delivering) {
            var target = creep.room.terminal
            if(target) {
                creep.repair(target);
                for(resource in creep.carry) {
                    if(creep.transfer(target, resource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            }
        } else {
            var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1)[0];
            if(droppedEnergy) {
                if(creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE){
                    creep.moveTo(droppedEnergy);
                }
            } else {
                var mine = creep.room.find(FIND_MINERALS)[0];
                if(creep.harvest(mine) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(mine);
                }
            }
        }
	}
};

module.exports = roleMiner;