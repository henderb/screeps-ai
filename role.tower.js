var common = require('common');

var roleTower = {

    /** @param {Tower} tower **/
    run: function(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            status = tower.attack(closestHostile);
            //console.log("Tower attacking creep: " + closestHostile + "; status: " + common.getErrorString(status));
        } else {
            var creep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (creep) => creep.hits < creep.hitsMax
            });
            if(creep) {
                status = tower.heal(creep);
                //console.log("Tower healing creep: " + creep + "; status: " + common.getErrorString(status));
            } else {
                var closestDamagedStructure = false;
                if(tower.energy > tower.energyCapacity * .75) {
                    for(var maxHits = 1000; maxHits < 1000000000; maxHits = maxHits * 2) {
                        closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType != STRUCTURE_ROAD && structure.hits < structure.hitsMax && structure.hits < maxHits)
                                    || (structure.structureType == STRUCTURE_ROAD && Memory.roads[structure.room.name][structure.pos.x + ',' + structure.pos.y] > 1500 && structure.hits < structure.hitsMax && structure.hits < maxHits)
                            }
                        });
                        if(closestDamagedStructure) {
                            break;
                        }
                    }
                }
                if(closestDamagedStructure) {
                    status = tower.repair(closestDamagedStructure);
                    //console.log("Tower reparing structure: " + closestDamagedStructure.pos + "; status: " + common.getErrorString(status));
                }
            }
        }
    }
}

module.exports = roleTower;