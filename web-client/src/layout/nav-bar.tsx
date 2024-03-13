import { Button } from "antd";
import { FC } from "react";
import { PiListFill } from "react-icons/pi";
import classNames from "classnames/bind";
import styles from "./nav-bar.module.scss";
import { LuLayoutPanelLeft } from "react-icons/lu";

interface Props {
  setNavMobile: (value: boolean) => void;
}
const cx = classNames.bind(styles);
const NavBar: FC<Props> = (props): JSX.Element => {
  const { setNavMobile } = props;
  return (
    <div className={cx("wrapper")}>
      <span className="h-[40px] text-black">
        <LuLayoutPanelLeft style={{ marginRight: "16px" }} size="24" />
        <span className="text-[24px] leading-[40px]">Admin Panel</span>
      </span>
      <div className={cx("action")}>
        <Button
          onClick={() => setNavMobile(true)}
          className={cx("nav-bar")}
          type="text"
          size="large"
          icon={<PiListFill />}
        />
      </div>
    </div>
  );
};

export default NavBar;
