var common = require('common');

var roleRepairer = {

    /** @param {Spawn} spawn
        @param {int} resources 
    **/
    create: function(spawn, resources) {
        var body = [WORK,CARRY,MOVE];
        resources -= 200;
        part_limit = 5;
        while(resources >= 100 && part_limit > 0) {
            body.push(CARRY);
            body.push(MOVE);
            resources -= 200;
            part_limit -= 1;
        }
        if(resources >= 50) {
            body.push(MOVE);
            resources -= 50;
        }
        var newName = spawn.createCreep(body, undefined, {role: 'repairer'});
        if(newName < 0) {
            newName = common.getErrorString(newName);
        }
        console.log(spawn, 'Spawning new repairer: ' + newName + ' with body ' + body);
    },

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) {
            var target = common.getCachedObject(creep, 'repairer_repairing');
            if(target == ERR_NOT_FOUND) {
                target = false;
                for(var maxHits = 1000; maxHits < 1000000000; maxHits = maxHits * 2) {
                    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType != STRUCTURE_ROAD && structure.hits < structure.hitsMax && structure.hits < maxHits;
                        }
                    });
                    if(target) {
                        common.setCachedObject(creep, 'repairer_repairing', target, 20);
                        break;
                    }
                }
            }
            if(target) {
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                target = common.getCachedObject(creep, 'repairer_building');
                if(target == ERR_NOT_FOUND) {
                    target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                    common.setCachedObject(creep, 'repairer_building', target, 20);
                }
                if(target) {
                    if(creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
			}
	    }
	    else {
            common.getEnergy(creep);
	    }
	}
};

module.exports = roleRepairer;