export interface RecipeItem {

  rawMaterialId: string;

  quantity: number;

  unit: string;

}

export interface Recipe {

  id: string;

  code: string;

  productId: string;

  version: number;

  yieldQuantity: number;

  yieldUnit: string;

  items: RecipeItem[];

  active: boolean;

}