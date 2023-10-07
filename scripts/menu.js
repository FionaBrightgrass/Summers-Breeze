export class AuraShareMenu extends FormApplication {
  getData() {
    return game.settings.get('summersbreeze', 'SummersBreezeShareMenu');
  }

  _updateObject(event, formData) {
    const data = expandObject(formData);
    game.settings.set('summersbreeze', 'SummersBreezeShareMenu', data);
  }
}