import { AuraShareMenu } from './menu.js';

export class Settings {
    static registerSettings() {
            game.settings.register('summersbreeze', 'Enabled', {
                name: 'Enabled',
                hint: 'Enable the mod',
                scope: 'world',   
                config: true,     
                type: Boolean,    
                default: true
            });
    }
}