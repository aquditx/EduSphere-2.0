import { Suspense, lazy } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import { useAuthStore } from "@/store/authStore.js";

const LandingPage = lazy(() => import("@/pages/LandingPage.jsx"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage.jsx"));
const SignupPage = lazy(() => import("@/pages/auth/RegisterPage.jsx"));
const StudentDashboardPage = lazy(() => import("@/pages/student/StudentDashboardPage.jsx"));
const CourseListPage = lazy(() => import("@/pages/student/CourseListPage.jsx"));
const CourseDetailsPage = lazy(() => import("@/pages/student/CourseDetailsPage.jsx"));
const CoursePlayerPage = lazy(() => import("@/pages/student/CoursePlayerPage.jsx"));
const InstructorDashboardPage = lazy(() => import("@/pages/instructor/InstructorDashboardPage.jsx"));
const InstructorCoursesPage = lazy(() => import("@/pages/instructor/InstructorCoursesPage.jsx"));
const InstructorCreateCoursePage = lazy(() => import("@/pages/instructor/InstructorCreateCoursePage.jsx"));
const InstructorEditCoursePage = lazy(() => import("@/pages/instructor/InstructorEditCoursePage.jsx"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage.jsx"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage.jsx"));
const AdminCoursesPage = lazy(() => import("@/pages/admin/AdminCoursesPage.jsx"));
const AdminReportsPage = lazy(() => import("@/pages/admin/AdminReportsPage.jsx"));

function LoadingRoute() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Spinner label="Loading page" />
    </div>
  );
}

function roleHome(role) {
  if (role === "instructor") return "/instructor";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

function ProtectedRoute({ roles }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user.id) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <Outlet />;
}

function GuestRoute() {
  const user = useAuthStore((state) => state.user);
  if (user.id) {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingRoute />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["student"]} />}>
          <Route path="/dashboard" element={<StudentDashboardPage />} />
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/learn/:courseId/:lessonId" element={<CoursePlayerPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["instructor"]} />}>
          <Route path="/instructor" element={<InstructorDashboardPage />} />
          <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
          <Route path="/instructor/create" element={<InstructorCreateCoursePage />} />
          <Route path="/instructor/course/:id/edit" element={<InstructorEditCoursePage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Route>

        <Route path="/auth/login" element={<Navigate to="/login" replace />} />
        <Route path="/auth/register" element={<Navigate to="/signup" replace />} />
        <Route path="/student" element={<Navigate to="/dashboard" replace />} />
        <Route path="/student/courses" element={<Navigate to="/courses" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
