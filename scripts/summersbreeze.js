import { breezelogic } from './breezelogic.js';
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

Hooks.on('combatTurn', async (combat, update, _options, _userId) => {
    if(Utils.shouldHandle()){
        console.log(update);
    }
});

Hooks.on('pf1ToggleActorBuff',  async(actor, itemData) =>{
    if(Utils.shouldHandle() && itemData.getItemDictionaryFlag('radius') > 0){
        if(sceneTokens?.length < 1){
            sceneTokens.length = 0;
            sceneTokens = Utils.createTokenArray();
        }
        let tokens = actor.getActiveTokens();
        if(tokens?.length > 0){
            let token = tokens[0].document;
            breezelogic.refreshAuras(token, sceneTokens, false);
        }
    }
})
