import "./App.css";

import { ConfigProvider } from "antd";
import RenderRouter from "@/router";
import { BrowserRouter as Router } from "react-router-dom";
import { Suspense } from "react";
import { PageLoading } from "./pages/loading";
import { getInitData } from "./stores/features/auth";
import { useDispatch } from "react-redux";

function App() {
  // const { loading } = useSelector((state: any) => state.global);
  const dispatch = useDispatch<any>();
  dispatch(getInitData());
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0747a6",
        },
        components: {
          Table: {
            rowHoverBg: "#e4e4e4",
            borderColor: "#dde2eb",
            headerBg: "#e2e4e9",
            //algorithm: true
          },
        },
      }}
    >
      <Suspense fallback={<PageLoading />}>
        <Router>
          {/* <Spin spinning={loading} className="app-loading-wrapper"></Spin> */}
          <RenderRouter />
        </Router>
      </Suspense>
    </ConfigProvider>
  );
}
export default App;
