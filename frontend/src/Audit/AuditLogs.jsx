import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Drawer,
  Descriptions,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  UserOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({
    moduleName: '',
    actionType: '',
    search: '',
    dateRange: null
  });
  const [stats, setStats] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [cleanupModalVisible, setCleanupModalVisible] = useState(false);
  const [form] = Form.useForm();

  const moduleOptions = [
    'User', 'Leave', 'Expense', 'Payroll', 'Auth', 'Role', 'Settings'
  ];

  const actionOptions = [
    'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SUBMIT', 'LOGIN', 'LOGOUT'
  ];

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [pagination.page, pagination.limit, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();
      }

      const response = await axios.get('/api/audit', { params });
      
      if (response.data.success) {
        setLogs(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      message.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = {};
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();
      }

      const response = await axios.get('/api/audit/stats', { params });
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await axios.get(`/api/audit/${id}`);
      
      if (response.data.success) {
        setSelectedLog(response.data.data);
        setDrawerVisible(true);
      }
    } catch (error) {
      message.error('Failed to fetch log details');
    }
  };

  const handleExport = async () => {
    try {
      const params = { ...filters };
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();
      }

      const response = await axios.get('/api/audit/export', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success('Audit logs exported successfully');
    } catch (error) {
      message.error('Failed to export audit logs');
    }
  };

  const handleCleanup = async (values) => {
    try {
      const response = await axios.delete('/api/audit/cleanup', {
        data: { daysToKeep: values.daysToKeep }
      });

      if (response.data.success) {
        message.success(response.data.message);
        setCleanupModalVisible(false);
        fetchLogs();
        fetchStats();
        form.resetFields();
      }
    } catch (error) {
      message.error('Failed to cleanup audit logs');
    }
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'green',
      UPDATE: 'blue',
      DELETE: 'red',
      APPROVE: 'success',
      REJECT: 'error',
      SUBMIT: 'cyan',
      LOGIN: 'purple',
      LOGOUT: 'default'
    };
    return colors[action] || 'default';
  };

  const getModuleIcon = (module) => {
    const icons = {
      User: <UserOutlined />,
      Leave: <FileTextOutlined />,
      Expense: <FileTextOutlined />,
      Payroll: <FileTextOutlined />,
      Auth: <UserOutlined />
    };
    return icons[module] || <AppstoreOutlined />;
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix()
    },
    {
      title: 'Module',
      dataIndex: 'moduleName',
      key: 'moduleName',
      width: 120,
      render: (text) => (
        <Space>
          {getModuleIcon(text)}
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Action',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 100,
      render: (text) => (
        <Tag color={getActionColor(text)}>{text}</Tag>
      )
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user) => user ? (
        <Space>
          <UserOutlined />
          <span>{user.firstName} {user.lastName}</span>
          <Tag>{user.employeeCode}</Tag>
        </Space>
      ) : 'System'
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
      render: (text) => text || 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.id)}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={24}>
              <Space style={{ float: 'right' }}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setFilterDrawerVisible(true)}
                >
                  Filters
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    fetchLogs();
                    fetchStats();
                  }}
                >
                  Refresh
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExport}
                  type="primary"
                >
                  Export
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => setCleanupModalVisible(true)}
                  danger
                >
                  Cleanup
                </Button>
              </Space>
            </Col>
          </Row>

          {stats && (
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Logs"
                    value={stats.totalLogs}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Modules"
                    value={stats.moduleStats?.length || 0}
                    prefix={<AppstoreOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Actions"
                    value={stats.actionStats?.length || 0}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Users"
                    value={new Set(logs.map(l => l.userId)).size}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <Table
            columns={columns}
            dataSource={logs}
            loading={loading}
            rowKey="id"
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, page, limit: pageSize }));
              }
            }}
            scroll={{ x: 1200 }}
          />
        </Space>
      </Card>

      <Drawer
        title="Audit Log Details"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedLog && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{selectedLog.id}</Descriptions.Item>
            <Descriptions.Item label="Timestamp">
              {dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Module">
              <Tag>{selectedLog.moduleName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Action">
              <Tag color={getActionColor(selectedLog.actionType)}>
                {selectedLog.actionType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="User">
              {selectedLog.user ? (
                `${selectedLog.user.firstName} ${selectedLog.user.lastName} (${selectedLog.user.employeeCode})`
              ) : 'System'}
            </Descriptions.Item>
            <Descriptions.Item label="IP Address">
              {selectedLog.ipAddress || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Old Data">
              <pre style={{ maxHeight: 200, overflow: 'auto' }}>
                {JSON.stringify(selectedLog.oldData, null, 2)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="New Data">
              <pre style={{ maxHeight: 200, overflow: 'auto' }}>
                {JSON.stringify(selectedLog.newData, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <Drawer
        title="Filters"
        width={400}
        open={filterDrawerVisible}
        onClose={() => setFilterDrawerVisible(false)}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Input
            placeholder="Search logs..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            allowClear
          />

          <Select
            placeholder="Select Module"
            style={{ width: '100%' }}
            value={filters.moduleName}
            onChange={(value) => setFilters(prev => ({ ...prev, moduleName: value }))}
            allowClear
          >
            {moduleOptions.map(module => (
              <Option key={module} value={module}>{module}</Option>
            ))}
          </Select>

          <Select
            placeholder="Select Action"
            style={{ width: '100%' }}
            value={filters.actionType}
            onChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}
            allowClear
          >
            {actionOptions.map(action => (
              <Option key={action} value={action}>{action}</Option>
            ))}
          </Select>

          <RangePicker
            style={{ width: '100%' }}
            value={filters.dateRange}
            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
          />

          <Button
            type="primary"
            block
            onClick={() => {
              setFilterDrawerVisible(false);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            Apply Filters
          </Button>

          <Button
            block
            onClick={() => {
              setFilters({
                moduleName: '',
                actionType: '',
                search: '',
                dateRange: null
              });
            }}
          >
            Clear Filters
          </Button>
        </Space>
      </Drawer>

      <Modal
        title="Cleanup Audit Logs"
        open={cleanupModalVisible}
        onCancel={() => setCleanupModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCleanup} layout="vertical">
          <Form.Item
            name="daysToKeep"
            label="Delete logs older than (days)"
            rules={[{ required: true, message: 'Please enter number of days' }]}
          >
            <Input type="number" min={30} max={365} placeholder="e.g., 90" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" danger>
                Delete Old Logs
              </Button>
              <Button onClick={() => setCleanupModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Box>
  );
};

export default AuditLogs;