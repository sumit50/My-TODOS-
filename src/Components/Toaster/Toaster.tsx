import {Toaster} from "react-hot-toast";

const Toaster = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 2000,
        style: {
          fontSize: "14px",
        },
      }}
    />
  );
};

export default Toaster;
