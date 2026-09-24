import { DeleteOutlined, EditOutlined, ReadOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Tooltip } from 'antd';
import type { Faq } from '../../types/faq.types';

interface FaqItemCardProps {
  faq: Faq;
  onEdit: (faq: Faq) => void;
  onDelete: (faq: Faq) => void;
}

export function FaqItemCard({ faq, onEdit, onDelete }: FaqItemCardProps) {
  return (
    <Card bordered={false} className="faq-item-card">
      <div className="faq-item-heading">
        <div className="faq-type-badge">
          <ReadOutlined />
          <span>FAQ</span>
        </div>

        <div className="faq-item-actions">
          <Tooltip title="Tahrirlash">
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={`${faq.question} savolini tahrirlash`}
              onClick={() => onEdit(faq)}
            />
          </Tooltip>

          <Tooltip title="O‘chirish">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`${faq.question} savolini o‘chirish`}
              onClick={() => onDelete(faq)}
            />
          </Tooltip>
        </div>
      </div>

      <h3>{faq.question}</h3>

      <Collapse
        ghost
        size="small"
        items={[
          {
            key: 'answer',
            label: 'Javobni ko‘rish',
            children: <p className="faq-answer">{faq.answer}</p>,
          },
        ]}
      />

      <div className="faq-item-footer">
        <time dateTime={faq.updatedAt}>
          Yangilangan:{' '}
          {new Intl.DateTimeFormat('uz-UZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(new Date(faq.updatedAt))}
        </time>
      </div>
    </Card>
  );
}
