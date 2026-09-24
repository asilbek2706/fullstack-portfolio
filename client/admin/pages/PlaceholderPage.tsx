import { Card, Empty, Typography } from 'antd';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>{title}</Typography.Title>
          <Typography.Text type="secondary">{description}</Typography.Text>
        </div>
      </div>

      <Card bordered={false}>
        <Empty description="Bu modul keyingi bosqichda ulanadi." />
      </Card>
    </div>
  );
}
