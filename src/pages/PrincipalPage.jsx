import React from 'react'
import NavComponent from '../components/NavbarComp'
import Products from '../components/Products'
import Suscribe from '../components/Suscribe'

import Footer from '../components/Footer';

function PrincipalPage() {
    return (
        <div>
            <NavComponent />
            <Products />
            <Suscribe />
            <Footer />
        </div>
    )
}

export default PrincipalPage
