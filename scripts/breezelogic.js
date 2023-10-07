//Synopsis: Copies aura buffs between actors in the Pathfinder 1.E system in FoundryVTT
//
//Create by:   Fiona       
//Date:         10/7/23
//
//Details:

export class BreezeLogic{

    static async applyHealing(parentToken){
        return;
    }

    static async AuraHoTUpdate(combat, update) {
        let turnToken = combat.combatant.token;
        let canvasTokens = canvas.tokens.placeables;
        let actor = turnToken.actor;
        aura = (actor.items?.filter(o => o.system?.flags?.dictionary?.HoT > 0));
        if(aura[0]){
            let HoTPotency = aura[0].system.flags.dictionary.HoTpotency;
            let HoTRadius = aura[0].system.flags.dictionary.HoTradius;
            let rounds = aura[0].system.flags.dictionary.HoTrounds;
            if(rounds > 0){
                canvasTokens.forEach(canvasToken => {
                    if (canvasToken.actor.disposition == turnToken.actor.disposition){
                        let distance = canvas.grid.measureDistance(turnToken, canvasToken);
                        if(distance >= HoTRadius){
                            let currenthp = canvasToken.actor.data.data.attributes.hp.value;
                            let maxHP = canvasToken.actor.data.data.attributes.hp.max;
                            let newHPValue = (currenthp + HoTPotency);
                            if (currenthp != maxHP){
                                if (newHPValue >= maxHP) {
                                    canvasToken.actor.update({"data.attributes.hp.value" : maxHP});
                
                                }else{
                                    canvasToken.actor.update({"data.attributes.hp.value" : newHPValue});
                                }
                                AudioHelper.play({src: "https://assets.forge-vtt.com/5f513c51af628455315890ce/Regen.mp3", volume: 0.1, autoplay: true, loop: false}, true);
                            }
                        }
                    }
                });	
            }
            else{
                console.log("Time's up");
            }
        }
        return;
    }


    static async refreshAuras(parentToken, childTokens, deleteOnly){
        //Main loop to reresh auras on all tokens relative to the parent token.
        //console.log(Date.now() + " Starting refreshAuras")
        let giveAuras = this.getAuras(parentToken, true);
        //console.log(Date.now() + " getAuras complete.")
        Promise.all(childTokens.map(async (childToken) => {
            if(childToken?.id != parentToken?.id){
                //console.log(Date.now() + " In first promise")
                let receiveAuras = this.getAuras(childToken, true);
                //console.log(Date.now() + " Ran getAuras on child token.")
                if(giveAuras?.length > 0){
                    if(deleteOnly){
                        //this flag is meant for when a token is deleted or dies.
                        this.clearSingleAuraSet(parentToken, giveAuras, childToken);
                        //console.log(Date.now() + " Cleared Aura Set")
                    }else{
                        this.applyActorAuras(parentToken, giveAuras, childToken);
                        //console.log(Date.now() + " Applied parent actor's auras to child.")
                        //PARENT  ->   CHILD
                    }
                }
                if(receiveAuras?.length > 0){
                     this.applyActorAuras(childToken, receiveAuras, parentToken);
                     //console.log(Date.now() + " Applied child actor's auras to parent.")
                    //CHILD   ->   PARENT
                }
            }
        }))
        return;
    }
    
    static async applyActorAuras(parentToken, parentAuras, childToken){
        //Secondary loop to apply all auras from a parent to a child.
        let distance = canvas.grid.measureDistance(childToken, parentToken); 
        let aurasToAdd = [];
        let aurasToRemove = [];
        let parentActor = parentToken.actor;
        if(parentAuras?.length > 0 && distance != undefined){
            Promise.all(parentAuras.map(async (parentAura) => {
                let newAura = this.generateChildAura(parentActor, parentAura);
                if(this.validateLifeform(parentActor) && this.validateAura(parentAura, distance, parentToken, parentActor, childToken)){
                    //Is the actor alive, or do they have the diehard feat? And is the aura even in range and valid?
                    aurasToAdd.push(newAura);
                }else{
                    //If not we can remove the aura.
                    aurasToRemove.push(newAura);
                }
            }));
        }
        if(aurasToAdd.length > 0){
            this.addAuras(aurasToAdd, childToken);
        }
        if(aurasToRemove.length > 0){
            if(game.settings.get('aurashare', 'DeleteAuras')){
                //Toggles delete and remove
                this.deleteAuras(aurasToRemove, childToken);
            }else{
                this.deactivateAuras(aurasToRemove, childToken);
            }
        }
        return;
    }

    static getAuras(token, getParentAuras){
        //will filter for parent/child auras automatically using the booleon getParentAuras flag:
        let auras = [];
        //console.log(Date.now() + " In Get Auras.")
        let auraActor = token.actor;
        //^^^ Do not use token.getActor() as it adds 40ms per loop!!!!!!!!!!!!!
        var x = {};
        //console.log(auraActor.itemTypes.buff.length);
        //Check to see if the actor has a buff with a flag and then calculate auras. 
        if(auraActor.itemTypes.buff.length > 0){ 
            //console.log(Date.now() + " In aura loop for getAuras.")
            if(getParentAuras == true){
                auras = (auraActor.items?.filter(o => o.system?.flags?.dictionary?.radius > 0));
                //Auras with a radius greater than 0 share.
            }else{
                auras = (auraActor.items?.filter(o => o.system?.flags?.dictionary?.radius === 0)); 
                //likewise auras with a radius of 0 do not share.
            }
        }
        return auras;
    }

    static async clearSingleAuraSet(parentToken, parentAuras, childToken){
        let aurasToRemove = [];
        if(parentAuras?.length > 0 ){
            //push all auras to an array:
            Promise.all(parentAuras.map(async (parentAura) => {
                let parentActor = parentToken.actor;
                let newAura = this.generateChildAura(parentActor, parentAura);
                aurasToRemove.push(newAura);
            }));
        }
        if(aurasToRemove.length > 0){
            if(game.settings.get('aurashare', 'DeleteAuras')){
                //deletes or deactives
                this.deleteAuras(aurasToRemove, childToken);
            }else{
                this.deactivateAuras(aurasToRemove, childToken);
            }
        }
        return;
    }

    static addAuras(auras, childToken){  
        let aurasToAdd = [];
        let childActor = childToken.actor;
        Promise.all(auras.map(async (aura) => {
            let foundAura = childActor.items?.getName(aura.name); 
            if(!foundAura){
                aurasToAdd.push(aura);
            }else                       
            {
                foundAura.setActive(true);                         
            }
        }));
        if(aurasToAdd?.length > 0){
            childToken.actor.createEmbeddedDocuments('Item', aurasToAdd); 
        }
        return;
    }

    static deleteAuras(auras, childToken){
        let childActor = childToken.actor;
        let auraIDsToDelete = [];
        //we're making an array containing aura objects, but only if the name matches an existing aura.
        Promise.all(auras.map(async (aura) => {
            let foundAura = childActor.items.getName(aura.name) ?? childActor.getEmbeddedDocument('Item', aura._id);
            if(foundAura){
                auraIDsToDelete.push(foundAura._id);
            }
        }));
        if(auraIDsToDelete?.length > 0){
            childToken.actor.deleteEmbeddedDocuments('Item', auraIDsToDelete);
            //remove the aura documents from the actor
        }
        return;
    }

    static deactivateAuras(auras, childToken){
        //Unchecks the "activate" box, basically.
        let childActor = childToken.actor;
        Promise.all(auras.map(async (aura) => {
            let foundAura = childActor.items?.getName(aura.name);
            if(foundAura){
                foundAura.setActive(false);
            }
        }));
        return;
    }

    static clearAllChildAuras(token){
        let auras = this.getAuras(token, false);
        //child auras only.
        if(auras){
            this.deleteAuras(auras, token);                                               
        }
    }

    static generateChildAura(parentActor, parentAura){
        //Converts aura data into child aura data.
        let newAura = parentActor.getEmbeddedDocument('Item', parentAura._id).toObject();
        newAura.name = parentAura.name + " (" + parentActor.name + ")";
        newAura.system.identifiedName = parentAura.name + " (" + parentActor.name + ")";
        newAura.system.flags.dictionary.radius = 0;
        newAura.system.active = true;
        newAura.system.buffType = "temp";
        return newAura;
    }

    static validateAura(parentAura, distance, parentToken, parentActor, childToken){
        //check a bunch of conditionas if an aura can be shared
        if(parentAura.hasItemBooleanFlag('teamwork')){
            let featName = parentAura.getItemDictionaryFlag('feat');
            let feat = childToken.actor.items.getName(featName);
            if(feat === undefined){
                return false;
                //if it's a teamwork feat but the child lacks the feat then return false.
            }
        }
        //console.log(parentToken);
        //console.log(parentAura);
        let radius = this.calculateRadius(parentToken, parentAura);
        let inRange = (distance <= radius);
        let shareIfInactive = this.getInactiveShareFlag(parentAura);
        let correctDisposition = this.validateDisposition(parentToken, childToken, parentAura) ?? true;
        return ((parentAura.system.active || shareIfInactive) && inRange && this.validateLifeform(parentActor, parentAura) && correctDisposition);
    }

    static validateDisposition(parentToken, childToken, aura){
        //Checks if the aura can be shared based on flags and disposition.
        let parentTokenDisposition = parentToken.disposition;
        let childTokenDisposition = childToken.disposition;
        let hostileAura = aura.hasItemBooleanFlag('shareEnemies');
        //Everyone
        if(aura.hasItemBooleanFlag('shareAll')){
            return true;
        }
        //Neutral
        if(aura.hasItemBooleanFlag('shareNeutral') && childTokenDisposition == 0){
            return true;
        }
        //Enemies
        if(hostileAura){
            if(parentTokenDisposition == (childTokenDisposition * -1)){
                return true;
            }
        }
        //Allies
        else{
            if(parentTokenDisposition == childTokenDisposition){
                return true;
            }
        }
        return false;
    }

    static validateLifeform(actor, aura){
        //Bzzztttt check the scanner. Detect lifeforms... bzzzt.
        let allowUnconsciousAuras = game.settings.get('aurashare', 'UnconsciousAuras');
        let shareThreshold = 1;
        if(game.settings.get('aurashare', 'ShareZero')){
            shareThreshold = 0;
            //if they have 0 HP we will share the aura if this flag is on.
        }
        if(aura?.hasItemBooleanFlag('shareUnconscious')){
            return true;
        }
        if (allowUnconsciousAuras){
            return true;
        }
        let hp = actor.system.attributes.hp.value;
        if(hp >= shareThreshold || this.dieHardCheck(actor)){
            return true;
        }
        return false;
    }

    static calculateRadius(token, aura){
        let size = Math.max(token.width, token.height);
        let radius = parseInt(aura.getItemDictionaryFlag('radius')) ?? 0;
        radius = Math.max(radius, 1);
        //We don't need a negative radius.
        radius += (size - 1) * 5;
        radius += parseInt(game.settings.get('aurashare', 'Nudge'));
        return radius;
    }

    static getInactiveShareFlag(aura){
        //Check if an inactive aura should be shared.
        if(aura.hasItemBooleanFlag('shareInactive')){
           return true;
        }
        return false;
    }

    static dieHardCheck(actor){
        let diehardEnabled = game.settings.get('aurashare', 'Diehard');
        let hasDiehardKey = actor.items.find(o => o.flags?.core?.sourceId === "Compendium.pf1.feats.O0e0UCim27GPKFuW");
        if((actor.items.getName('Diehard') || hasDiehardKey) && diehardEnabled){
            return true;
        }
        return false;
    }

}