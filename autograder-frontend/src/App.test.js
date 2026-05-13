import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./context/AuthContext", () => ({
  AuthProvider: ({ children }) => children,
}));

jest.mock("./components/RoleBasedRoute", () => ({
  __esModule: true,
  default: ({ element }) => element,
}));

jest.mock("./components/Auth/Login", () => () => <div>Login Page</div>);
jest.mock("./components/Auth/ResetPassword", () => () => (
  <div>Reset Password Page</div>
));
jest.mock("./components/Dashboard/Dashboard", () => () => <div>Dashboard</div>);
jest.mock("./components/Questions/SubjectList", () => () => (
  <div>Subject List</div>
));
jest.mock("./components/Questions/ArchivedSubjects", () => () => (
  <div>Archived Subjects</div>
));
jest.mock("./components/Questions/SubjectDetails", () => () => (
  <div>Subject Details</div>
));
jest.mock("./components/Questions/CreateExam", () => () => (
  <div>Create Exam</div>
));
jest.mock("./components/Answer/UploadSheet", () => () => (
  <div>Upload Copy</div>
));
jest.mock("./components/Answer/listSheet", () => () => <div>List Copy</div>);
jest.mock("./components/Niveau/listNiveau", () => () => (
  <div>List Niveau</div>
));
jest.mock("./components/UE/listModule", () => () => <div>Modules</div>);
jest.mock("./components/User/listUser", () => () => <div>User List</div>);
jest.mock("./components/Etudiant/listEtudiants", () => () => (
  <div>Students</div>
));
jest.mock("./components/Activity/listActivity", () => () => (
  <div>Activity Page</div>
));
jest.mock("./components/Answer/sheetCorrige", () => () => (
  <div>Corrected Sheets</div>
));

test("renders the login route", () => {
  window.history.pushState({}, "Login", "/login");

  render(<App />);

  expect(screen.getByText("Login Page")).toBeInTheDocument();
});
