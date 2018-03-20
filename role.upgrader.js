var common = require('common');
var roads = require('roads');

var roleUpgrader = {

    /** @param {Spawn} spawn
        @param {int} resources 
    **/
    create: function(spawn, resources) {
        var body = [WORK,CARRY,MOVE];
        resources -= 200;
        part_limit = 2;
        while(resources >= 200 && part_limit > 0) {
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
            resources -= 200;
            part_limit -= 1;
        }
        if(resources >= 150) {
            body.push(WORK);
            body.push(MOVE);
            resources -= 150;
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
        var newName = spawn.createCreep(body, undefined, {role: 'upgrader'});
        if(newName < 0) {
            newName = common.getErrorString(newName);
        }
        console.log(spawn, 'Spawning new upgrader: ' + newName + ' with body ' + body);
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	    }

	    if(creep.memory.upgrading) {
            if(Game.flags['UpgradeFlag']) {
                creep.moveTo(Game.flags['UpgradeFlag'])
                roads.recordUse(creep.body, creep.pos);
            }
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
                roads.recordUse(creep.body, creep.pos);
            }
        }
        else {
            common.getEnergy(creep);
        }
	}
};

module.exports = roleUpgrader;