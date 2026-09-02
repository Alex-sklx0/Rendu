import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import HomePage from "@/pages/HomePage";
import RegisterPage from "@/pages/RegisterPage";
import RegisterSubproductPage from "@/pages/RegisterSubproductPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "registro", element: <RegisterPage /> },
      { path: "subproductos/nuevo", element: <RegisterSubproductPage /> },
    ],
  },
]);
