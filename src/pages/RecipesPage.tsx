import Card from "../components/ui/Card";
import { recipes } from "../data/recipes";
import { products } from "../data/products";
import { rawMaterials } from "../data/rawMaterials";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

export default function RecipesPage() {
  return (
    <>
      <h1
        style={{
          color: colors.primary,
          fontSize: typography.title,
          marginBottom: "24px",
        }}
      >
        Recetas de Producción
      </h1>

      {recipes.map((recipe) => {
        const product = products.find(
          (p) => p.id === recipe.productId
        );

        return (
          <Card key={recipe.id}>

            <h2>{product?.name}</h2>

            <p>
              Código receta: {recipe.code}
            </p>

            <p>
              Produce: {recipe.yieldQuantity} {recipe.yieldUnit}
            </p>

            <hr />

            <h3>Ingredientes</h3>

            {recipe.items.map((item) => {
              const material = rawMaterials.find(
                (m) => m.id === item.rawMaterialId
              );

              return (
                <p key={item.rawMaterialId}>
                  • {material?.name} — {item.quantity} {item.unit}
                </p>
              );
            })}

          </Card>
        );
      })}
    </>
  );
}