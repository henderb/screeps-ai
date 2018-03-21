var roads = require('roads');

var common = {

    initCached: function(creep, key) {
        if(!creep.memory.cached) {
            creep.memory.cached = {};
        }
    },

    setCached: function(creep, key, value, ttl) {
        this.initCached(creep, key);
        creep.memory.cached[key] = {
            'value': value,
            'ttl': ttl,
            'tick': Game.time,
        }
    },

    invalidateCached: function(creep, key) {
        this.setCached(creep, key, 0, 0)
    },

    invalidateCachedObject: function(creep, key) {
        this.setCached(creep, key, 0, 0)
    },

    getCached: function(creep, key) {
        this.initCached(creep, key);
        if(creep.memory.cached[key]) {
            if(creep.memory.cached[key]['ttl'] > Game.time - creep.memory.cached[key]['tick']) {
                //console.log('Cached key', creep, key);
                return creep.memory.cached[key]['value'];
            } else {
                //console.log('Cached key expired', creep, key);
                return ERR_NOT_FOUND;
            }
        } else {
            this.invalidateCached(creep, key)
            //console.log('New cached key', creep, key);
            return ERR_NOT_FOUND;
        }
    },

    setCachedObject: function(creep, key, object, ttl) {
        if(object) {
            this.setCached(creep, key, object.id, ttl);
        }
    },

    getCachedObject: function(creep, key) {
        id = this.getCached(creep, key);
        if(id != ERR_NOT_FOUND) {
            return Game.getObjectById(id);
        }
        return ERR_NOT_FOUND;
    },

    /** @param {Creep} creep **/
    getEnergy: function(creep) {
        var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 8)[0];
        if(droppedEnergy) {
            //console.log(creep.name + " heading to pickup droppedEnergy: " + droppedEnergy.pos)
            if(creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE){
                creep.moveTo(droppedEnergy, { reusePath: 20 });
                roads.recordUse(creep.body, creep.pos);
            }
        } else {
            var container = this.getCachedObject(creep, 'getEnergy_container');
            if(container == ERR_NOT_FOUND) {
                container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] > creep.carryCapacity - creep.carry[RESOURCE_ENERGY];
                    }
                });
                this.setCachedObject(creep, 'getEnergy_container', container, 20);
            }
            if(container){
                //console.log(creep.name + " heading to pickup from container: " + container.pos)
                if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, { reusePath: 20 });
                    roads.recordUse(creep.body, creep.pos);
                }
            } else {
                var source = this.getCachedObject(creep, 'getEnergy_source');
                if(source == ERR_NOT_FOUND) {
                    source = creep.pos.findClosestByPath(FIND_SOURCES);
                    this.setCachedObject(creep, 'getEnergy_source', source, 20);
                }
                //console.log(creep.name + " heading to pickup from source: " + source.pos)
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { reusePath: 20 });
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