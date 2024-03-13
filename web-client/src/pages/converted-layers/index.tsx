import {
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { FC, useEffect, useState } from "react";
import { ActionField } from "@/interface/common";
import BaseTable from "@/components/base-table";
import { Button, Tooltip } from "antd";
import { ColDef } from "ag-grid-community";
import PageContainer from "@/layout/PageContainer";
import { ConvertedLayerApi, type ConvertedLayer } from "@/api/converted-layer";
import moment from "moment";
import DeleteDialog from "@/components/dialog/deleteDialog";
import { useNavigate } from "react-router-dom";
import { TbFileImport } from "react-icons/tb";
import { Srs, SrsApi } from "@/api/srs";
import DownloadDialog from "./download-dialog";

const defaultColDef = {
  flex: 1,
  minWidth: 100,
  resizable: true,
  filter: true,
  floatingFilter: true,
};
const ConvertedLayerPage: FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [statusModalDelete, setStatusModalDelete] = useState(false);
  const [valueSelected, setValueSelected] = useState<ConvertedLayer>();
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

  const [columnDefs] = useState<ColDef<ConvertedLayer & ActionField>[]>([
    {
      headerName: "#",
      field: "id",
      maxWidth: 100,
      sortable: true,
      filter: false,
      resizable: false,
    },
    {
      headerName: "Layer Name",
      field: "layer_name",
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
        onDownloadItem: (item: ConvertedLayer) => {
          setValueSelected(item);
          setShowDownloadModal(true);
        },
        onDeleteItem: (item: ConvertedLayer) => {
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
        title="Layers"
        extraTitle={
          <Button
            onClick={() => {}}
            icon={<ReloadOutlined />}
            shape="circle"
            type="text"
            style={{ float: "right", height: "2.5rem" }}
          />
        }
      >
        <BaseTable
          columns={columnDefs}
          api={ConvertedLayerApi.listAgGrid}
          key={keyRender}
          gridOption={{ defaultColDef: defaultColDef }}
        ></BaseTable>
        <DownloadDialog
          showModal={showDownloadModal}
          setShowModal={setShowDownloadModal}
          item={valueSelected}
        />
      </PageContainer>
    </>
  );
};
export default ConvertedLayerPage;
const ActionCellRender: FC<any> = ({ onDownloadItem, onDeleteItem, data }) => {
  if (!data) return <></>;
  return (
    <div className="px-1">
      <Tooltip placement="bottomLeft" title="Convert File">
        <Button
          shape="circle"
          icon={<DownloadOutlined />}
          type="text"
          onClick={() => onDownloadItem(data)}
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
