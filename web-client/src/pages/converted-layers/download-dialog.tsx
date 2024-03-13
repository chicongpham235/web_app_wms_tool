import React, { useEffect, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { Modal, Typography, Form, Button, Row, Col, Select, Input } from "antd";
import { ConvertedLayer, ConvertedLayerApi } from "@/api/converted-layer";
import { OUTPUT_TYPE } from "@/constant";
import saveAs from "file-saver";

interface Props {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  item?: ConvertedLayer;
}

const DownloadDialog: React.FC<Props> = ({ showModal, item, setShowModal }) => {
  const { Title } = Typography;
  const [form] = Form.useForm();

  useEffect(() => {
    if (!item) return;
    form.setFieldsValue(item);
  }, [item]);

  const onDiscard = () => {
    setShowModal(false);
  };

  function downloadURI(uri: string, name: string) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const onFinish = async (value: any) => {
    try {
      const res = await ConvertedLayerApi.download(item!.id, value);
      if (res && res.status == 200) {
        if (value.output_type == OUTPUT_TYPE[0].value) {
          downloadURI(res.data, `${item!.uuid}.geojson`);
        } else if (value.output_type == OUTPUT_TYPE[1].value) {
          downloadURI(res.data, `${item!.uuid}.kml`);
        } else if (value.output_type == OUTPUT_TYPE[2].value) {
          downloadURI(res.data, `${item!.uuid}.zip`);
        }
      }
      setShowModal(false);
    } catch (error) {
      //
    }
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
        Download
      </Title>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={16} className="mt-4">
          <Col span={24}>
            <Form.Item name="layer_name" label="Layer Name">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="output_type"
              label="Output Type"
              rules={[
                {
                  required: true,
                  message: "Please select Output Type",
                },
              ]}
            >
              <Select
                options={OUTPUT_TYPE}
                showSearch
                allowClear
                placeholder="Output Format"
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
            <Button style={{ margin: "4px" }} htmlType="submit" type="primary">
              Download
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DownloadDialog;
