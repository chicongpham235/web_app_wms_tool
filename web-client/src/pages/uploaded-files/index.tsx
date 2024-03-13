import {
  InfoCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { FC, useEffect, useState } from "react";
import { ActionField } from "@/interface/common";
import BaseTable from "@/components/base-table";
import { Button, Tooltip } from "antd";
import { ColDef } from "ag-grid-community";
import PageContainer from "@/layout/PageContainer";
import { UploadedFileApi, type UploadedFile } from "@/api/uploaded-file";
import moment from "moment";
import DeleteDialog from "@/components/dialog/deleteDialog";
import UploadDialog from "./uploaded-dialog";
import { useNavigate } from "react-router-dom";
import { TbFileImport } from "react-icons/tb";
import { CgExport } from "react-icons/cg";
import ConvertDialog from "./convert-dialog";
import { Srs, SrsApi } from "@/api/srs";

const defaultColDef = {
  flex: 1,
  minWidth: 100,
  resizable: true,
  filter: true,
  floatingFilter: true,
};
const UploadedFilePage: FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConvertModal, setShowConvertModal] = useState<boolean>(false);
  const [statusModalDelete, setStatusModalDelete] = useState(false);
  const [valueSelected, setValueSelected] = useState<UploadedFile>();
  const navigate = useNavigate();

  const [srsList, setSrsList] = useState<Srs[]>([]);

  useEffect(() => {
    const fetchSrsList = async () => {
      const res = await SrsApi.list();
      if (res.data.length > 0) setSrsList(res.data);
    };
    fetchSrsList();
  }, []);

  const [keyRender, setKeyRender] = useState(0);

  const [columnDefs] = useState<ColDef<UploadedFile & ActionField>[]>([
    {
      headerName: "#",
      field: "id",
      maxWidth: 100,
      sortable: true,
      filter: false,
      resizable: false,
    },
    {
      headerName: "File Name",
      field: "name",
      sortable: true,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Coordinate Reference System",
      field: "srs",
      sortable: true,
      filter: "agTextColumnFilter",
    },
    {
      headerName: "File Size",
      field: "size",
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
        onConvertItem: (item: UploadedFile) => {
          setValueSelected(item);
          setShowConvertModal(true);
        },
        onDeleteItem: (item: UploadedFile) => {
          setValueSelected(item);
          setStatusModalDelete(true);
        },
      },
    },
  ]);

  return (
    <>
      <PageContainer
        icon={<TbFileImport />}
        title="Uploaded Files"
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
          api={UploadedFileApi.listAgGrid}
          key={keyRender}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
        <UploadDialog
          showModal={showModal}
          setShowModal={setShowModal}
          setKeyRender={setKeyRender}
          srsList={srsList}
        />
        <ConvertDialog
          showModal={showConvertModal}
          setShowModal={setShowConvertModal}
          item={valueSelected}
          srsList={srsList}
        />
      </PageContainer>
    </>
  );
};
export default UploadedFilePage;
const ActionCellRender: FC<any> = ({ onConvertItem, onDeleteItem, data }) => {
  if (!data) return <></>;
  return (
    <div className="px-1">
      <Tooltip placement="bottomLeft" title="Convert File">
        <Button
          disabled={!data.is_read_done}
          shape="circle"
          icon={<CgExport />}
          type="text"
          onClick={() => onConvertItem(data)}
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
