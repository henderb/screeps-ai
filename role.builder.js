var common = require('common');
var roads = require('roads');

var roleBuilder = {

    /** @param {Spawn} spawn
        @param {int} resources 
    **/
    create: function(spawn, resources) {
        var body = [WORK,CARRY,MOVE];
        resources = Math.min(resources, 1150)
        resources -= 200;
        while(resources >= 250) {
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
            body.push(MOVE);
            resources -= 250;
        }
        if(resources >= 100) {
            body.push(CARRY);
            body.push(MOVE);
            resources -= 100;
        }
        if(resources >= 50) {
            body.push(MOVE);
            resources -= 50;
        }
        var newName = spawn.createCreep(body, undefined, {role: 'builder'});
        if(newName < 0) {
            newName = common.getErrorString(newName);
        }
        console.log(spawn, 'Spawning new builder: ' + newName + ' with body ' + body);
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
	        var target = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
				}
            } else {
                // Avoid burning cpu burst down to zero with the sort. 9000 might be in use it or loose it range.
                if(Game.cpu.bucket >= 9000) {
                    roads.buildOne(creep.pos);
                } else {
                    target = false;
                    for(var maxHits = 1000; maxHits < 1000000000; maxHits = maxHits * 2) {
                        target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType != STRUCTURE_ROAD && structure.hits < structure.hitsMax && structure.hits < maxHits)
                                    || (structure.structureType == STRUCTURE_ROAD && Memory.roads[structure.room.name][structure.pos.x + ',' + structure.pos.y] > 1500)
                            }
                        });
                        if(target) {
                            break;
                        }
                    }
                    if(target) {
                        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                }
			}
	    }
	    else {
            common.getEnergy(creep);
	    }

        if(creep.memory.room != null && creep.memory.room != creep.room.name) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.room), { reusePath: 20 });
        }
	}
};

module.exports = roleBuilder;