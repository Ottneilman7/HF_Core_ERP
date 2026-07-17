import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import InventoryPage from "../pages/InventoryPage";
import ProductsPage from "../pages/ProductsPage";
import CustomersPage from "../pages/CustomersPage";
import RecipesPage from "../pages/RecipesPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<CustomersPage />} />
             
          <Route path="/inventory" element={<InventoryPage />} />

          <Route path="/products" element={<ProductsPage />} />

          <Route path="/recipes"  element={<RecipesPage />} />

          <Route path="/customers" element={<CustomersPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}