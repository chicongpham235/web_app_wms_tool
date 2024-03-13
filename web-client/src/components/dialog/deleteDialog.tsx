import { FC, useState } from "react";
import { Modal, notification } from "antd";

import ColorButton from "../button";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { AxiosResponse } from "axios";

interface Props {
  openModal: boolean;
  name: string | undefined;
  closeModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  apiDelete: () => Promise<AxiosResponse<any, any>>;
  translation: string;
}
const DeleteDialog: FC<Props> = (props) => {
  const { openModal, closeModal, name, setKeyRender, apiDelete } = props;
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const cancel = () => {
    closeModal(false);
  };
  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiDelete();
      api.success({
        message: "Success",
        description: "Delete success",
      });
    } catch (error) {
      api.error({
        message: "Failed",
        description: (error as any)?.response?.data?.message ?? "Delete failed",
      });
    } finally {
      setKeyRender(Math.random());
      setLoading(false);
      closeModal(false);
    }
  };
  return (
    <div>
      {contextHolder}
      <Modal centered open={openModal} onCancel={cancel} footer={<></>}>
        <div className="delete-icon">
          <div>
            <ExclamationCircleFilled />
          </div>
        </div>

        <div className="modal-title-wapper">
          <p className="modal-title">Delete</p>
          <p className="modal-suptitle">
            Do you want to delete <b> {name} </b> for good? This action can not
            be undone!!
          </p>
        </div>
        <div className="gap-2 pt-4 text-right">
          <ColorButton className="mr-2" onClick={cancel}>
            Cancel
          </ColorButton>
          <ColorButton onClick={handleDelete} loading={loading} type="primary">
            Delete
          </ColorButton>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteDialog;
