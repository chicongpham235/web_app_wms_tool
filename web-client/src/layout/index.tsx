import { FC, Suspense, useState } from "react";
import "./layout.scss";
import SideBar from "./side-bar";
import NavBar from "./nav-bar";
import { Outlet } from "react-router-dom";
import { PageLoading } from "@/pages/loading";
import { Drawer, type MenuProps } from "antd";
import { TbFileImport, TbFileExport } from "react-icons/tb";
import { FaTasks } from "react-icons/fa";

const menu: MenuProps["items"] = [
  {
    label: "Uploaded Files",
    key: "uploaded-files",
    icon: <TbFileImport size="20" />,
  },
  {
    label: "Converted Layers",
    key: "converted-files",
    icon: <TbFileExport size="20" />,
  },
  {
    label: "Tasks",
    key: "tasks",
    icon: <FaTasks size="20" />,
  },
];

const LayoutPage: FC = () => {
  const [navMobile, setNavMobile] = useState(false);
  return (
    <div className="main">
      <div className="side-bar">
        <SideBar menu={menu} />
      </div>
      <div className="page_header">
        <NavBar setNavMobile={setNavMobile} />
      </div>

      <div className="wrapper-content">
        <div className="wrapper-content__main">
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
      <Drawer
        className="menu-mobile"
        placement="right"
        onClose={() => setNavMobile(false)}
        open={navMobile}
      >
        <SideBar setOpenDrawer={setNavMobile} menu={menu} />
      </Drawer>
    </div>
  );
};

export default LayoutPage;
