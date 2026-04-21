import React from "react";
import { landingPageStyles as s } from "../../assets/dummyStyles.js";
import Navbar from "../../components/common/Navbar.jsx";

const LandingPage = () => {
  return (
    <div className={s.bgMain}>
      <Navbar />
    </div>
  );
};

export default LandingPage;
