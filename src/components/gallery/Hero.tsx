import flower from "../../../public/gallery/flower.svg";
const Hero = () => {
  return (
    <section id="hero" className=" h-screen relative pt-40">
      <div className="flex flex-col md:flex-row wrapper justify-between gap-20 items-center">
        <iframe
          className=" md:w-1/2 w-[100%] h-80  md:h-96 rounded-2xl"
          src="https://www.youtube.com/embed/tGv7CUutzqU?si=SsF2tvkL0wtcb-MJ"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>{" "}
        <div className="flex flex-col gap-4 md:w-1/2">
          <h1 className="font-bold text-black text-2xl">
            SEAMEO RECFON Profiles
          </h1>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
            fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem.
          </p>
        </div>
      </div>
      <div className="flex justify-end -mt-20">
        <img src={flower} alt="Flower" className="w-60" />
      </div>
    </section>
  );
};

export default Hero;
