var common = require('common');

var roleJanitor = {

    /** @param {Spawn} spawn
        @param {int} resources 
    **/
    create: function(spawn, resources) {
        resources = Math.min(resources, 900);
        var body = [CARRY,MOVE];
        resources -= 100;
        while(resources >= 100) {
            body.unshift(CARRY);
            body.push(MOVE);
            resources -= 100;
        }
        var newName = spawn.createCreep(body, undefined, {role: 'janitor'});
        if(newName < 0) {
            newName = common.getErrorString(newName);
        }
        console.log(spawn, 'Spawning new janitor: ' + newName + ' with body ' + body);
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
            var tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter: (tombstone) => {
                    return _.sum(tombstone.store) > 0;
                }
            })
            if(tombstone) {
                for(resourceType in tombstone.store) {
                    result = creep.withdraw(tombstone, resourceType);
                    //console.log("Janitor found tombstone", tombstone.pos, common.getErrorString(result));
                    if(result == ERR_NOT_IN_RANGE){
                        creep.moveTo(tombstone);
                    }
                }
            } else {
                var droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                if(droppedEnergy) {
                    //console.log("Janitor found dropped resources", droppedEnergy.pos);
                    if(creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE){
                        creep.moveTo(droppedEnergy);
                    }
                } else {
                    var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (container) => {
                            return container.structureType == STRUCTURE_CONTAINER
                                    && _.sum(container.store) - container.store.energy > 0;
                        }
                    })
                    if(container) {
                        for(resourceType in container.store) {
                            result = creep.withdraw(container, resourceType);
                            //console.log("Janitor found container", container.pos, common.getErrorString(result));
                            if(result == ERR_NOT_IN_RANGE){
                                creep.moveTo(container);
                            }
                        }
                    } else {
                        creep.memory.delivering = true;
                    }
                }
            }
        }

        if(creep.memory.room != null && creep.memory.room != creep.room.name) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.room), { reusePath: 20 });
        }
	}
};

module.exports = roleJanitor;