import { BreezeLogic } from './breezelogic.js';
import { Settings } from './settings.js';
import { Utils } from './utils.js';


let sceneTokens = [];
//to prevent over looping tokens are handled here. 

Hooks.once('i18nInit', () => { 
    Settings.registerSettings();
  });

Hooks.on('canvasInit', (_canvas) => {  
    if(Utils.shouldHandle()){
        sceneTokens.length = 0;
        sceneTokens = Utils.createTokenArray();
    }
  });

Hooks.on('canvasReady', (_canvas) => {  
    if(Utils.shouldHandle()){
        sceneTokens.length = 0;
        sceneTokens =  Utils.createTokenArray();
    }
  });

Hooks.on('canvasTeardown', (_canvas) => {  
    if(Utils.shouldHandle()){
        sceneTokens.length = 0;
        return;
    }
  });

Hooks.on('combatTurn', async (combat, update) => {
	if (combat.started) {
		BreezeLogic.AuraHoTUpdate(combat, update);
        console.log("CombatTurn");
	}
});
Hooks.on('combatRound', async (combat, update) => {
	if (combat.started) {
		BreezeLogic.AuraHoTUpdate(combat, update);
        console.log("CombatRound");
	}
});
Hooks.on('pf1ToggleActorBuff',  async(actor, itemData) =>{
    console.log("Fucking do shit");
})
