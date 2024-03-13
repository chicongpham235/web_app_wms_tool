import {
  Modal,
  Form,
  Input,
  notification,
  Select,
  Switch,
  Checkbox,
  TimePicker,
  DatePicker,
  InputNumber,
  Row,
  Col,
} from "antd";
import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { SiMicrosoftexcel } from "react-icons/si";
import ColorButton from "../button";
import { LaravelValidationResponse } from "@/interface/axios/laravel";
import { convertErrorAxios } from "@/api/axios";
import { AxiosResponse } from "axios";
import { BiTrashAlt } from "react-icons/bi";
import structuredClone from "@ungap/structured-clone";
import { handleNumberPress } from "@/utils/helper";

interface ChildrenOption {
  value: string | number;
  title: string;
}
export interface Option {
  type:
    | "input"
    | "select"
    | "textarea"
    | "inputnumber"
    | "switch"
    | "checkbox"
    | "timepicker"
    | "timerange"
    | "datepicker"
    | "daterange"
    | string;
  name: string;
  password?: boolean;
  children?: ChildrenOption[];
  label: string;
  subTitle?: string;
  rule?: object[];
  mode?: "multiple" | "tags";
  timeFomat?: string;
  placeholder?: string;
  showSearch?: boolean;
  filterOption?: (input: string, option: any) => any;
  min?: number;
  max?: number;
  step?: number;
  formatter?: any;
  parse?: any;
  prefix?: string;
}
interface Props {
  openModal: boolean;
  data?: any;
  closeModal: (value: boolean) => void;
  isEdit: boolean;
  setIsEdit: (value: boolean) => void;
  setKeyRender: (value: number) => void;
  translation: string;
  options: any[];
  apiCreate: (data: any) => Promise<AxiosResponse<any, any>>;
  apiEdit: (data: any) => Promise<AxiosResponse<any, any>>;
  icon?: ReactNode;
  minWidth?: string;
  isSmallerThanMinWidth?: boolean;
}
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const FormDialog: FC<Props> = (props) => {
  const {
    openModal,
    closeModal,
    data,
    isEdit,
    setIsEdit,
    setKeyRender,
    translation,
    options,
    apiCreate,
    apiEdit,
    icon,
    minWidth,
    isSmallerThanMinWidth,
  } = props;
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] =
    useState<LaravelValidationResponse | null>(null);
  const [dynamicItems, setDynamicItems] = useState<any>({});
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (!minWidth) return;
    if (window.screen.width >= parseFloat(minWidth)) {
      setStyle({ minWidth: minWidth });
    } else {
      setStyle({
        minWidth: window.screen.width + "px",
        maxWidth: window.screen.width + "px",
      });
    }
  }, [window.screen.width]);

  useEffect(() => {
    if (data) {
      const dynamicField = options.filter((item: any) => item.is_dynamic)[0];
      if (!dynamicField) {
        setDynamicItems({});
        return;
      }
      const dynamicFieldName = dynamicField.value;
      setDynamicItems(Object.assign({}, [...data[dynamicFieldName]]));
    } else setDynamicItems({});
  }, [data]);

  const addDynamicOption = () => {
    setIsAdded(true);
    const keys = Object.keys(dynamicItems).map((key: string) => parseInt(key));
    const newKey = keys.length == 0 ? 0 : Math.max(...keys) + 1;
    const tempDynamicItems = structuredClone(dynamicItems);
    tempDynamicItems[newKey] = {};
    setDynamicItems(tempDynamicItems);
  };

  useEffect(() => {
    if (isAdded) {
      rowRef.current?.scrollTo({
        top: rowRef?.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isAdded, dynamicItems]);

  const onRemoveDynamicItem = (idx: number | string) => {
    setIsAdded(false);
    const formNamesReset = Object.keys(form.getFieldsValue()).filter(
      (item: any) => parseInt(item.match(/\d+/g)?.join("")) == idx
    );
    form.resetFields(formNamesReset);
    const tempDynamicItems = structuredClone(dynamicItems);
    delete tempDynamicItems[idx];
    setDynamicItems(tempDynamicItems);
  };

  const onFinish = async (values: { [index: string]: any }) => {
    setLoading(true);
    if (isEdit) {
      try {
        await apiEdit({ id: data.id, ...values });
        api.success({
          message: "Success",
          description: "Update success",
        });
        closeModal(false);
        form.resetFields();
        setIsEdit(false);
        setKeyRender(Math.random());
        setDynamicItems({});
        rowRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err: any) {
        const res = convertErrorAxios<LaravelValidationResponse>(err);
        setErrorMessage(err.data);
        if (res.type === "axios-error") {
          api.error({
            message: "Failed",
            description:
              (err as any)?.response?.data?.message ?? "Update failed",
          });
          const { response } = res.error;
          if (response) setErrorMessage(response.data);
        }
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await apiCreate(values);
        api.success({
          message: "Success",
          description: "Create success",
        });
        closeModal(false);
        form.resetFields();
        setKeyRender(Math.random());
        setDynamicItems({});
      } catch (err: any) {
        const res = convertErrorAxios<LaravelValidationResponse>(err);
        setErrorMessage(err.data);
        if (res.type === "axios-error") {
          api.error({
            message: "Failed",
            description: err?.response?.data?.message ?? "Create failed",
          });
          const { response } = res.error;
          if (response) setErrorMessage(response.data);
        }
      } finally {
        setLoading(false);
      }
    }
  };
  const handleChange = (option: any) => {
    if (errorMessage) {
      const updatedErrors = { ...errorMessage.errors };
      if (option.name && updatedErrors[option.name]) {
        updatedErrors[option.name] = [];
        setErrorMessage({ ...errorMessage, errors: updatedErrors });
      }
    }
  };
  const validateForm = (option: any) => {
    if (errorMessage && errorMessage.errors?.[option.name]?.length) {
      return "error";
    }
  };
  const cancel = () => {
    closeModal(false);
    setIsEdit(false);
    form.resetFields();
    setErrorMessage(null);
    rowRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setDynamicItems({});
  };
  useEffect(() => {
    if (isEdit && data) {
      form.setFieldsValue(data);
    }
  }, [isEdit, data, form]);
  const renderOption = (value: Option) => {
    if (value.type.toLowerCase() === "input") {
      return value.password ? (
        <Input.Password
          placeholder={value.placeholder}
          onChange={() => handleChange(value)}
        />
      ) : (
        <Input
          placeholder={value.placeholder}
          onChange={() => handleChange(value)}
        />
      );
    } else if (value.type.toLowerCase() === "inputnumber") {
      return (
        <InputNumber
          className="w-full"
          min={value.min}
          max={value.max}
          step={value.step}
          placeholder={value.placeholder}
          formatter={value.formatter}
          prefix={value.prefix}
          onChange={() => handleChange(value)}
          onKeyPress={handleNumberPress}
        />
      );
    } else if (value.type.toLocaleLowerCase() === "select") {
      return (
        <Select
          placeholder={value.placeholder}
          showSearch={value.showSearch}
          filterOption={value.filterOption}
          allowClear
          mode={value.mode}
        >
          {value.children?.map((item) => (
            <Option key={item.value} value={item.value}>
              {item.title}
            </Option>
          ))}
        </Select>
      );
    } else if (value.type.toLowerCase() === "textarea") {
      return <TextArea placeholder={value.placeholder} />;
    } else if (value.type.toLowerCase() === "switch") {
      return <Switch />;
    } else if (value.type.toLowerCase() === "checkbox") {
      return <Checkbox>{value.subTitle}</Checkbox>;
    } else if (value.type.toLowerCase() === "timepicker") {
      return (
        <TimePicker
          placeholder={value.placeholder}
          format={value.timeFomat}
          onChange={() => handleChange(value)}
        />
      );
    } else if (value.type.toLowerCase() === "timerange") {
      return <TimePicker.RangePicker onChange={() => handleChange(value)} />;
    } else if (value.type.toLowerCase() === "datepicker") {
      return (
        <DatePicker
          placeholder={value.placeholder}
          format={value.timeFomat}
          onChange={() => handleChange(value)}
        />
      );
    } else if (value.type.toLowerCase() === "daterange") {
      return (
        <RangePicker
          format={value.timeFomat}
          onChange={() => handleChange(value)}
        />
      );
    } else {
      return (
        <Input
          placeholder={value.placeholder}
          onChange={() => handleChange(value)}
        />
      );
    }
  };
  return (
    <div>
      {contextHolder}
      <Modal
        centered
        open={openModal}
        onCancel={cancel}
        footer={<></>}
        className="relative"
        style={style}
      >
        <div className="create-icon">
          <div>{icon ? icon : <SiMicrosoftexcel />}</div>
        </div>

        <div className="modal-title-wapper">
          <p className="modal-title">{isEdit ? "Update" : "Create"}</p>
        </div>
        <Form
          className="base-form"
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16} className="form-content" ref={rowRef}>
            {options.map(
              (option: any, index: number) =>
                !option.is_dynamic && (
                  <Col span={option?.size ?? 24} key={index}>
                    <Form.Item
                      label={option.label}
                      name={option.name ? option.name : undefined}
                      rules={option.rule ? option.rule : undefined}
                      valuePropName={
                        option.type.toLowerCase() === "switch" ||
                        option.type.toLowerCase() === "checkbox"
                          ? "checked"
                          : undefined
                      }
                      validateStatus={validateForm(option)}
                      help={
                        errorMessage?.errors?.[option.name]
                          ? errorMessage?.errors?.[option.name][0]
                          : undefined
                      }
                    >
                      {renderOption(option)}
                    </Form.Item>
                  </Col>
                )
            )}
            {options.map(
              (option: any, index: number) =>
                option.is_dynamic && (
                  <Col span={24} key={index}>
                    <Row gutter={16}>
                      <Col span={12}>{option.label}</Col>
                      <Col span={12}>
                        <ColorButton
                          type="primary"
                          size="small"
                          className="float-right"
                          onClick={addDynamicOption}
                        >
                          Add
                        </ColorButton>
                      </Col>
                    </Row>
                    <>
                      {Object.entries(dynamicItems).map(
                        (itemDynamic: any, idxDynamic: number) => {
                          return (
                            <Row
                              gutter={16}
                              key={idxDynamic}
                              style={{ paddingTop: "8px" }}
                            >
                              <Col span={isSmallerThanMinWidth ? 2 : 1}>
                                <ColorButton
                                  type="text"
                                  style={{ marginTop: "4px" }}
                                  size="small"
                                  onClick={() =>
                                    onRemoveDynamicItem(itemDynamic[0])
                                  }
                                >
                                  <BiTrashAlt color="red" />
                                </ColorButton>
                              </Col>
                              {option.items.map((item: any, idx: number) => {
                                return (
                                  <Col span={option.items[idx].size} key={idx}>
                                    <Form.Item
                                      name={item.name + itemDynamic[0]}
                                      rules={item.rule ? item.rule : undefined}
                                      valuePropName={
                                        item.type.toLowerCase() === "switch" ||
                                        item.type.toLowerCase() === "checkbox"
                                          ? "checked"
                                          : undefined
                                      }
                                      validateStatus={validateForm(item)}
                                      help={
                                        errorMessage?.errors?.[item.name]
                                          ? errorMessage?.errors?.[item.name][0]
                                          : undefined
                                      }
                                    >
                                      {renderOption(item)}
                                    </Form.Item>
                                  </Col>
                                );
                              })}
                            </Row>
                          );
                        }
                      )}
                    </>
                  </Col>
                )
            )}
          </Row>
          <Form.Item className="absolute bottom-0 right-0 left-0 px-6 pt-4 bg-white">
            <div className="gap-4 text-right">
              <ColorButton className="mr-2" onClick={cancel}>
                Cancel
              </ColorButton>
              <ColorButton htmlType="submit" loading={loading} type="primary">
                Submit
              </ColorButton>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FormDialog;
