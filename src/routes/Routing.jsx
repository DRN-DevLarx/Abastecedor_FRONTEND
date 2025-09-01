
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PrivateRoute from '../components/PrivateRoute';

import LandingPage from '../pages/LandingPage';
import ProductsPage from '../pages/ProductsPage';
import ContactPage from '../pages/ContactPage';
import Register1 from '../components/Register1';
import Register2 from '../components/Register2';
import Verificaction3 from '../components/Verification3';
import Confirm4 from '../components/Confirm4';

import LoginPage from '../pages/LoginPage';

function Routing() {
  return (


    <Router>
        <Routes >
            {/* Rutas publicas */}
            <Route  path='/' element={<LandingPage/>}/>
            <Route  path='/productos' element={<ProductsPage/>}/>
            <Route  path='/contactar' element={<ContactPage/>}/>
     
            <Route  path='/registro' element={<Register1 />}/>
            <Route  path='/registroContacto' element={<Register2 />}/>
            <Route  path='/verificarCorreo' element={<Verificaction3 />}/>
            <Route  path='/confirmarRegistro' element={<Confirm4 />}/>

            <Route  path='/IniciarSesion' element={<LoginPage />}/>
            
            {/* Rutas protegidas */}
            {/* <Route path="/" element={<PrivateRoute element={<LandingPage />} />}/> */}

        </Routes>
    </Router>
  
    
  )
}

export default Routing