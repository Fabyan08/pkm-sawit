import flower_left from "../../../public/gallery/flower_left.svg";

import { testimonials } from '../../constants/Testimonials';


const Testimonial = () => {
  return (
    <section id="testimonial" className=" mt-20 ">
      <div className="flex flex-col gap-4 wrapper">
        <h1 className="text-2 text-3xl font-bold ">Internship Testimonial</h1>
        <hr className="border-1 w-96" />
      </div>
      <div className="grid wrapper grid-cols-1 md:grid-cols-3 gap-14 md:gap-32 mt-10">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="flex flex-col font-bold gap-4">
          <iframe
            className="rounded-xl h-52"
            src={testimonial.videoUrl}
            title={`YouTube video player ${index + 1}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
          <h1>{testimonial.title}</h1>
        </div>
      ))}
      </div>
      <div className="flex justify-start -mt-40 relative -z-10">
        <img src={flower_left} alt="Flower" />
      </div>
    </section>
  );
};

export default Testimonial;
