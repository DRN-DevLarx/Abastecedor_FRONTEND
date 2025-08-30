
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from '../pages/LandingPage';
import PrivateRoute from './PrivateRoute';

function Routing() {
  return (


    <Router>
        <Routes >
            {/* Rutas publicas */}
            <Route  path='/' element={<LandingPage/>}/>
     
            {/* Rutas protegidas */}
            {/* <Route path="/" element={<PrivateRoute element={<LandingPage />} />}/> */}

        </Routes>
    </Router>
  
    
  )
}

export default Routing