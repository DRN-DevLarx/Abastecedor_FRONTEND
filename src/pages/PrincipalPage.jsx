import React from 'react'
import NavComponent from '../components/NavbarComp'
import Products from '../components/Products'
import Footer from '../components/Footer';

function PrincipalPage() {
    return (
        <div>
            <NavComponent />
            <Products />
            <Footer />
        </div>
    )
}

export default PrincipalPage
