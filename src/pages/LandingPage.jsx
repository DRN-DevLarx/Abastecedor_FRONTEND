import React from 'react'

import Navbar from '../components/NavbarComp'
import Alert from '../components/Alert'

import Header from '../components/Header'
import Carousel from '../components/Carousel'
import About from '../components/About'
import Comments from '../components/Comments'
import Suscribe from '../components/Suscribe'
import Footer from '../components/Footer'

function LandingPage() {
    return (
        <div>
            <Navbar />
            {/* <Usooo /> */}
            <Alert />

            <Header />
            {/* <Carousel /> */}
            <About />
            <Comments />
            <Suscribe />
            <Footer />
        </div>
    );
}

export default LandingPage
