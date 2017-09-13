var roads = require('roads');

var common = {

    /** @param {Creep} creep **/
    getEnergy: function(creep) {
        var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 8)[0];
        if(droppedEnergy) {
            //console.log(creep.name + " heading to pickup droppedEnergy: " + droppedEnergy.pos)
            if(creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE){
                creep.moveTo(droppedEnergy);
                roads.recordUse(creep.body, creep.pos);
            }
        } else {
            var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] > creep.carryCapacity - creep.carry[RESOURCE_ENERGY];
                }
            });
            if(container){
                //console.log(creep.name + " heading to pickup from container: " + container.pos)
                if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                    roads.recordUse(creep.body, creep.pos);
                }
            } else {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                //console.log(creep.name + " heading to pickup from source: " + source.pos)
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                    roads.recordUse(creep.body, creep.pos);
                }
            }
        }
    },

    getErrorString: function(status) {
        switch(status) {
            case OK:
                return "OK";
            case ERR_NOT_OWNER:
                return "ERR_NOT_OWNER";
            case ERR_NO_PATH:
                return "ERR_NOT_OWNER";
            case ERR_NAME_EXISTS:
                return "ERR_NAME_EXISTS";
            case ERR_BUSY:
                return "ERR_BUSY";
            case ERR_NOT_FOUND:
                return "ERR_NOT_FOUND";
            case ERR_NOT_ENOUGH_ENERGY:
                return "ERR_NOT_ENOUGH_ENERGY";
            case ERR_NOT_ENOUGH_RESOURCES:
                return "ERR_NOT_ENOUGH_RESOURCES";
            case ERR_INVALID_TARGET:
                return "ERR_INVALID_TARGET";
            case ERR_FULL:
                return "ERR_FULL";
            case ERR_NOT_IN_RANGE:
                return "ERR_NOT_IN_RANGE";
            case ERR_INVALID_ARGS:
                return "ERR_INVALID_ARGS";
            case ERR_TIRED:
                return "ERR_TIRED";
            case ERR_NO_BODYPART:
                return "ERR_NO_BODYPART";
            case ERR_NOT_ENOUGH_EXTENSIONS:
                return "ERR_NOT_ENOUGH_EXTENSIONS";
            case ERR_RCL_NOT_ENOUGH:
                return "ERR_RCL_NOT_ENOUGH";
            case ERR_GCL_NOT_ENOUGH:
                return "ERR_GCL_NOT_ENOUGH";
        }
    },
};

module.exports = common;