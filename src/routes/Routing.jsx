import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PrivateRoute from "../components/PrivateRoute";

import LandingPage from "../pages/LandingPage";
import ProductsPage from "../pages/ProductsPage";
import ContactPage from "../pages/ContactPage";
import Register1 from "../components/Register1";
import Register2 from "../components/Register2";
import Verificaction3 from "../components/Verification3";
import Confirm4 from "../components/Confirm4";
import ResetPassword from "../components/ResetPassword";
import Profile from "../components/Profile";
import UsersList from "../components/UsersList";
import UserCreate from "../components/UserCreate";
import ProductsList from "../components/ProductsList";

import LoginForm from "../components/Login";
// import SessionModal from "../components/SessionModal";

import PrincipalPage from "../pages/PrincipalPage";
import DashboardPage from "../pages/DashboardPage";
import AboutPage from "../pages/AboutPage";

import NotFound from "../components/NotFound";


function Routing() {
  return (
    <Router>
      <Routes>

        /////////////////////////////////////////////////////

        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/contactar" element={<ContactPage />} />
        <Route path="/registro" element={<Register1 />} />
        <Route path="/registroContacto" element={<Register2 />} />
        <Route path="/verificarCorreo" element={<Verificaction3 />} />
        <Route path="/confirmarRegistro" element={<Confirm4 />} />
        <Route path="/IniciarSesion" element={<LoginForm />} />
        {/* <Route path="/SessionModal" element={<SessionModal />} /> */}
        <Route path="/restablecer" element={<ResetPassword />} />
        <Route path="/about" element={<AboutPage />} />

        /////////////////////////////////////////////////////

        {/* Rutas protegidas (cualquier usuario logueado) */}
        <Route
          path="/principal"
          element={<PrivateRoute element={<PrincipalPage />} />}
        />
        
        <Route
          path="/perfil"
          element={<PrivateRoute element={<Profile />} />}
        />
    
        <Route
          path="/ListaProductos"
          element={<PrivateRoute element={<ProductsList />} />}
        />

        /////////////////////////////////////////////////////

        {/* Rutas protegidas solo para Administradores */}
        <Route
          path="/usuarios"
          element={
            <PrivateRoute
              element={<UsersList />}
              allowedRoles={[1]}
            />
          }
        />
        <Route
          path="/crearUsuario"
          element={
            <PrivateRoute
              element={<UserCreate />}
              allowedRoles={[1]}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute
              element={<DashboardPage />}
              allowedRoles={[1]}
            />
          }
        />
        
        <Route path="*" element={<NotFound />} />

        /////////////////////////////////////////////////////


      </Routes>
    </Router>
  );
}

export default Routing;
