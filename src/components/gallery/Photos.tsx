import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";

import foto_1 from "../../../public/gallery/1.png";
import foto_2 from "../../../public/gallery/2.png";
import foto_3 from "../../../public/gallery/3.png";
import './SwiperStyles.css'; 

const Photos = () => {
  return (
    <section id="Photos" className="bg-3 w-full h-fit pb-20 -mb-40 mt-40">
      <div className="wrapper">
        <div className="flex justify-center">
          <h1 className="text-center bg-white border-[#385A64] border-2 -mt-10 py-6 px-10 rounded-full text-3 w-fit  text-4xl font-bold">
            Photos
          </h1>
        </div>
      </div>
      <div className="wrapper mt-10">
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          loop={true}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Pagination, Navigation]}
          className="mySwiper"
          autoplay={{ delay: 2000 }}
        >
          <SwiperSlide>
            <img src={foto_1} alt="1" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={foto_2} alt="2" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={foto_3} alt="3" />
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
};

export default Photos;
