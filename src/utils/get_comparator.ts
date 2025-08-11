import type {  Item, SortableProperty, damageType } from '../types'

export const getComparator = (property: SortableProperty, order: number): ((a: Item, b: Item) => number) => {
  if (property == 'name' || property == 'requiredLevel') {
    return (a:Item, b: Item) => { return order  * ((a[property] < b[property]) ? -1 : 1)}
  }
  else {
    return (a:Item, b: Item) => {
      let aDamage=0, bDamage=0;
      Object.keys(a.damage || {}).forEach((key: string) => {
        if (a.damage) {
          aDamage += (a.damage[key as damageType] || 0);
        }
      });
      Object.keys(b.damage || {}).forEach((key) => {
        if (b.damage) {
          bDamage += (b.damage[key as damageType] || 0);
        }
      });
      return order * (aDamage < bDamage ? -1 : 1);
    }
  }
}