import { AuraShareMenu } from './menu.js';

export class Settings {
    static registerSettings() {
            game.settings.register('aurashare', 'Diehard', {
                name: 'Diehard',
                hint: 'Should actors with "Diehard" continue to share auras when at 0 HP?',
                scope: 'world',   
                config: true,     
                type: Boolean,    
                default: true
            });
            game.settings.register('aurashare', 'UnconsciousAuras', {
                name: 'Unconscious Auras',
                hint: 'Should all actors continue to share auras when below 0 HP? (Overrides the Diehard setting)',
                scope: 'world',   
                config: true,     
                type: Boolean,     
                default: true
            });
            game.settings.register('aurashare', 'DeleteAuras', {
                name: 'Delete Auras',
                hint: 'Should auras be deleted when an actor is out of range? (If not, they get deactivated)',
                scope: 'world',   
                config: true,     
                type: Boolean,     
                default: true
            });
            game.settings.register('aurashare', 'ShareZero', {
                name: 'Share at 0 HP',
                hint: 'Should auras be shared by an actor with exactly 0 HP? Disabling this will require -1 HP to disable the aura.',
                scope: 'world',   
                config: true,     
                type: Boolean,     
                default: true
            });
            game.settings.register('aurashare', 'Nudge', {
                name: 'Nudge Auras',
                hint: 'Increase or decrease the radius of all auras by x feet. A value of 1-4 feet may help grab corner squares when the actual Foundry radius does not match your template. ',
                scope: 'world',   
                config: true,     
                type: Number,     
                default: 0
            });
    }
}