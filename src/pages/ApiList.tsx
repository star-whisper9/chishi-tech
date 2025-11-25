import React from "react";
import MainLayout from "../components/layout/MainLayout";
import ApiServiceList from "../components/specific/apidocs/ApiServiceList";

const ApiListPage: React.FC = () => {
  return (
    <MainLayout title="API 文档" titleSuffix="服务列表">
      <ApiServiceList />
    </MainLayout>
  );
};

export default ApiListPage;
