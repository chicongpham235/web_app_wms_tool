import {
  type FC,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { LicenseManager } from "ag-grid-enterprise";
LicenseManager.prototype.validateLicense = function () {
  /* eslint-disable */
  // @ts-ignore
  // disable show lis
  this.licenseManager = {
    isDisplayWatermark: () => {},
  };
};
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./styleTableOverwrite.scss";

import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import {
  GridReadyEvent,
  ColDef,
  GridApi,
  // GridOptions,
} from "ag-grid-community";
import { Pagination, type PaginationProps } from "antd";
import { ApiListReturn, Paginate } from "@/interface/axios";
import { CallbackGetData, DataSource } from "@/hooks/useAgGrid";
import { useAppDispatch, useAppSelector } from "@/stores/hook";
import { getTableStateByTable, setTableState } from "@/stores/features/table";

const defaultColDef = {
  minWidth: 150,
  resizable: true,
  rowDrag: false,
  suppressMovable: true,
  filterParams: {
    buttons: ["reset", "apply"],
  },
};
const BaseTable: FC<{
  columns: ColDef[];
  api: CallbackGetData;
  gridOption?: AgGridReactProps;
  paginationOption?: PaginationProps;
  defaultParams?: object;
  initFilter?: object;
  onCellEditingStopped?: any;
}> = ({
  columns,
  api,
  gridOption = {},
  paginationOption = {},
  defaultParams = {},
  initFilter,
  onCellEditingStopped,
}) => {
  const dispatch = useAppDispatch();

  const defaultState = useAppSelector((state) => getTableStateByTable(state));
  const [id, setId] = useState(1);
  const [pagination, setPagination] = useState<Paginate>({
    count: 1,
    hasMoreItems: true,
    itemsPerPage: 10,
    page: 1,
    total: 1,
    totalPage: 1,
    ...defaultState.pagination,
  });
  const callbackSuccess = useCallback(
    (data: ApiListReturn<any>) => {
      setPagination((state) => {
        return { ...state, ...data.pagination };
      });
    },
    [setPagination]
  );
  const dataSource = useMemo(
    () => new DataSource<any>(api, callbackSuccess, pagination, defaultParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );
  const resetDataSource = useCallback(() => {
    setId((state) => {
      return ++state;
    });
  }, []);
  const gridApi = useRef<GridApi>();
  useEffect(() => {
    if (!gridApi.current) {
      return;
    }
  }, [gridApi]);
  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridApi.current = params.api;
      if (initFilter) {
        gridApi.current.setFilterModel(initFilter);
      }
      if (defaultState && defaultState.params) {
        dataSource.setDefaultParams(defaultState.params);
      }
      dataSource.setGridApi(params.api);
      gridApi.current.setServerSideDatasource(dataSource);
      params.api.sizeColumnsToFit();
      if (gridApi.current && columns) {
        gridApi.current.setColumnDefs(columns);
      }
    },
    [dataSource]
  );
  useEffect(() => {
    if (gridApi.current && dataSource) {
      dataSource.setGridApi(gridApi.current);
      gridApi.current.setServerSideDatasource(dataSource);
    }
  }, [dataSource.id]);
  useEffect(() => {
    if (gridApi.current && columns) {
      gridApi.current.setColumnDefs(columns);
    }
  }, [columns]);

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = useCallback(
    (current: number, pageSize: number) => {
      setPagination((state) => {
        return {
          ...state,
          itemsPerPage: pageSize,
          page: current,
        };
      });
      dispatch(
        setTableState({
          pagination: {
            itemsPerPage: pageSize,
            page: current,
          },
        })
      );
      resetDataSource();
    },
    []
  );

  const onFirstDataRendered = useCallback((params: any) => {
    if (defaultState && defaultState.params) {
      dataSource.setDefaultParams(defaultState.params);
      params.api.setFilterModel(defaultState.params.filterModel);
    }
  }, []);

  const onFilterChanged = useCallback(() => {
    if (pagination.page && pagination.page == 1) return;
    setPagination((state) => {
      return {
        ...state,
        page: 1,
      };
    });
    resetDataSource();
  }, [pagination.page]);

  return (
    <div className="d-flex flex-column full-height full-width pa-4">
      <div className="flex-grow-1 ag-theme-alpine">
        <AgGridReact
          className="full-height full-width"
          rowModelType="serverSide"
          columnDefs={columns}
          onGridReady={onGridReady}
          paginationPageSize={pagination.itemsPerPage}
          cacheBlockSize={0}
          overlayLoadingTemplate={
            '<div class="loadingx" style="margin: 7em"></div> <span class="ag-overlay-loading-center " style="font-size: 18px; z-index: 100000"> </span>'
          }
          enableCellTextSelection
          {...gridOption}
          defaultColDef={{ ...gridOption.defaultColDef, ...defaultColDef }}
          onCellEditingStopped={onCellEditingStopped}
          onFilterChanged={onFilterChanged}
          onFirstDataRendered={onFirstDataRendered}
        ></AgGridReact>
      </div>
      <div
        className="flex-grow-0"
        style={{
          padding: "8px 0",
          textAlign: "center",
        }}
      >
        <Pagination
          current={pagination.page}
          pageSize={pagination.itemsPerPage}
          showSizeChanger
          onChange={onShowSizeChange}
          total={pagination.total}
          {...paginationOption}
        />
      </div>
    </div>
  );
};
export default BaseTable;
