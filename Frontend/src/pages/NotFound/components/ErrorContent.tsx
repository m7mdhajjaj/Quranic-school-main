interface ErrorContentProps {
  titleDelay?: number;
  subtitleDelay?: number;
  descriptionDelay?: number;
}

const ErrorContent = ({
  titleDelay = 100,
  subtitleDelay = 200,
  descriptionDelay = 300,
}: ErrorContentProps) => {
  return (
    <>
      <h1
        className="text-4xl font-bold text-gray-800 mb-2"
        data-aos="fade-up"
        data-aos-delay={titleDelay}
      >
        404
      </h1>

      <h2
        className="text-2xl font-bold text-gray-700 mb-4"
        data-aos="fade-up"
        data-aos-delay={subtitleDelay}
      >
        الصفحة غير موجودة
      </h2>

      <p
        className="text-gray-600 mb-6"
        data-aos="fade-up"
        data-aos-delay={descriptionDelay}
      >
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
    </>
  );
};

export default ErrorContent;
