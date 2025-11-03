interface ErrorIconProps {
  dataAos?: string;
}

const ErrorIcon = ({ dataAos }: ErrorIconProps) => {
  return (
    <div className="flex justify-center mb-6" data-aos={dataAos}>
      <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-14 w-14 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
    </div>
  );
};

export default ErrorIcon;
