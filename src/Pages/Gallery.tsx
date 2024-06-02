import Program from "../components/gallery/Program";
import Footer from "../components/AllPage/Footer";
import Header from "../components/AllPage/Header";
import Hero from "../components/gallery/Hero";
import Testimonial from "../components/gallery/Testimonial";
import Photos from "../components/gallery/Photos";
import "../index.css";
const Gallery = () => {
  return (
    <>
      <Header />
      <Hero />
      <Testimonial />
      <Program />
      <Photos />
      <Footer />
    </>
  );
};

export default Gallery;
