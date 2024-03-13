import {
  InfoCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { FC, useEffect, useState } from "react";
import { ActionField } from "@/interface/common";
import BaseTable from "@/components/base-table";
import { Button, Tag, Tooltip } from "antd";
import { ColDef } from "ag-grid-community";
import PageContainer from "@/layout/PageContainer";
import { TaskApi, type Task } from "@/api/task";
import moment from "moment";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { useNavigate } from "react-router-dom";
import { CgExport } from "react-icons/cg";
import { FaTasks } from "react-icons/fa";
import { STATUS_TYPE } from "@/constant";

const defaultColDef = {
  flex: 1,
  minWidth: 100,
  resizable: true,
  filter: true,
  floatingFilter: true,
};
const TaskPage: FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConvertModal, setShowConvertModal] = useState<boolean>(false);
  const [statusModalDelete, setStatusModalDelete] = useState(false);
  const [valueSelected, setValueSelected] = useState<Task>();
  const navigate = useNavigate();

  const [keyRender, setKeyRender] = useState(0);

  const [columnDefs] = useState<ColDef<Task & ActionField>[]>([
    {
      headerName: "#",
      field: "id",
      maxWidth: 100,
      sortable: true,
      filter: false,
      resizable: false,
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Status",
      headerClass: "text-center",
      field: "status",
      cellRenderer: (data: any) => {
        if (!data?.value) return <></>;
        return (
          <Tag
            style={{
              backgroundColor: STATUS_TYPE[data.value].color,
              width: "fit-content",
              padding: "4px 16px",
              textAlign: "center",
            }}
          >
            {STATUS_TYPE[data.value].text}
          </Tag>
        );
      },
      sortable: true,
      filter: "agTextColumnFilter",
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Start At",
      field: "start_at",
      cellRenderer: (data: any) => {
        if (!data?.value) return;
        return moment(data.value).format("MM/DD/YYYY hh:mm:ss A");
      },
      minWidth: 200,
      resizable: false,
      sortable: true,
      filter: false,
    },
    {
      headerName: "End At",
      field: "end_at",
      cellRenderer: (data: any) => {
        if (!data?.value) return;
        return moment(data.value).format("MM/DD/YYYY hh:mm:ss A");
      },
      minWidth: 200,
      resizable: false,
      sortable: true,
      filter: false,
    },
    {
      headerName: "Created At",
      field: "created_at",
      cellRenderer: (data: any) => {
        if (!data?.value) return;
        return moment(data.value).format("MM/DD/YYYY hh:mm:ss A");
      },
      minWidth: 200,
      resizable: false,
      sortable: true,
      filter: false,
    },
    {
      headerName: "Action",
      field: "action",
      pinned: "right",
      width: 150,
      resizable: false,
      filter: false,
      cellRenderer: ActionCellRender,
      cellRendererParams: {
        onShowItem: (item: Task) => {
          setValueSelected(item);
          setShowConvertModal(true);
        },
        onDeleteItem: (item: Task) => {
          setValueSelected(item);
          setStatusModalDelete(true);
        },
      },
    },
  ]);

  return (
    <>
      <PageContainer
        icon={<FaTasks />}
        title="Task"
        extraTitle={
          <Button
            type="primary"
            onClick={() => setShowModal(true)}
            style={{ float: "right", height: "2.5rem" }}
          >
            Upload File
          </Button>
        }
      >
        <BaseTable
          columns={columnDefs}
          api={TaskApi.listAgGrid}
          key={keyRender}
          gridOption={{ defaultColDef: defaultColDef }}
          defaultParams={{ with: ["uploaded_file"] }}
        ></BaseTable>
      </PageContainer>
    </>
  );
};
export default TaskPage;
const ActionCellRender: FC<any> = ({ onShowItem, onDeleteItem, data }) => {
  if (!data) return <></>;
  return (
    <div className="px-1">
      <Tooltip placement="bottomLeft" title="Convert File">
        <Button
          disabled={!data.is_read_done}
          shape="circle"
          icon={<CgExport />}
          type="text"
          onClick={() => onShowItem(data)}
        />
      </Tooltip>
      <Tooltip placement="bottomLeft" title="Delete File">
        <Button
          shape="circle"
          icon={<DeleteOutlined />}
          type="text"
          onClick={() => onDeleteItem(data)}
        />
      </Tooltip>
    </div>
  );
};
