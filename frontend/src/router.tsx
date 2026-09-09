import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import HomePage from "@/pages/HomePage";
import RegisterPage from "@/pages/RegisterPage";
import RegisterSubproductPage from "@/pages/RegisterSubproductPage";
import CatalogPage from "@/pages/CatalogPage";
import SubproductDetailPage from "@/pages/SubproductDetailPage";
import PostSubproductPage from "@/pages/PostSubproductPage";
import SplashPage from "@/pages/SplashPage";
import Splash1Page from "@/pages/Splash1Page";
import Splash2Page from "@/pages/Splash2Page";
import Splash3Page from "@/pages/Splash3Page";
import LoginPage from "@/pages/LoginPage";
import PreRegisterPage from "@/pages/PreRegisterPage";
import RegistroPersonaPage from "@/pages/RegistroPersonaPage";
import RegistroEmpresaPage from "@/pages/RegistroEmpresaPage";
import CommunicationPage from "@/pages/CommunicationPage";
import MatchingPage from "@/pages/MatchingPage";
import ProfilePage from "@/pages/ProfilePage";
import UpdateSubproductPage from "@/pages/UpdateSubproductPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <SplashPage /> },
      { path: "home", element: <HomePage /> },
      { path: "splash", element: <SplashPage /> },
      { path: "splash1", element: <Splash1Page /> },
      { path: "splash2", element: <Splash2Page /> },
      { path: "splash3", element: <Splash3Page /> },

      { path: "login", element: <LoginPage /> },
      { path: "pre_register", element: <PreRegisterPage /> },
      { path: "pre-register", element: <PreRegisterPage /> },
      { path: "registro_persona", element: <RegistroPersonaPage /> },
      { path: "registro-persona", element: <RegistroPersonaPage /> },
      { path: "registro_empresa", element: <RegistroEmpresaPage /> },
      { path: "registro-empresa", element: <RegistroEmpresaPage /> },
      { path: "communication", element: <CommunicationPage /> },
      { path: "comunicacion", element: <CommunicationPage /> },

      { path: "catalogo", element: <CatalogPage /> },
      { path: "catalogo/:id", element: <SubproductDetailPage /> },
      { path: "perfil", element: <ProfilePage /> },
      { path: "subproductos/:id/editar", element: <UpdateSubproductPage /> },
      { path: "publicar", element: <PostSubproductPage /> },
      { path: "matching", element: <MatchingPage /> },

      { path: "registro", element: <RegisterPage /> },
      { path: "subproductos/nuevo", element: <RegisterSubproductPage /> },
    ],
  },
]);
