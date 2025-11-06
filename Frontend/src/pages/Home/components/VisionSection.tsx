import { Card } from "@/components/UI";

const VisionSection = () => {
  return (
    <div className="relative mt-16 py-10">
      <div className="absolute inset-0 opacity-5 bg-repeat bg-[url('/src/images/islamic-pattern.png')]"></div>

      <div className="relative z-10 text-center">
        <h2
          className="text-2xl md:text-3xl font-bold text-slate-800 mb-10"
          data-aos="fade-down"
          data-aos-duration="600">
          رؤيتنا في تعليم القرآن الكريم
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card
            variant="elevated"
            padding="lg"
            hover
            className="text-center"
            data-aos="fade-up"
            data-aos-delay="100"
            data-aos-duration="700"
            data-aos-easing="ease-in-out">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              تلاوة متقنة
            </h3>
            <p className="text-slate-600">
              تعلم أصول التلاوة الصحيحة وفق أحكام التجويد
            </p>
          </Card>

          <Card
            variant="elevated"
            padding="lg"
            hover
            className="text-center"
            data-aos="fade-up"
            data-aos-delay="300"
            data-aos-duration="700"
            data-aos-easing="ease-in-out">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              حفظ القرآن
            </h3>
            <p className="text-slate-600">
              برامج متخصصة لحفظ القرآن الكريم بمنهجية مدروسة
            </p>
          </Card>

          <Card
            variant="elevated"
            padding="lg"
            hover
            className="text-center"
            data-aos="fade-up"
            data-aos-delay="500"
            data-aos-duration="700"
            data-aos-easing="ease-in-out">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              علوم القرآن
            </h3>
            <p className="text-slate-600">
              دراسة تفسير القرآن وعلومه بطرق ميسرة وشاملة
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisionSection;
