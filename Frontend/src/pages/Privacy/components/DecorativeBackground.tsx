const DecorativeBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 right-10 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-teal-200/20 rounded-full blur-3xl"></div>
    </div>
  );
};

export default DecorativeBackground;
