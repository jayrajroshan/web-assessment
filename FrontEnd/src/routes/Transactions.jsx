import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Select, DatePicker, Tag, InputNumber, Modal, Button } from 'antd';
import dayjs from 'dayjs';

import ContentPanel from '../components/core/layout/ContentPanel';
import Table from '../components/core/table/Table';
import Api from '../helpers/core/Api';

const CATEGORIES = [
  'salary',
  'freelance',
  'investment',
  'food',
  'transport',
  'rent',
  'utilities',
  'entertainment',
  'healthcare',
  'shopping',
  'other'
];

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

const Transactions = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [data, setData] = useState([]);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Api.get('/transactions');
      setData(res.data.map(item => ({ ...item, key: item._id })));
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

  const handleOpenAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ type: 'expense', date: dayjs() });
    setIsModalOpen(true);
  };

  const handleEdit = record => {
    setEditingId(record._id);
    form.setFieldsValue({
      type: record.type,
      amount: record.amount,
      category: record.category,
      description: record.description,
      date: dayjs(record.date)
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);
      const payload = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        amount: Number(values.amount)
      };

      if (editingId) {
        await Api.patch(`/transactions/${editingId}`, payload);
      } else {
        await Api.post('/transactions', payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
      await fetchData();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async record => {
    await Api.delete(`/transactions/${record._id}`);
    await fetchData();
  };

  const columns = [
    {
      title: t('common.date'),
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: value => dayjs(value).format('DD/MM/YYYY')
    },
    {
      title: t('common.type'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: value => <Tag color={value === 'income' ? 'success' : 'error'}>{t(`transactions.${value}`)}</Tag>
    },
    {
      title: t('common.category'),
      dataIndex: 'category',
      key: 'category',
      width: 130,
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
      width: 130,
      align: 'right',
      render: (value, record) => (
        <span
          style={{
            color: record.type === 'income' ? '#52c41a' : '#ff4d4f',
            fontWeight: 600
          }}
        >
          {record.type === 'income' ? '+' : '-'}
          {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(value)}
        </span>
      )
    }
  ];

  const renderModal = () => (
    <Modal
      title={editingId ? t('common.edit') : t('transactions.addNew')}
      open={isModalOpen}
      onOk={handleSave}
      onCancel={handleCancel}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={isSaving} onClick={handleSave}>
          {t('common.save')}
        </Button>
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ type: 'expense', date: dayjs() }}>
        <Form.Item name="type" label={t('common.type')} rules={[{ required: true, message: t('validation.required') }]}>
          <Select>
            <Select.Option value="expense">{t('transactions.expense')}</Select.Option>
            <Select.Option value="income">{t('transactions.income')}</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="amount"
          label={t('common.amount')}
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="category"
          label={t('common.category')}
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <Select>
            {CATEGORIES.map(cat => (
              <Select.Option key={cat} value={cat}>
                {t(`transactions.categories.${cat}`)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="description"
          label={t('common.description')}
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="date" label={t('common.date')} rules={[{ required: true, message: t('validation.required') }]}>
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <ContentPanel title={t('transactions.title')} loading={false}>
      <Table
        loading={loading}
        dataSource={data}
        columns={columns}
        searchBar
        onChangeSearchBar={e => {
          const search = decodeURIComponent(e.target.value).toLowerCase();
          if (!search) return fetchData();
          return setData(prev =>
            prev.filter(
              item =>
                item.description.toLowerCase().includes(search) ||
                item.category?.toLowerCase().includes(search) ||
                item.type.toLowerCase().includes(search)
            )
          );
        }}
        deleteSaveButtonOnRow
        onDelete={handleDelete}
        editCancelButtonOnRow
        onEdit={handleEdit}
        addForm={{
          onClick: handleOpenAdd
        }}
        setupAddForm={renderModal}
        totalCount={data.length}
        rowKey="_id"
      />
    </ContentPanel>
  );
};

export default Transactions;
