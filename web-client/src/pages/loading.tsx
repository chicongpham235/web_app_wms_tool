import { Spin } from "antd";
import "./style.css";

export const PageLoading = () => {
  return (
    <div className="loading-container">
      <Spin />
    </div>
  );
};
