import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Descriptions, Drawer, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import type { Contact } from '../../types/contact.types';

interface ContactDetailsDrawerProps {
  contact: Contact | null;
  open: boolean;
  canDelete: boolean;
  onClose: () => void;
  onDelete: (contact: Contact) => void;
}

export function ContactDetailsDrawer({
  contact,
  open,
  canDelete,
  onClose,
  onDelete,
}: ContactDetailsDrawerProps) {
  return (
    <Drawer
      width={560}
      open={open}
      onClose={onClose}
      title="Murojaat tafsilotlari"
      className="contact-details-drawer"
      footer={
        contact && canDelete ? (
          <div className="contact-drawer-footer">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(contact)}
            >
              Murojaatni o‘chirish
            </Button>
          </div>
        ) : null
      }
    >
      {contact && (
        <div className="contact-details">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item
              label={
                <span className="contact-description-label">
                  <UserOutlined />
                  Ism
                </span>
              }
            >
              {contact.name}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="contact-description-label">
                  <PhoneOutlined />
                  Telefon
                </span>
              }
            >
              <a href={`tel:${contact.phone}`}>{contact.phone}</a>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="contact-description-label">
                  <CalendarOutlined />
                  Yuborilgan
                </span>
              }
            >
              {dayjs(contact.createdAt).format('DD.MM.YYYY HH:mm')}
            </Descriptions.Item>

            <Descriptions.Item label="Holat">
              <div className="contact-status-list">
                <Tag
                  icon={
                    contact.isAnswered ? (
                      <CheckCircleOutlined />
                    ) : (
                      <ClockCircleOutlined />
                    )
                  }
                  color={contact.isAnswered ? 'success' : 'warning'}
                >
                  {contact.isAnswered ? 'Javob berilgan' : 'Javob kutilmoqda'}
                </Tag>

                <Tag
                  icon={<EyeOutlined />}
                  color={contact.isPublic ? 'processing' : 'default'}
                >
                  {contact.isPublic ? 'Public' : 'Yashirin'}
                </Tag>
              </div>
            </Descriptions.Item>
          </Descriptions>

          <section className="contact-text-section">
            <Typography.Title level={5}>Foydalanuvchi xabari</Typography.Title>

            <Typography.Paragraph>{contact.message}</Typography.Paragraph>
          </section>

          <section className="contact-text-section contact-answer-section">
            <Typography.Title level={5}>Telegram javobi</Typography.Title>

            {contact.isAnswered && contact.answer ? (
              <Typography.Paragraph>{contact.answer}</Typography.Paragraph>
            ) : (
              <Typography.Text type="secondary">
                Bu murojaatga hali Telegram bot orqali javob berilmagan.
              </Typography.Text>
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
}
