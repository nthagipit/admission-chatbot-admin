import { useContext } from "react";
import { AppContext } from "./contexts/app.context";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import { path } from "./constants/path";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Conversations from "./pages/Admin/Conversations";
import ConversationDetail from "./pages/Admin/ConversationDetail";
import KnowledgeBase from "./pages/Admin/KnowledgeBase";
import DocumentDetail from "./pages/Admin/DocumentDetail/DocumentDetail";
import User from "./pages/Admin/User";
import UserDetail from "./pages/Admin/UserDetail";
import { Loader2 } from "lucide-react";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useContext(AppContext);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 className="size-8 animate-spin text-primary-600" />
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to={path.login} replace />;
}

function RejectedRoute() {
  const { isAuthenticated, isLoading } = useContext(AppContext);
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 className="size-8 animate-spin text-primary-600" />
      </div>
    );
  }
  return !isAuthenticated ? <Outlet /> : <Navigate to="/admin" replace />;
}

export default function useRouteElements() {
  const elements = useRoutes([
    {
      path: "",
      element: <RejectedRoute />,
      children: [
        {
          path: path.login,
          element: <Login />,
        },
      ],
    },
    {
      path: "",
      element: <ProtectedRoute />,
      children: [
        {
          path: "/admin",
          element: <AdminLayout />,
          children: [
            {
              index: true,
              element: <Dashboard />,
            },
            {
              path: "knowledge-base",
              element: <KnowledgeBase />,
            },
            {
              path: "knowledge-base/:id",
              element: <DocumentDetail />,
            },
            {
              path: "conversations",
              element: <Conversations />,
            },
            {
              path: "conversations/:id",
              element: <ConversationDetail />,
            },
            {
              path: "users",
              element: <User />,
            },
            {
              path: "users/:id",
              element: <UserDetail />,
            },
          ],
        },
      ],
    },
    {
      path: "/",
      element: <Navigate to="/admin" replace />,
    },
    {
      path: "*",
      element: <Navigate to="/admin" replace />,
    },
  ]);

  return elements;
}
