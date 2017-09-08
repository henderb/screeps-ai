var common = require('common');

var roleContainerizer = {

    /** @param {Spawn} spawn
        @param {int} resources 
    **/
    create: function(spawn, resources) {
        // Limit resources to build one step above 10/tick source replenishment rate
        resources = Math.min(resources, 850);
        var body = [WORK,CARRY,MOVE];
        resources -= 200;
        while(resources >= 100) {
            body.unshift(WORK);
            resources -= 100;
        }
        if(resources >= 50) {
            body.push(MOVE);
            resources -= 50;
        }
        var newName = spawn.createCreep(body, undefined, {role: 'containerizer'});
        if(newName < 0) {
            newName = common.getErrorString(newName);
        }
        console.log('Spawning new containerizer: ' + newName + ' with body ' + body);
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        if(!creep.memory.my_source) {
            var sources = creep.room.find(FIND_SOURCES);
            var sourceIDs = sources.map(function(s){ return s.id; });
            var otherContainerizers = creep.room.find(FIND_MY_CREEPS, {
                filter: (creep) => {
                    return creep.memory.role == 'containerizer' && creep.memory.my_source;
                }
            })
            if(otherContainerizers.length == 0) {
                creep.memory.my_source = creep.pos.findClosestByPath(FIND_SOURCES).id;
            } else {
                //console.log(otherContainerizers);
                for(var c in otherContainerizers) {
                    sourceIDs.splice(sourceIDs.indexOf(otherContainerizers[c].memory.my_source), 1)
                }
                if(sourceIDs[0]) {
                    creep.memory.my_source = sourceIDs[0];
                }
            }
        }

        if(creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
	    }
	    if(!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.delivering = true;
	    }

	    if(creep.memory.delivering) {
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
                }
            });
            if(target) {
                creep.repair(target);
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        } else {
            var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1)[0];
            if(droppedEnergy) {
                if(creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE){
                    creep.moveTo(droppedEnergy);
                }
            } else {
                var source = Game.getObjectById(creep.memory.my_source);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
	}
};

module.exports = roleContainerizer;