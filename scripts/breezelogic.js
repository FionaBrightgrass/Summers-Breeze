//Synopsis: Copies aura buffs between actors in the Pathfinder 1.E system in FoundryVTT
//
//Create by:   Fiona       
//Date:         10/7/23
//
//Details:
let params =
[{
    filterType: "glow",
    filterId: "mySuperSpookyGlow",
    distance: 10,
    outerStrength: 4,
    autoDestroy: true,
    innerStrength: 0,
    color: 0x003000,
    quality: 0.5,
    padding: 10,
    animated:
    {
        color: 
        {
           active: true, 
           loopDuration: 2000, 
           loops: 1,
           animType: "colorOscillation", 
           val1:0xFFFF20, 
           val2:0xFFD040
        }
    }
}];

export class BreezeLogic{
    static async AuraHoTUpdate(combat, update) {
        let turnToken = combat.combatant.token;
        let canvasTokens = canvas.tokens.placeables;
        let actor = turnToken.actor;
        let aura = (actor.items?.filter(o => o.system?.flags?.dictionary?.HoTradius > 0));
        if(aura[0]){
            //console.log(aura[0])
            let HoTPotency = aura[0].system.flags.dictionary.HoTpotency;
            let HoTRadius = aura[0].system.flags.dictionary.HoTradius;
            let HoTActive = aura[0].system.active;
            let rounds = turnToken.actor.getFlag("core", "HoTRounds");
            if(rounds > 0 && HoTActive){
                canvasTokens.forEach(canvasToken => {
                    if (canvasToken.actor.disposition == turnToken.actor.disposition){
                        let distance = canvas.grid.measureDistance(turnToken, canvasToken);
                        //console.log(distance);
                        if(distance <= HoTRadius){
                            //console.log(canvasToken);
                            let currenthp = canvasToken.actor.data.data.attributes.hp.value;
                            let maxHP = canvasToken.actor.data.data.attributes.hp.max;
                            let newHPValue = (currenthp + Number(HoTPotency));
                            if (currenthp != maxHP){
                                if (newHPValue >= maxHP) {
                                    canvasToken.actor.update({"data.attributes.hp.value" : maxHP});
                
                                }else{
                                    canvasToken.actor.update({"data.attributes.hp.value" : newHPValue});
                                }
                                AudioHelper.play({src: "https://assets.forge-vtt.com/5f513c51af628455315890ce/Regen.mp3", volume: 0.05, autoplay: true, loop: false}, true);
                                try{
                                    TokenMagic.addFilters(canvasToken, params, false);
                                }catch{
                                }
                            }

                        }
                    }
                });	
                let remainingRounds = turnToken.actor.getFlag("core", "HoTRounds");
                if(remainingRounds){
                    remainingRounds -= 1;
                    //console.log(remainingRounds);
                    turnToken.actor.setFlag("core", "HoTRounds", remainingRounds);
                }else{
                    turnToken.actor.setFlag("core", "HoTRounds", 0);
                }
            }
            else{
                //console.log("Time's up");
                aura[0].setActive(false);
                aura[0].system.active = false;
            }
        }
        return;
    }

    static async ActivateHoT(actor, itemData) {
        if(itemData.system.active){
            let duration = itemData.system.flags.dictionary.HoTrounds
            actor.setFlag("core", "HoTRounds", duration);
        }
        return;
    }
}