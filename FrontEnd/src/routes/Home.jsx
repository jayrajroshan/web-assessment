import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Statistic, Tag, Typography, Empty, Button, Table as AntTable } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faWallet, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import ContentPanel from '../components/core/layout/ContentPanel';
import Api from '../helpers/core/Api';

const { Text } = Typography;

const CATEGORY_COLORS = {
  salary: 'green',
  freelance: 'cyan',
  investment: 'gold',
  food: 'orange',
  transport: 'blue',
  rent: 'red',
  utilities: 'purple',
  entertainment: 'magenta',
  healthcare: 'lime',
  shopping: 'geekblue',
  other: 'default'
};

const Home = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Api.get('/transactions');
      setTransactions(res.data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalIncome = transactions.filter(txn => txn.type === 'income').reduce((sum, txn) => sum + txn.amount, 0);

  const totalExpenses = transactions.filter(txn => txn.type === 'expense').reduce((sum, txn) => sum + txn.amount, 0);

  const balance = totalIncome - totalExpenses;

  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const formatAmount = value =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

  const recentColumns = [
    {
      title: t('common.date'),
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: value => dayjs(value).format('DD/MM/YYYY')
    },
    {
      title: t('common.type'),
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: value => <Tag color={value === 'income' ? 'success' : 'error'}>{t(`transactions.${value}`)}</Tag>
    },
    {
      title: t('common.category'),
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: value =>
        value ? (
          <Tag color={CATEGORY_COLORS[value] || 'default'}>{t(`transactions.categories.${value}`, value)}</Tag>
        ) : (
          '-'
        )
    },
    {
      title: t('common.description'),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: t('common.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (value, record) => (
        <span
          style={{
            color: record.type === 'income' ? '#52c41a' : '#ff4d4f',
            fontWeight: 600
          }}
        >
          {record.type === 'income' ? '+' : '-'}
          {formatAmount(value)}
        </span>
      )
    }
  ];

  return (
    <ContentPanel title={t('dashboard.title')} loading={loading}>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title={
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faArrowUp} style={{ color: '#52c41a' }} />
                  {t('transactions.totalIncome')}
                </span>
              }
              value={formatAmount(totalIncome)}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title={
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faArrowDown} style={{ color: '#ff4d4f' }} />
                  {t('transactions.totalExpenses')}
                </span>
              }
              value={formatAmount(totalExpenses)}
              valueStyle={{ color: '#ff4d4f', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title={
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faWallet} style={{ color: balance >= 0 ? '#52c41a' : '#ff4d4f' }} />
                  {t('transactions.balance')}
                </span>
              }
              value={formatAmount(balance)}
              valueStyle={{
                color: balance >= 0 ? '#52c41a' : '#ff4d4f',
                fontWeight: 700
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        bordered={false}
        title={
          <div className="flex items-center justify-between">
            <Text strong>{t('dashboard.recentTransactions')}</Text>
            <Link to="/transactions">
              <Button type="link" icon={<FontAwesomeIcon icon={faArrowRight} className="mr-1" />}>
                {t('dashboard.viewAll')}
              </Button>
            </Link>
          </div>
        }
      >
        {recentTransactions.length > 0 ? (
          <AntTable
            dataSource={recentTransactions}
            columns={recentColumns}
            pagination={false}
            rowKey="_id"
            size="small"
          />
        ) : (
          <Empty description={t('transactions.noTransactions')} />
        )}
      </Card>
    </ContentPanel>
  );
};

export default Home;
