export class SummersBreezeMenu extends FormApplication {
  getData() {
    return game.settings.get('summersbreeze', 'SummersBreezeMenu');
  }

  _updateObject(event, formData) {
    const data = expandObject(formData);
    game.settings.set('summersbreeze', 'SummersBreezeMenu', data);
  }
}