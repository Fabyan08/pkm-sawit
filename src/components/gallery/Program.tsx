import { Link } from "react-router-dom";
import { Programs } from "../../constants/Programs";
const Program = () => {
  return (
    <section id="program" className="-mt-60">
      <div className="flex flex-col relative z-20 gap-4 wrapper">
        <h1 className="text-2 text-3xl font-bold ">SEAMEO RECFON’s Program</h1>
        <hr className="border-1 w-96" />
      </div>
      <div className="grid wrapper grid-cols-1 md:grid-cols-3 gap-14 md:gap-32 mt-10">
      {Programs.map((program, index) => (
        <div key={index} className="flex flex-col font-bold gap-4">
          <iframe
            className="rounded-xl h-52"
            src={program.videoUrl}
            title={`YouTube video player ${index + 1}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
          <h1>{program.title}</h1>
        </div>
      ))}
      </div>
      <Link
        to="https://youtube.com"
        target="_blank"
        className="flex justify-center"
      >
        <div className="bg-2 px-10 rounded-full mt-10 py-2  text-white font-semibold text-xl">
          More {">>"}
        </div>
      </Link>
    </section>
  );
};

export default Program;
