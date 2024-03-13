import type { FC, ReactElement } from "react";
import Route from "./route";
import type { RouteProps } from "react-router";

export type WrapperRouteProps = RouteProps & {
  element: ReactElement;
};

const WrapperRouteComponent: FC<WrapperRouteProps> = ({
  element,
  ...props
}) => {
  return <Route {...props} element={element} />;
};

export default WrapperRouteComponent;
