
var roleContainerizer = require('role.containerizer');
var roleHarvester = require('role.harvester');
var roleRemoteHarvester = require('role.remoteHarvester');
var roleUpgrader = require('role.upgrader');
var roleRepairer = require('role.repairer');
var roleBuilder = require('role.builder');
var roleFighter = require('role.fighter');
var roleTower = require('role.tower');
var roleTowerTender = require('role.towertender');
var roleMiner = require('role.miner');
var roleColonizer = require('role.colonizer');
var roleJanitor = require('role.janitor');

var roads = require('roads');

// Units are constructed in this order 
var fleet = {
}

module.exports.loop = function () {

    if(Game.cpu.bucket > 500) {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }}

    if(Game.time % 5 == 0) {
        for(var spawnName in Game.spawns) {
            var spawn = Game.spawns[spawnName];
            var current = false;

            // Initialize spawn memory with defaults
            if(spawn.memory.units == null) {
                spawn.memory.units = {}
            }
            if(spawn.memory.units.builder == null) {
                spawn.memory.units.builder = 1;
            }
            if(spawn.memory.units.containerizer == null) {
                spawn.memory.units.containerizer = spawn.room.find(FIND_SOURCES).length;
            }
            if(spawn.memory.units.fighter == null) {
                spawn.memory.units.fighter = 1;
            }
            if(spawn.memory.units.harvester == null) {
                spawn.memory.units.harvester = 1;
            }
            if(spawn.memory.units.remoteHarvester == null) {
                spawn.memory.units.remoteHarvester = 0;
            }
            if(spawn.memory.units.repairer == null) {
                spawn.memory.units.repairer = 1;
            }
            if(spawn.memory.units.towertender == null) {
                spawn.memory.units.towertender = 1;
            }
            if(spawn.memory.units.upgrader == null) {
                spawn.memory.units.upgrader = spawn.room.find(FIND_SOURCES).length;
            }
            if(spawn.memory.units.miner == null) {
                spawn.memory.units.miner = 0;
            }
            if(spawn.memory.units.colonizer == null) {
                spawn.memory.units.colonizer = 0;
            }
            if(spawn.memory.units.janitor == null) {
                spawn.memory.units.janitor = 0;
            }

            // Spawn new creeps
            current = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.room.name == spawn.room.name);
            if(!current || current.length < spawn.memory.units.harvester) {
                // Don't wait for harvester to fill build energy if we don't have a harvester.
                if(current.length == 0) {
                    roleHarvester.create(spawn, spawn.room.energyAvailable);
                } else {
                    roleHarvester.create(spawn, spawn.room.energyCapacityAvailable);
                }
            } else {
                current = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == spawn.room.name);
                if(!current || current.length < spawn.memory.units.upgrader) {
                    // Don't wait for harvester to fill build energy if we have not done an upgrade delivery for too long.
                    if(spawn.room.controller.ticksToDowngrade < 10000) {
                        roleUpgrader.create(spawn, spawn.room.energyAvailable);
                    } else {
                        roleUpgrader.create(spawn, spawn.room.energyCapacityAvailable);
                    }
                } else {
                    current = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == spawn.room.name);
                    if(!current || current.length < spawn.memory.units.builder) {
                        roleBuilder.create(spawn, spawn.room.energyCapacityAvailable);
                    }

                    current = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.room.name == spawn.room.name);
                    if(!current || current.length < spawn.memory.units.repairer) {
                        roleRepairer.create(spawn, spawn.room.energyCapacityAvailable);
                    }

                    current = _.filter(Game.creeps, (creep) => creep.memory.role == 'towertender' && creep.room.name == spawn.room.name);
                    if(!current || current.length < spawn.memory.units.towertender) {
                        if(spawn.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER }}).length > 0) {
                            roleTowerTender.create(spawn, spawn.room.energyCapacityAvailable);
                        }
                    }

                    current = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteHarvester' && creep.memory.home['room'] == spawn.room.name);
                    if(!current || current.length < spawn.memory.units.remoteHarvester) {
                        roleRemoteHarvester.create(spawn, spawn.room.energyCapacityAvailable);
                    }

                    current = _.filter(Game.creeps, (creep) => creep.memory.role == 'fighter' && creep.room.name == spawn.room.name);
                    if(!current || current.length < spawn.memory.units.fighter) {
                        if(spawn.room.find(FIND_HOSTILE_CREEPS).length > 0
                            || spawn.room.find(FIND_HOSTILE_CONSTRUCTION_SITES).length > 0
                            || spawn.room.find(FIND_HOSTILE_STRUCTURES).length > 0) {
                            roleFighter.create(spawn, spawn.room.energyAvailable);
                        }
                    }

                    current = _.filter(Game.creeps, (creep) => creep.memory.role == 'containerizer' && creep.room.name == spawn.room.name);
                    if(!current || current.length < spawn.memory.units.containerizer) {
                        if(spawn.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER }}).length > 0) {
                            if(current.length < spawn.memory.units.containerizer - 1) {
                                // We're behind on energy and containerizers are critical to energy production
                                roleContainerizer.create(spawn, spawn.room.energyAvailable);
                            } else {
                                roleContainerizer.create(spawn, spawn.room.energyCapacityAvailable);
                            }
                        }
                    }

                    current = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.room.name == spawn.room.name);
                    if(!current || current.length < spawn.memory.units.miner) {
                        roleMiner.create(spawn, spawn.room.energyCapacityAvailable);
                    }

                    current = _.filter(Game.creeps, (creep) => creep.memory.role == 'janitor' && creep.room.name == spawn.room.name);
                    if(!current || current.length < spawn.memory.units.janitor) {
                        roleJanitor.create(spawn, spawn.room.energyCapacityAvailable);
                    }

                    current = _.filter(Game.creeps, (creep) => creep.memory.role == 'colonizer');
                    if(!current || current.length < spawn.memory.units.colonizer) {
                        roleColonizer.create(spawn, spawn.room.energyCapacityAvailable);
                        spawn.memory.units.colonizer = spawn.memory.units.colonizer - 1;
                    }
                }
            }
        }
    }

    for(var id in Game.structures) {
        var structure = Game.structures[id];
        if(structure.structureType == STRUCTURE_TOWER) {
            roleTower.run(structure);
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'containerizer') {
            roleContainerizer.run(creep);
        }
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'fighter') {
            roleFighter.run(creep);
        }
        if(creep.memory.role == 'towertender') {
            roleTowerTender.run(creep);
        }
        if(creep.memory.role == 'remoteHarvester') {
            roleRemoteHarvester.run(creep);
        }
        if(creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if(creep.memory.role == 'colonizer') {
            roleColonizer.run(creep);
        }
        if(creep.memory.role == 'janitor') {
            roleJanitor.run(creep);
        }
    }

    roads.decayUse()

    // Trading
    market_pricing = {
        'energy': .035,
        'power': 5,

        'H': .075,
        'O': .075,
        'U': .075,
        'L': .075,
        'K': .075,
        'Z': .075,
        'X': .150,
        'G': .300,

        'OH': .150,
        'ZK': .150,
        'UL': .150,

        'UH': .150,
        'UO': .150,
        'KH': .150,
        'KO': .150,
        'LH': .150,
        'LO': .150,
        'ZH': .150,
        'ZO': .150,
        'GH': .375,
        'GO': .375,

        'UH2O': .300,
        'UHO2': .300,
        'KH2O': .300,
        'KHO2': .300,
        'LH2O': .300,
        'LHO2': .300,
        'ZH2O': .300,
        'ZHO2': .300,
        'GH2O': .525,
        'GHO2': .525,

        'XUH2O': .450,
        'XUHO2': .450,
        'XKH2O': .450,
        'XKHO2': .450,
        'XLH2O': .450,
        'XLHO2': .450,
        'XZH2O': .450,
        'XZHO2': .450,
        'XGH2O': .675,
        'XGHO2': .675,
    }

    if(Game.time % 11 == 1) {
        for(roomName in Game.rooms) {
            room = Game.rooms[roomName];
            if(room.terminal) {
                energyAvailable = room.terminal.store.energy
                for(resourceName in room.terminal.store) {
                    if(resourceName == RESOURCE_ENERGY && energyAvailable < 10000) {
                        continue;
                    }
                    console.log("[terminal", room.name + "]", resourceName, room.terminal.store[resourceName])
                    tradeAmount = Math.min(room.terminal.store[resourceName], 200);
                    orders = Game.market.getAllOrders(order => order.resourceType == resourceName 
                                                                && order.type == ORDER_BUY
                                                                && order.price >= market_pricing[order.resourceType]
                                                                && Game.market.calcTransactionCost(tradeAmount, room.name, order.roomName) < Math.min(energyAvailable, tradeAmount * 1));
                    //console.log(JSON.stringify(orders));
                    if(orders.length > 0) {
                        //orders.sort(function(a,b) { return Game.market.calcTransactionCost(200, room.name, b.roomName) - Game.market.calcTransactionCost(200, room.name, a.roomName); })
                        orders.sort(function(a,b) { return b.price - a.price; })
                        //console.log('Best price', orders[0].price, Game.market.calcTransactionCost(200, room.name, orders[0].roomName));
                        tradeAmount = Math.min(tradeAmount, orders[0].amount);
                        energyUsed = Game.market.calcTransactionCost(tradeAmount, room.name, orders[0].roomName);
                        if(Game.market.deal(orders[0].id, tradeAmount, room.name) == OK) {
                            console.log("[terminal", room.name + "]", "Sold", tradeAmount, orders[0].resourceType, "to", orders[0].roomName, "at", orders[0].price, "for", orders[0].price * tradeAmount, "using", energyUsed, "energy");
                        }
                    }
                }
            }
        }
    }

    if(Game.cpu.bucket < 1000) {
        console.log("CPU Bucket low:", Game.cpu.bucket)
    }
}