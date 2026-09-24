import { DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Typography } from 'antd';

interface ClearContactsFormValues {
  confirmation: string;
  password: string;
}

interface ClearContactsModalProps {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => Promise<void>;
}

export function ClearContactsModal({
  open,
  loading,
  onCancel,
  onConfirm,
}: ClearContactsModalProps) {
  const [form] = Form.useForm<ClearContactsFormValues>();

  const handleCancel = () => {
    if (loading) return;

    form.resetFields();
    onCancel();
  };

  const handleConfirm = async () => {
    const values = await form.validateFields();

    await onConfirm(values.password);
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title={
        <span className="clear-contacts-title">
          <DeleteOutlined />
          Barcha murojaatlarni o‘chirish
        </span>
      }
      okText="Butunlay o‘chirish"
      cancelText="Bekor qilish"
      okButtonProps={{
        danger: true,
      }}
      confirmLoading={loading}
      closable={!loading}
      maskClosable={!loading}
      onCancel={handleCancel}
      onOk={() => void handleConfirm()}
    >
      <div className="clear-contacts-warning">
        Bu amal barcha murojaat va javoblarni qayta tiklab bo‘lmaydigan tarzda
        o‘chiradi.
      </div>

      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="confirmation"
          label={
            <span>
              Tasdiqlash uchun{' '}
              <Typography.Text code>DELETE_ALL_CONTACTS</Typography.Text> deb
              yozing
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Tasdiqlash matnini kiriting.',
            },
            {
              validator: (_, value: string | undefined) =>
                value === 'DELETE_ALL_CONTACTS'
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(
                        'Tasdiqlash matni aynan bir xil bo‘lishi kerak.',
                      ),
                    ),
            },
          ]}
        >
          <Input
            autoComplete="off"
            placeholder="DELETE_ALL_CONTACTS"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Superadmin paroli"
          rules={[
            {
              required: true,
              message: 'Parolni kiriting.',
            },
            {
              max: 128,
              message: 'Parol 128 belgidan oshmasligi kerak.',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            autoComplete="current-password"
            disabled={loading}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
