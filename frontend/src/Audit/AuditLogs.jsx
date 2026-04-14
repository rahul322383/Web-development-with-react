import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
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
  Drawer,
  Statistic,
  Row,
  Col,
  Typography,
  Divider,
  Empty,
  Spin,
  Badge,
  Alert,
  Grid,
  Popconfirm,
  InputNumber,
  Tabs,
  Progress,
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
  FileTextOutlined,
  ClearOutlined,
  DownloadOutlined,
  CopyOutlined,
  DatabaseOutlined,
  TeamOutlined,
  TagOutlined,
  CalendarOutlined,
  GlobalOutlined,
  SettingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';
import { 
  getAuditLogs, 
  getAuditStats, 
  getAuditLogById, 
  exportAuditLogs, 
  deleteOldAuditLogs 
} from '../api/auditApi';
import {StatCardSkeleton} from '../components/ui/StatCardSkeleton';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

// Simple JSON Viewer Component
const SimpleJsonViewer = ({ data, isDarkMode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    message.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="p-4 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Text type="secondary">No data available</Text>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-end mb-2">
        <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy JSON'}
        </Button>
      </div>
      <div
        className="rounded-lg overflow-auto"
        style={{
          maxHeight: '300px',
          background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
          border: `1px solid ${isDarkMode ? '#303030' : '#e0e0e0'}`,
        }}
      >
        <pre
          className="p-3 m-0 text-sm font-mono"
          style={{
            color: isDarkMode ? '#d4d4d4' : '#333333',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, loading, color }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <StatCardSkeleton loading={loading} active paragraph={{ rows: 1 }} title={false}>
      <div className="flex justify-between items-center">
        <div>
          <Text type="secondary" className="text-sm">
            {title}
          </Text>
          <div className="text-2xl font-bold mt-1">{value?.toLocaleString() ?? 0}</div>
        </div>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: `${color}15`, color: color }}
        >
          <Icon className="text-xl" />
        </div>
      </div>
    </StatCardSkeleton>
  </Card>
);

// Action Tag Component
const ActionTag = ({ action }) => {
  const getActionColor = (actionType) => {
    const colors = {
      CREATE: 'success',
      UPDATE: 'processing',
      DELETE: 'error',
      APPROVE: 'success',
      REJECT: 'error',
      SUBMIT: 'warning',
      LOGIN: 'purple',
      LOGOUT: 'default',
    };
    return colors[actionType] || 'default';
  };

  return (
    <Tag color={getActionColor(action)} className="rounded-full px-3">
      {action}
    </Tag>
  );
};

// Module Icon Component
const ModuleIcon = ({ module: moduleName }) => {
  const iconMap = {
    User: <UserOutlined />,
    Leave: <CalendarOutlined />,
    Expense: <FileTextOutlined />,
    Payroll: <FileTextOutlined />,
    Auth: <UserOutlined />,
    Role: <TeamOutlined />,
    Settings: <SettingOutlined />
  };
  return iconMap[moduleName] || <AppstoreOutlined />;
};

// Log Details Drawer Component
const LogDetailsDrawer = ({ visible, onClose, log, isDarkMode }) => {
  if (!log) return null;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <EyeOutlined />
          <span>Audit Log Details</span>
          <ActionTag action={log.actionType} />
        </div>
      }
      width={720}
      open={visible}
      onClose={onClose}
      placement="right"
    >
      <div className="space-y-4">
        {/* Basic Info */}
        <Card size="small" title="Basic Information">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text type="secondary">Log ID:</Text>
              <Text code>{log.id}</Text>
            </div>
            <div className="flex justify-between">
              <Text type="secondary">Timestamp:</Text>
              <Text>{dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>
            </div>
            <div className="flex justify-between">
              <Text type="secondary">Module:</Text>
              <Text>
                <ModuleIcon module={log.moduleName} /> {log.moduleName}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text type="secondary">IP Address:</Text>
              <Text>{log.ipAddress || 'N/A'}</Text>
            </div>
            <div className="flex justify-between">
              <Text type="secondary">User Agent:</Text>
              <Text ellipsis className="max-w-md">
                {log.userAgent || 'N/A'}
              </Text>
            </div>
          </div>
        </Card>

        {/* User Info */}
        {log.user && (
          <Card size="small" title="User Information">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text type="secondary">Name:</Text>
                <Text>{log.user.firstName} {log.user.lastName}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Email:</Text>
                <Text>{log.user.email}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Employee Code:</Text>
                <Text>{log.user.employeeCode}</Text>
              </div>
            </div>
          </Card>
        )}

        {/* Old Data */}
        {log.oldData && Object.keys(log.oldData).length > 0 && (
          <Card size="small" title="Old Data">
            <SimpleJsonViewer data={log.oldData} isDarkMode={isDarkMode} />
          </Card>
        )}

        {/* New Data */}
        {log.newData && Object.keys(log.newData).length > 0 && (
          <Card size="small" title="New Data">
            <SimpleJsonViewer data={log.newData} isDarkMode={isDarkMode} />
          </Card>
        )}
      </div>
    </Drawer>
  );
};

// Main Component
const AuditLogs = () => {
  const screens = useBreakpoint();
  const isDarkMode = false; // Replace with your theme context

  // State
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({
    moduleName: '',
    actionType: '',
    search: '',
    dateRange: null,
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const [stats, setStats] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [cleanupModalVisible, setCleanupModalVisible] = useState(false);
  const [form] = Form.useForm();
  const searchTimeout = useRef(null);

  const moduleOptions = ['User', 'Leave', 'Expense', 'Payroll', 'Auth', 'Role', 'Settings'];
  const actionOptions = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SUBMIT', 'LOGIN', 'LOGOUT'];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.moduleName) count++;
    if (filters.actionType) count++;
    if (filters.search) count++;
    if (filters.dateRange && filters.dateRange[0]) count++;
    return count;
  }, [filters]);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        moduleName: filters.moduleName || undefined,
        actionType: filters.actionType || undefined,
        search: filters.search || undefined,
      };

      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();
      }

      const response = await getAuditLogs(params);
      
      if (response.success) {
        setLogs(response.data);
        setPagination(prev => ({ ...prev, total: response.pagination.total }));
      } else {
        message.error(response.message || 'Failed to fetch audit logs');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = {};
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();
      }

      const response = await getAuditStats(params);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [filters.dateRange]);

  // View details
  const handleViewDetails = async (id) => {
    try {
      const response = await getAuditLogById(id);
      if (response.success) {
        setSelectedLog(response.data);
        setDrawerVisible(true);
      } else {
        message.error(response.message || 'Failed to fetch log details');
      }
    } catch (error) {
      message.error('Failed to fetch log details');
    }
  };

  // Export logs
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = {
        moduleName: filters.moduleName || undefined,
        actionType: filters.actionType || undefined,
      };

      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();
      }

      const blob = await exportAuditLogs(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${dayjs().format('YYYY-MM-DD-HHmmss')}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Audit logs exported successfully');
    } catch (error) {
      message.error('Failed to export audit logs');
    } finally {
      setExportLoading(false);
    }
  };

  // Cleanup old logs
  const handleCleanup = async (values) => {
    setCleanupLoading(true);
    try {
      const response = await deleteOldAuditLogs(values.daysToKeep);
      if (response.success) {
        message.success(response.message);
        setCleanupModalVisible(false);
        form.resetFields();
        fetchLogs();
        fetchStats();
      } else {
        message.error(response.message || 'Failed to cleanup audit logs');
      }
    } catch (error) {
      message.error('Failed to cleanup audit logs');
    } finally {
      setCleanupLoading(false);
    }
  };

  // Handle search with debounce
  const handleSearch = (value) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
  };

  // Apply filters
  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setFilterDrawerVisible(false);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    const emptyFilters = {
      moduleName: '',
      actionType: '',
      search: '',
      dateRange: null,
    };
    setFilters(emptyFilters);
    setTempFilters(emptyFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Table columns
  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (text) => (
        <Tooltip title={dayjs(text).format('dddd, MMMM D, YYYY HH:mm:ss')}>
          <div className="flex items-center gap-2">
            <ClockCircleOutlined />
            <span>{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</span>
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
    },
    {
      title: 'Module',
      dataIndex: 'moduleName',
      key: 'moduleName',
      width: 140,
      render: (text) => (
        <div className="flex items-center gap-2">
          <ModuleIcon module={text} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 110,
      render: (text) => <ActionTag action={text} />,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user) => user ? (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>{user.firstName} {user.lastName}</span>
          <Tag>{user.employeeCode}</Tag>
        </div>
      ) : <Tag>System</Tag>,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
      render: (text) => text || '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.id)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Card className="shadow-sm">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileTextOutlined className="text-blue-500 text-xl" />
              </div>
              <div>
                <Title level={4} className="!m-0">
                  Audit Logs
                </Title>
                <Text type="secondary">Track and monitor all system activities</Text>
              </div>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => { fetchLogs(); fetchStats(); }}>
                Refresh
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exportLoading}>
                Export
              </Button>
              <Button icon={<DeleteOutlined />} danger onClick={() => setCleanupModalVisible(true)}>
                Cleanup
              </Button>
              <Badge count={activeFilterCount}>
                <Button
                  type={activeFilterCount > 0 ? 'primary' : 'default'}
                  icon={<FilterOutlined />}
                  onClick={() => {
                    setTempFilters({ ...filters });
                    setFilterDrawerVisible(true);
                  }}
                >
                  Filters
                </Button>
              </Badge>
            </Space>
          </div>

          {/* Stats Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Total Logs"
                value={stats?.totalLogs}
                icon={DatabaseOutlined}
                loading={statsLoading}
                color="#1890ff"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Modules"
                value={stats?.moduleStats?.length}
                icon={AppstoreOutlined}
                loading={statsLoading}
                color="#52c41a"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Action Types"
                value={stats?.actionStats?.length}
                icon={TagOutlined}
                loading={statsLoading}
                color="#faad14"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Unique Users"
                value={new Set(logs.map(l => l.userId).filter(Boolean)).size}
                icon={TeamOutlined}
                loading={loading}
                color="#722ed1"
              />
            </Col>
          </Row>

          {/* Search Bar */}
          <div className="flex justify-between items-center flex-wrap gap-3">
            <Input
              placeholder="Search logs by module, action, or user..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={filters.search}
              allowClear
              className="md:w-80"
              size="large"
            />
            {activeFilterCount > 0 && (
              <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                Clear all filters
              </Button>
            )}
          </div>

          {/* Table */}
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={logs}
              rowKey="id"
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} items`,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: (page, pageSize) => {
                  setPagination({ page, limit: pageSize, total: pagination.total });
                },
              }}
              scroll={{ x: 1000 }}
              locale={{
                emptyText: <Empty description="No audit logs found" />,
              }}
            />
          </Spin>
        </div>
      </Card>

      {/* Filter Drawer */}
      <Drawer
        title="Filter Audit Logs"
        width={400}
        open={filterDrawerVisible}
        onClose={() => setFilterDrawerVisible(false)}
        extra={
          <Button onClick={() => {
            setTempFilters({ moduleName: '', actionType: '', search: '', dateRange: null });
          }}>
            Reset
          </Button>
        }
      >
        <div className="space-y-6">
          <div>
            <Text strong>Module</Text>
            <Select
              placeholder="All modules"
              className="w-full mt-2"
              value={tempFilters.moduleName || undefined}
              onChange={(value) => setTempFilters(prev => ({ ...prev, moduleName: value }))}
              allowClear
              size="large"
            >
              {moduleOptions.map(module => (
                <Option key={module} value={module}>
                  <div className="flex items-center gap-2">
                    <ModuleIcon module={module} />
                    {module}
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text strong>Action Type</Text>
            <Select
              placeholder="All actions"
              className="w-full mt-2"
              value={tempFilters.actionType || undefined}
              onChange={(value) => setTempFilters(prev => ({ ...prev, actionType: value }))}
              allowClear
              size="large"
            >
              {actionOptions.map(action => (
                <Option key={action} value={action}>
                  <ActionTag action={action} />
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text strong>Date Range</Text>
            <RangePicker
              className="w-full mt-2"
              value={tempFilters.dateRange}
              onChange={(dates) => setTempFilters(prev => ({ ...prev, dateRange: dates }))}
              size="large"
              presets={[
                { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
                { label: 'Last 7 days', value: [dayjs().subtract(7, 'day'), dayjs()] },
                { label: 'Last 30 days', value: [dayjs().subtract(30, 'day'), dayjs()] },
              ]}
            />
          </div>

          <Divider />

          <div className="flex gap-3">
            <Button block size="large" onClick={() => setFilterDrawerVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" block size="large" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Log Details Drawer */}
      <LogDetailsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        log={selectedLog}
        isDarkMode={isDarkMode}
      />

      {/* Cleanup Modal */}
      <Modal
        title="Cleanup Old Audit Logs"
        open={cleanupModalVisible}
        onCancel={() => setCleanupModalVisible(false)}
        footer={null}
        centered
      >
        <Form form={form} onFinish={handleCleanup} layout="vertical">
          <Form.Item
            name="daysToKeep"
            label="Delete logs older than (days)"
            rules={[
              { required: true, message: 'Please enter number of days' },
              { type: 'number', min: 30, max: 365, message: 'Must be between 30 and 365' },
            ]}
          >
            <InputNumber
              placeholder="e.g., 90"
              className="w-full"
              min={30}
              max={365}
              size="large"
            />
          </Form.Item>

          <Alert
            message="Warning: This action is irreversible"
            description="All audit logs older than the specified number of days will be permanently deleted."
            type="error"
            showIcon
            className="mb-6"
          />

          <div className="flex justify-end gap-3">
            <Button onClick={() => setCleanupModalVisible(false)} size="large">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" danger loading={cleanupLoading} size="large">
              Delete Old Logs
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AuditLogs;