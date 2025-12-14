import React from 'react'
import NavbarComp from '../components/NavbarComp'
import Products from '../components/ProductsCards'
import Suscribe from '../components/Suscribe'
import Footer from '../components/Footer'


function ProductsPage() {
    return (
        <div>
            <NavbarComp/>
            <Products/>
            <Suscribe/> 
            <Footer/>
        </div>
    )
}

export default ProductsPage
