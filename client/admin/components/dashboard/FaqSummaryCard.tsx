import { ArrowRightOutlined, ReadOutlined } from '@ant-design/icons';
import { Card, Empty, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { faqApi } from '../../api/faqApi';
import type { Faq } from '../../types/faq.types';

export function FaqSummaryCard() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    faqApi
      .getAll()
      .then((response) => {
        if (!active) return;

        setFaqs(response.data.slice(0, 3));
        setTotal(response.count);
      })
      .catch(() => {
        if (!active) return;

        setFaqs([]);
        setTotal(0);
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
      to="/admin/faq"
      className="dashboard-content-link"
      aria-label="FAQ bo‘limiga o‘tish"
    >
      <Card
        hoverable
        bordered={false}
        className="dashboard-content-card dashboard-faq-card"
      >
        <div className="dashboard-section-heading">
          <div>
            <Typography.Title level={4}>FAQ</Typography.Title>

            <Typography.Text type="secondary">
              {total} ta savol-javob mavjud
            </Typography.Text>
          </div>

          <ArrowRightOutlined />
        </div>

        {loading && (
          <div className="dashboard-faq-loading">
            <Spin />
          </div>
        )}

        {!loading && faqs.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="FAQ mavjud emas"
          />
        )}

        {!loading && faqs.length > 0 && (
          <div className="dashboard-faq-list">
            {faqs.map((faq) => (
              <div className="dashboard-faq-item" key={faq._id}>
                <span className="dashboard-faq-icon">
                  <ReadOutlined />
                </span>

                <strong>{faq.question}</strong>
              </div>
            ))}
          </div>
        )}

        <span className="dashboard-projects-action">
          <ReadOutlined />
          Barcha FAQlarni boshqarish
        </span>
      </Card>
    </Link>
  );
}
