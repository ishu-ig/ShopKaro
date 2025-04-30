import React from 'react'
import HeroSection from '../Components/HeroSection'
import About from '../Components/About'
import Fact from '../Components/Fact'
import Testimonial from '../Components/Testimonial'

export default function AboutPage() {
  return (
    <>
        <HeroSection title="About Us" />
        <Fact />
        <About />
        <Testimonial />
    </>
  )
}
