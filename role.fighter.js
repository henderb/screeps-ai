var common = require('common');

var roleFighter = {

    /** @param {Spawn} spawn
        @param {int} resources 
    **/
    create: function(spawn, resources) {
        var body = [TOUGH,ATTACK,MOVE,MOVE];
        resources -= 190;
        if(resources >= 200) {
            body.push(RANGED_ATTACK);
            body.push(MOVE);
            resources -= 200;
        }
        while(resources >= 130) {
            body.push(ATTACK);
            body.push(MOVE);
            resources -= 130;
        }
        while(resources >= 60) {
            body.unshift(TOUGH);
            body.push(MOVE);
            resources -= 60;
        }
        if(resources >= 50) {
            body.push(MOVE);
            resources -= 50;
        }
        var newName = spawn.createCreep(body, undefined, {role: 'fighter'});
        if(newName < 0) {
            newName = common.getErrorString(newName);
        }
        console.log('Spawning new fighter: ' + newName + ' with body ' + body);
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        var enemy = false;
        var rangedEnemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
        if(rangedEnemies && rangedEnemies.length > 1) {
            creep.rangedMassAttack();
            enemy = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        } else if(rangedEnemies && rangedEnemies.length == 1) {
            creep.rangedAttack(rangedEnemies[0]);
            enemy = rangedEnemies[0];
        } else {
            enemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
        }
        if(enemy) {
            if(creep.attack(enemy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(enemy);
            }
        } else {
            enemy = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
            if(enemy) {
                if(creep.attack(enemy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(enemy);
                }
            } else {
                enemy = creep.pos.findClosestByPath(FIND_HOSTILE_CONSTRUCTION_SITES)
                if(enemy) {
                    // Moving on top of construction sites ends them
                    creep.moveTo(enemy);
                } else {
                    if(Game.flags['FighterFlag']) {
                        creep.moveTo(Game.flags['FighterFlag'])
                    }
                }
            }
	    }
	}
};

module.exports = roleFighter;