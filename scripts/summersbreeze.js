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

Hooks.on('combatTurn', (combat, update, _options) => {
        console.log(combat);
        console.log(update);
        console.log("Fucking do shit");
});

Hooks.on('pf1ToggleActorBuff',  async(actor, itemData) =>{
    console.log("Fucking do shit");
})
