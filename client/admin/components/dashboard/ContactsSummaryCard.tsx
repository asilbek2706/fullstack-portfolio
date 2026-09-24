import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Card, Empty, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contactApi } from '../../api/contactApi';
import type { Contact } from '../../types/contact.types';

export function ContactsSummaryCard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    contactApi
      .getAll({
        page: 1,
        limit: 3,
      })
      .then((response) => {
        if (!active) return;

        setContacts(response.data);
        setTotal(response.pagination.total);
      })
      .catch(() => {
        if (active) {
          setContacts([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Link
      to="/admin/contacts"
      className="dashboard-content-link"
      aria-label="Murojaatlar bo‘limiga o‘tish"
    >
      <Card
        hoverable
        bordered={false}
        className="dashboard-content-card dashboard-contacts-card"
      >
        <div className="dashboard-section-heading">
          <div>
            <Typography.Title level={4}>Murojaatlar</Typography.Title>
            <Typography.Text type="secondary">
              {total} ta murojaat mavjud
            </Typography.Text>
          </div>

          <ArrowRightOutlined />
        </div>

        {loading && (
          <div className="dashboard-contacts-loading">
            <Spin />
          </div>
        )}

        {!loading && contacts.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Murojaatlar mavjud emas"
          />
        )}

        {!loading && contacts.length > 0 && (
          <div className="dashboard-contact-list">
            {contacts.map((contact) => (
              <div className="dashboard-contact-item" key={contact._id}>
                <div className="dashboard-contact-avatar">
                  {contact.name.charAt(0).toUpperCase()}
                </div>

                <div className="dashboard-contact-copy">
                  <strong>{contact.name}</strong>
                  <span>{contact.message}</span>
                </div>

                <div className="dashboard-contact-meta">
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
                    {contact.isAnswered ? 'Javob berilgan' : 'Kutilmoqda'}
                  </Tag>

                  <small>{dayjs(contact.createdAt).format('DD.MM')}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        <span className="dashboard-projects-action">
          <InboxOutlined />
          Barcha murojaatlarni boshqarish
        </span>
      </Card>
    </Link>
  );
}
