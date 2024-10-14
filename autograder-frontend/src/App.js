import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RoleBasedRoute from "./components/RoleBasedRoute";
import Login from "./components/Auth/Login";
import ResetPasswordPage from "./components/Auth/ResetPassword";
import Dashboard from "./components/Dashboard/Dashboard";
import SubjectList from "./components/Questions/SubjectList";
import ArchivedSubjects from "./components/Questions/ArchivedSubjects";
import SubjectDetails from "./components/Questions/SubjectDetails"; 
import CreateExam from "./components/Questions/CreateExam";
import UploadCopy from "./components/Answer/UploadSheet";
import ListCopy from "./components/Answer/listSheet";
import ListNiveau from "./components/Niveau/listNiveau";
import Modules from "./components/UE/listModule";
import UserList from "./components/User/listUser";
import ListEtudiant from "./components/Etudiant/listEtudiants";
import AdminActivityPage from "./components/Activity/listActivity";
import PageFeuillesCorrigees from "./components/Answer/sheetCorrige";
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Routes accessibles à tous les utilisateurs authentifiés */}
          <Route path="/" element={<RoleBasedRoute element={<Dashboard />} requiredRoles={['admin', 'professeur', 'personnel']} />} />
          
          {/* Routes spécifiques au rôle 'professeur' */}
          <Route path="/subject-list" element={<RoleBasedRoute element={<SubjectList />} requiredRoles={['admin', 'professeur']} />} />
          <Route path="/archived-subjects" element={<RoleBasedRoute element={<ArchivedSubjects />} requiredRoles={['admin', 'professeur']} />} />
          <Route path="/sujet/:id" element={<RoleBasedRoute element={<SubjectDetails />} requiredRoles={['admin', 'professeur']} />} />
          <Route path="/create-exam" element={<RoleBasedRoute element={<CreateExam />} requiredRoles={['admin', 'professeur']} />} />

          {/* Routes spécifiques au rôle 'personnel' */}
          <Route path="/upload-copy" element={<RoleBasedRoute element={<UploadCopy />} requiredRoles={['admin', 'professeur', 'personnel']} />} />
          <Route path="/list-copies" element={<RoleBasedRoute element={<ListCopy />} requiredRoles={['admin', 'professeur', 'personnel']} />} />
          <Route path="/list-niveau" element={<RoleBasedRoute element={<ListNiveau />} requiredRoles={['admin', 'professeur', 'personnel']} />} />
          <Route path="/modules" element={<RoleBasedRoute element={<Modules />} requiredRoles={['admin', 'professeur', 'personnel']} />} />

          {/* Route spécifique au rôle 'admin' */}
          <Route path="/list-user" element={<RoleBasedRoute element={<UserList />} requiredRoles={['admin', 'professeur']} />} />
          <Route path="/activity" element={<RoleBasedRoute element={<AdminActivityPage />} requiredRoles={['admin']} />} />
          <Route path="/etudiants"  element={<ListEtudiant />}  />
          <Route path="/copies-corriges" element={<RoleBasedRoute element={<PageFeuillesCorrigees />} requiredRoles={['admin', 'professeur', 'personnel']} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
