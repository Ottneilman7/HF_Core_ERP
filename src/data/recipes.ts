import type { Recipe } from "../models/Recipe";

export const recipes: Recipe[] = [
  {
    id: "1",
    code: "REC-HB-C1",
    productId: "1",
    version: 1,
    yieldQuantity: 1,
    yieldUnit: "Unidad",

    items: [
      {
        rawMaterialId: "1",
        quantity: 60,
        unit: "g",
      },
      {
        rawMaterialId: "2",
        quantity: 25,
        unit: "g",
      },
      {
        rawMaterialId: "3",
        quantity: 15,
        unit: "g",
      },
    ],

    active: true,
  },
];