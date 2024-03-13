import React, { useCallback, useEffect, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import type { CheckboxOptionType, UploadFile, UploadProps } from "antd";
import {
  message,
  Upload,
  Modal,
  Typography,
  Form,
  Button,
  Row,
  Col,
  Select,
  Checkbox,
  Input,
  InputNumber,
} from "antd";
import { OBJECT_SELECTION, OUTPUT_TYPE } from "@/constant";
import { type UploadedFile, UploadedFileApi } from "@/api/uploaded-file";
import { handleNumberPress } from "@/utils/helper";
import { Srs } from "@/api/srs";
import { DefaultOptionType } from "antd/es/select";

interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  item?: UploadedFile;
  srsList: Srs[];
}

const ConvertDialog: React.FC<Props> = ({
  showModal,
  setShowModal,
  item,
  srsList,
}) => {
  const { Title } = Typography;
  const [form] = Form.useForm();

  const [srsOptions, setSrsOptions] = useState<DefaultOptionType[]>([]);

  useEffect(() => {
    if (srsList && srsList.length > 0) {
      setSrsOptions(
        srsList.map((item) => ({ label: item.name, value: item.name }))
      );
    }
  }, [srsList]);

  const onFinish = async (value: any) => {
    await UploadedFileApi.convert(item!.id, value);
    setShowModal(false);
  };

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      geometry_types: item?.metadata?.geometry_types,
      layers: item?.metadata?.layers,
      output_type: OUTPUT_TYPE[0].value,
      min_x: item?.metadata?.bbox?.[0] ?? undefined,
      min_y: item?.metadata?.bbox?.[1] ?? undefined,
      max_x: item?.metadata?.bbox?.[2] ?? undefined,
      max_y: item?.metadata?.bbox?.[3] ?? undefined,
    });
  }, [showModal]);

  const onDiscard = () => {
    setShowModal(false);
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
        Convert File
      </Title>
      <Form layout="vertical" onFinish={onFinish} form={form}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Coordinate Reference System"
              name="srs"
              rules={[{ required: true, message: "Please select SRS" }]}
            >
              <Select
                options={srsOptions}
                placeholder="Coordinate Reference System"
                showSearch
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Object Selection"
              name="geometry_types"
              rules={[
                { required: true, message: "Please select Object Selection" },
              ]}
            >
              <Checkbox.Group
                options={
                  (item?.metadata?.geometry_types?.map((x) => ({
                    label: x,
                    value: x,
                  })) as CheckboxOptionType<string>[]) ?? OBJECT_SELECTION
                }
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Layer"
              name="layers"
              rules={[{ required: true, message: "Please select Layer" }]}
            >
              <Select
                options={item?.metadata?.layers?.map((x) => ({
                  label: x,
                  value: x,
                }))}
                mode="multiple"
                allowClear
                showSearch
                placeholder="Layer"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <div>Bounding Box {"(EPSG 6991)"}</div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="min X"
                  name="min_x"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    onKeyPress={handleNumberPress}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="min Y"
                  name="min_y"
                  rules={[{ required: true }]}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="max X"
                  name="max_x"
                  rules={[{ required: true }]}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="max Y"
                  name="max_y"
                  rules={[{ required: true }]}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
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
            <Button style={{ margin: "4px" }} htmlType="submit" type="primary">
              Convert
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConvertDialog;
