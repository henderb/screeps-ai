var common = require('common');
var roads = require('roads');

var roleRemoteHarvester = {

    /** @param {Spawn} spawn
        @param {int} resources 
    **/
    create: function(spawn, resources) {
        var body = [WORK,CARRY,MOVE];
        var cost = 200;
        resources -= 200;
        if(resources >= 250) {
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
            body.push(MOVE);
            resources -= 250;
            cost += 250;
        }
        if(resources >= 100) {
            body.unshift(CARRY);
            body.unshift(MOVE);
            resources -= 100;
            cost += 100;
        }
        if(resources >= 50) {
            body.unshift(MOVE);
            resources -= 50;
            cost += 50;
        }

        var newName = spawn.createCreep(body, undefined, {role: 'remoteHarvester'});
        if(newName < 0) {
            newName = common.getErrorString(newName);
        } else {
            if(!spawn.memory.remoteHarvestRooms) {
                spawn.memory.remoteHarvestRooms = ['E47S91', 'E45S91'];
            }

            // Find a room to harvest from
            room = spawn.memory.remoteHarvestRooms[Math.floor(Math.random() * spawn.memory.remoteHarvestRooms.length)];
            Game.creeps[newName].memory.target = {
                'room': room,
                'x': 25,
                'y': 25,
            }
            Game.creeps[newName].memory.home = {
                'room': spawn.room.name,
            }
            Game.creeps[newName].memory.benefit = 0 - cost;
            console.log('New remoteHarvester picked room: ' + room);
        }
        console.log(spawn, 'Spawning new remoteHarvester: ' + newName + ' with body ' + body);
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

            // Repair roads
            target = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_ROAD
                                && structure.hits < structure.hitsMax
                                && Memory.roads[structure.room.name][structure.pos.x + ',' + structure.pos.y] > 1500)
                }
            });
            if(target) {
                creep.repair(target);
            } else {
                // Build roads
                target = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
                if(target) {
                    // Don't waste moves going to a build site. It should be building it's own roads.
                    creep.build(target)
                } else {
                    // Improve harvesting efficiency by building a road eventually
                    roads.buildOne(creep.pos);
                }
            }

            if(creep.memory.home.room != creep.room.name) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.home.room), { reusePath: 20 });
                roads.recordUse(creep.body, creep.pos);
            } else {
                // Deliver energy
                var target = common.getCachedObject(creep, 'remoteHarvester_container')
                if(target == ERR_NOT_FOUND) {
                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_CONTAINER ||
                                    structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
                        }
                    });
                    common.setCachedObject(creep, 'remoteHarvester_container', target, 100);
                }
                if(target) {
                    creep.repair(target);
                    currentEnergy = creep.carry[RESOURCE_ENERGY];
                    if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                        roads.recordUse(creep.body, creep.pos);
                    } else {
                        creep.memory.benefit += currentEnergy;
                    }
                }
            }
        } else { // We are harvesting
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
                target = new RoomPosition(creep.memory.target['x'], creep.memory.target['y'], creep.memory.target['room']);
                if(creep.room.name != creep.memory.target['room']) {
                    creep.moveTo(target, { reusePath: 20 });
                } else {
                    var source = target.lookFor(LOOK_SOURCES)[0];
                    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                        roads.recordUse(creep.body, creep.pos);
                    } else {
                        source = creep.pos.findClosestByPath(FIND_SOURCES);
                        if(source) {
                            creep.memory.target['x'] = source.pos.x;
                            creep.memory.target['y'] = source.pos.y;
                        } else {
                            creep.moveTo(target, { reusePath: 20 });
                        }
                    }
                }
            }
        }
	}
};

module.exports = roleRemoteHarvester;