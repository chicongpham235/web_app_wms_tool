import { FC, ReactNode, useMemo } from "react";
import { Breadcrumb, Col, Row } from "antd";
import Title from "antd/es/typography/Title";
import { Link } from "react-router-dom";
type PageContainerOption = {
  children?: ReactNode | undefined;
  icon?: ReactNode;
  title?: string;
  titleTrans?: string;
  breadcrumbs?: Breadcrumbs[];
  extraTitle?: ReactNode | undefined;
};
type Breadcrumbs = {
  router?: string;
  text: string;
};
const PageContainer: FC<PageContainerOption> = ({
  children,
  icon,
  title,
  breadcrumbs = [],
  extraTitle,
}) => {
  const items = useMemo(() => {
    return breadcrumbs.map((x) => {
      let label = x.text;
      if (x.router) {
        label = (<Link to={x.router}>{label}</Link>) as any;
      }
      const temp = { ...x, title: label };
      return temp;
    });
  }, [breadcrumbs]);
  return (
    <div className="d-flex flex-column full-height p-3">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={items} className="grow-0"></Breadcrumb>
      )}
      <Row className="flex-grow-0">
        <Col span={12} className="text-left">
          {icon && (
            <span className="page-container__icon mr-[16px] text-black">
              {icon}
            </span>
          )}
          {title && (
            <Title className="inline-block" level={2}>
              {title}
            </Title>
          )}
        </Col>
        <Col span={12}>{extraTitle && extraTitle}</Col>
      </Row>

      <Row className="flex-grow-1">
        <Col span={24}>{children}</Col>
      </Row>
    </div>
  );
};
export default PageContainer;

export { PageContainer };
