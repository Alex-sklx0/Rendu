import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import HomePage from "@/pages/HomePage";
import RegisterUserPage from "@/pages/RegisterUserPage";
import RegisterCompanyPage from "@/pages/RegisterCompanyPage";
import RegisterSubproductPage from "@/pages/RegisterSubproductPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "registro/usuario", element: <RegisterUserPage /> },
      { path: "registro/empresa", element: <RegisterCompanyPage /> },
      { path: "subproductos/nuevo", element: <RegisterSubproductPage /> },
    ],
  },
]);
