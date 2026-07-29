import { Outlet } from "react-router-dom";
import Footer from "../components/landing/Footer";

const PublicLayout = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
      
      <Footer />
    </>
  );
};

export default PublicLayout;