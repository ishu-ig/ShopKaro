import React from 'react'
import HeroSection from '../Components/HeroSection'
import Fact from '../Components/Fact'
import Features from '../Components/Features'
import Testimonial from '../Components/Testimonial'

export default function FeaturePage() {
  return (
    <>
        <HeroSection title="Features" />
        <Fact />
        <Features />
        <Testimonial />
    </>
  )
}
