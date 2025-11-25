import React from "react";
import MainLayout from "../components/layout/MainLayout";
import ApiServiceDetail from "../components/specific/apidocs/ApiServiceDetail";

const ApiDetailPage: React.FC = () => {
  return (
    <MainLayout title="API 文档" titleSuffix="详情">
      <ApiServiceDetail />
    </MainLayout>
  );
};

export default ApiDetailPage;
