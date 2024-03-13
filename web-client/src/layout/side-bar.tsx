import "./layout.scss";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  menu: MenuProps["items"];
  setOpenDrawer?: (value: boolean) => void;
}

const SideBar: FC<Props> = (props) => {
  const { menu, setOpenDrawer } = props;
  const navigate = useNavigate();
  const [current, setCurrent] = useState(`${location.pathname.split("/")[1]}`);

  useEffect(() => {
    setCurrent(location.pathname.split("/")[1]);
  }, [location.pathname]);

  const handleNavigate: MenuProps["onClick"] = (e) => {
    if (setOpenDrawer) setOpenDrawer(false);
    if (location.pathname == "/" + e.key) return;
    setCurrent(e.key);
    navigate(e.key);
  };

  return (
    <div className="wrapper-sb" style={{ width: "100%" }}>
      <Menu
        style={{ fontSize: "18px" }}
        mode="inline"
        items={menu}
        onClick={handleNavigate}
        selectedKeys={[current]}
      />
    </div>
  );
};

export default SideBar;
