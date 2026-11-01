import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { ThemeApplier } from "./components/ThemeApplier";
import { LanguageApplier } from "./components/LanguageApplier";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { initializeAuth } from "./features/auth/authStore";

const Login = lazy(() =>
  import("./pages/Login").then((m) => ({ default: m.Login })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Orders = lazy(() =>
  import("./pages/Orders").then((m) => ({ default: m.Orders })),
);
const Products = lazy(() =>
  import("./pages/Products").then((m) => ({ default: m.Products })),
);
const Customers = lazy(() =>
  import("./pages/Customers").then((m) => ({ default: m.Customers })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.Settings })),
);

function AuthInitializer() {
  useEffect(() => {
    initializeAuth();
  }, []);

  return null;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <ThemeApplier />
      <LanguageApplier />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
