import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import HomePage from "@/pages/HomePage";
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
import PersonRegistrationPage from "@/pages/PersonRegistrationPage";
import CompanyRegistrationPage from "@/pages/CompanyRegistrationPage";
import CommunicationPage from "@/pages/CommunicationPage";
import MatchingPage from "@/pages/MatchingPage";
import ProfilePage from "@/pages/ProfilePage";
import UpdateSubproductPage from "@/pages/UpdateSubproductPage";
import NotFoundPage from "@/pages/NotFoundPage";

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
      { path: "pre-register", element: <PreRegisterPage /> },
      { path: "person-registration", element: <PersonRegistrationPage /> },
      { path: "company-registration", element: <CompanyRegistrationPage /> },
      { path: "communication", element: <CommunicationPage /> },

      { path: "catalog", element: <CatalogPage /> },
      { path: "catalog/:id", element: <SubproductDetailPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "subproduct/:id/edit", element: <UpdateSubproductPage /> },
      { path: "post-subproduct", element: <PostSubproductPage /> },
      { path: "matching", element: <MatchingPage /> },

      { path: "register", element: <Navigate to="/pre-register" replace /> },
      { path: "subproducts/new", element: <RegisterSubproductPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

