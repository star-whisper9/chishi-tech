import React from "react";
import MainLayout from "../components/layout/MainLayout";
import Navigation from "../components/common/Navigation/Navigation";
import CdnNotice from "../components/common/CdnNotice";

const NavigationPage: React.FC = () => {
  return (
    <MainLayout>
      <CdnNotice />
      <Navigation />
    </MainLayout>
  );
};

export default NavigationPage;
