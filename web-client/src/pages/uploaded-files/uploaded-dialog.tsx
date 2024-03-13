import React, { useEffect, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import {
  Upload,
  Modal,
  Typography,
  Form,
  Button,
  Row,
  Col,
  Select,
} from "antd";
import { sdk } from "@/api/axios";
import { JsonToFormDataV2 } from "@/utils/json2formdata";
import { Srs } from "@/api/srs";
import { DefaultOptionType } from "antd/es/select";

const { Dragger } = Upload;

interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  srsList: Srs[];
}

const UploadDialog: React.FC<Props> = ({
  showModal,
  setShowModal,
  setKeyRender,
  srsList,
}) => {
  const { Title } = Typography;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  const [srsOptions, setSrsOptions] = useState<DefaultOptionType[]>([]);

  useEffect(() => {
    if (srsList && srsList.length > 0) {
      setSrsOptions(
        srsList.map((item) => ({ label: item.name, value: item.name }))
      );
    }
  }, [srsList]);

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".dwg,.dxf",
    fileList: fileList,
    beforeUpload: (uploadFile) => {
      setFileList([uploadFile]);
    },
    customRequest: (options: any) => {
      const { onSuccess } = options;
      onSuccess();
    },
    onRemove: () => {
      setFileList([]);
    },
    showUploadList: true,
  };

  const [disabled, setDisabled] = useState<boolean>(false);

  const srs = Form.useWatch("srs", form);

  useEffect(() => {
    if (!fileList || fileList.length <= 0 || !srs) setDisabled(true);
    else setDisabled(false);
  }, [fileList?.[0], srs]);

  const onDiscard = () => {
    setShowModal(false);
  };

  useEffect(() => {
    setFileList([]);
    form.resetFields();
  }, [showModal]);

  const onFinish = async (value: any) => {
    setFileList((state) => {
      state[0].status = "uploading";
      return [...state];
    });
    await sdk
      .post(
        "uploaded-files",
        JsonToFormDataV2({ file: fileList[0], ...value }),
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            setFileList((state) => {
              state[0].percent = (event.loaded / (event.total || 1)) * 100;
              return [...state];
            });
          },
        }
      )
      .then(() => {
        setFileList((state) => {
          state[0].status = "done";
          return [...state];
        });
        setKeyRender(Math.random());
        setShowModal(false);
      })
      .catch((_error) => {
        setFileList((state) => {
          state[0].status = "error";
          return [...state];
        });
      });
  };

  return (
    <Modal
      centered
      forceRender
      open={showModal}
      footer={<></>}
      onCancel={onDiscard}
    >
      <Title style={{ textAlign: "left" }} level={2}>
        Upload File
      </Title>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for only single file upload.
          </p>
        </Dragger>
        <Row gutter={16} className="mt-4">
          <Col span={24}>
            <Form.Item
              name="srs"
              label="Coordinate Reference System"
              rules={[
                {
                  required: true,
                  message: "Please select Coordinate Reference System",
                },
              ]}
            >
              <Select
                options={srsOptions}
                showSearch
                allowClear
                placeholder="Coordinate Reference System"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="mb-0">
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              paddingTop: "1rem",
            }}
          >
            <Button style={{ margin: "4px" }} onClick={() => onDiscard()}>
              Cancel
            </Button>
            <Button
              disabled={disabled}
              style={{ margin: "4px" }}
              htmlType="submit"
              type="primary"
            >
              Upload
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadDialog;
