import React from 'react'
import NavbarComp from '../components/NavbarComp'
import About from '../components/About'
import Comments from '../components/Comments'
import Footer from '../components/Footer'

function AboutPage() {
    return (
        <div>
            <NavbarComp/>
            <About/>
            <Comments/>
            <Footer/>
        </div>
    )
}

export default AboutPage
