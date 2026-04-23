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
  Descriptions,
  Collapse,
  Skeleton,
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
  DatabaseOutlined,
  TeamOutlined,
  TagOutlined,
  SettingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';
import { getAuditLogs, getAuditStats, getAuditLogById, exportAuditLogs, deleteOldAuditLogs } from '../api/auditApi';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

// ============================================================
//  Industry‑standard change display (replaces JSON viewer)
// ============================================================
const ChangeDisplay = ({ oldData, newData }) => {
  if ((!oldData || Object.keys(oldData).length === 0) && (!newData || Object.keys(newData).length === 0)) {
    return <Empty description="No changes recorded" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  // If it's a CREATE action (no oldData)
  if (!oldData || Object.keys(oldData).length === 0) {
    return (
      <div>
        <div className="mb-3 font-semibold text-green-600 flex items-center gap-2">
          <CheckCircleOutlined /> New Record Created
        </div>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          {Object.entries(newData).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
              {formatValue(value)}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>
    );
  }

  // If it's a DELETE action (no newData)
  if (!newData || Object.keys(newData).length === 0) {
    return (
      <div>
        <div className="mb-3 font-semibold text-red-600 flex items-center gap-2">
          <WarningOutlined /> Record Deleted
        </div>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          {Object.entries(oldData).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
              {formatValue(value)}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>
    );
  }

  // UPDATE action – show only changed fields
  const changedKeys = Object.keys(newData).filter(key =>
    JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])
  );

  if (changedKeys.length === 0) {
    return <Alert message="No visible changes" type="info" showIcon />;
  }

  return (
    <div>
      <div className="mb-3 font-semibold text-blue-600 flex items-center gap-2">
        <SwapOutlined /> Field Changes ({changedKeys.length})
      </div>
      <Collapse
        defaultActiveKey={changedKeys.slice(0, 3)}
        items={changedKeys.map(key => ({
          key,
          label: <span className="font-mono">{key}</span>,
          children: (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="mb-2">
                <Text type="secondary" className="text-xs">Old value</Text>
                <div className="bg-white dark:bg-gray-900 p-2 rounded border mt-1">
                  {formatValue(oldData[key])}
                </div>
              </div>
              <div>
                <Text type="secondary" className="text-xs">New value</Text>
                <div className="bg-white dark:bg-gray-900 p-2 rounded border mt-1">
                  {formatValue(newData[key])}
                </div>
              </div>
            </div>
          ),
        }))}
      />
    </div>
  );

  function formatValue(value) {
    if (value === null || value === undefined) return <Text type="secondary">—</Text>;
    if (typeof value === 'object') return <pre className="text-xs m-0">{JSON.stringify(value, null, 2)}</pre>;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  }
};

// ============================================================
//  Responsive Stats Card
// ============================================================
const StatsCard = ({ title, value, icon: Icon, loading, color }) => (
  <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full">
    <Skeleton loading={loading} active paragraph={{ rows: 1 }} title={false}>
      <div className="flex justify-between items-center">
        <div>
          <Text type="secondary" className="text-xs sm:text-sm">{title}</Text>
          <div className="text-xl sm:text-2xl font-bold mt-1">{value?.toLocaleString() ?? 0}</div>
        </div>
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
          style={{ background: `${color}15`, color }}
        >
          <Icon className="text-base sm:text-xl" />
        </div>
      </div>
    </Skeleton>
  </Card>
);

// ============================================================
//  Action Tag with consistent styling
// ============================================================
const ActionTag = ({ action }) => {
  const colorMap = {
    CREATE: 'success', UPDATE: 'processing', DELETE: 'error',
    APPROVE: 'success', REJECT: 'error', SUBMIT: 'warning',
    LOGIN: 'purple', LOGOUT: 'default',
  };
  return <Tag color={colorMap[action] || 'default'} className="rounded-full px-3">{action}</Tag>;
};

// ============================================================
//  Main Component
// ============================================================
const AuditLogs = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // State
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    return Object.entries(filters).filter(([k, v]) => k !== 'search' && v).length +
      (filters.search ? 1 : 0);
  }, [filters]);

  // Fetch logs with error handling & retry capability
  const fetchLogs = useCallback(async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        moduleName: filters.moduleName || undefined,
        actionType: filters.actionType || undefined,
        search: filters.search || undefined,
      };
      if (filters.dateRange?.[0] && filters.dateRange[1]) {
        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();
      }

      const response = await getAuditLogs(params);
      if (response.success) {
        setLogs(response.data);
        setPagination(prev => ({ ...prev, total: response.pagination.total }));
      } else {
        throw new Error(response.message || 'Failed to fetch logs');
      }
    } catch (err) {
      setError(err.message);
      if (retryCount < 2) {
        setTimeout(() => fetchLogs(retryCount + 1), 1000);
      } else {
        message.error('Unable to load audit logs after multiple attempts');
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = {};
      if (filters.dateRange?.[0] && filters.dateRange[1]) {
        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();
      }
      const response = await getAuditStats(params);
      if (response.success) setStats(response.data);
    } catch (error) {
      console.error('Stats fetch failed:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [filters.dateRange]);

  const handleViewDetails = async (id) => {
    try {
      const response = await getAuditLogById(id);
      if (response.success) {
        setSelectedLog(response.data);
        setDrawerVisible(true);
      } else {
        message.error(response.message || 'Failed to fetch details');
      }
    } catch (error) {
      message.error('Could not load log details');
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = {
        moduleName: filters.moduleName || undefined,
        actionType: filters.actionType || undefined,
      };
      if (filters.dateRange?.[0] && filters.dateRange[1]) {
        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();
      }
      const blob = await exportAuditLogs(params);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${dayjs().format('YYYY-MM-DD-HHmmss')}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      message.success('Export completed');
    } catch (error) {
      message.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

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
        message.error(response.message || 'Cleanup failed');
      }
    } catch (error) {
      message.error('Cleanup failed');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
  };

  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setFilterDrawerVisible(false);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearAllFilters = () => {
    const empty = { moduleName: '', actionType: '', search: '', dateRange: null };
    setFilters(empty);
    setTempFilters(empty);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Responsive columns configuration
  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: 'Timestamp',
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: isMobile ? 150 : 180,
        render: (text) => (
          <Tooltip title={dayjs(text).format('dddd, MMMM D, YYYY HH:mm:ss')}>
            <div className="flex items-center gap-1 sm:gap-2">
              <ClockCircleOutlined className="text-xs sm:text-base" />
              <span className="text-xs sm:text-sm">{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
          </Tooltip>
        ),
        sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      },
      {
        title: 'Module',
        dataIndex: 'moduleName',
        key: 'moduleName',
        width: isMobile ? 100 : 140,
        render: (text) => (
          <div className="flex items-center gap-1 sm:gap-2">
            <AppstoreOutlined className="text-xs sm:text-base" />
            <span className="text-xs sm:text-sm">{text}</span>
          </div>
        ),
      },
      {
        title: 'Action',
        dataIndex: 'actionType',
        key: 'actionType',
        width: isMobile ? 90 : 110,
        render: (text) => <ActionTag action={text} />,
      },
      {
        title: 'User',
        dataIndex: 'user',
        key: 'user',
        width: isMobile ? 150 : 200,
        render: (user) => user ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <UserOutlined className="text-xs sm:text-base" />
            <span className="text-xs sm:text-sm">{user.firstName} {user.lastName}</span>
            {!isMobile && <Tag className="hidden sm:inline-block">{user.employeeCode}</Tag>}
          </div>
        ) : <Tag>System</Tag>,
      },
    ];

    if (!isMobile) {
      baseColumns.push(
        {
          title: 'IP Address',
          dataIndex: 'ipAddress',
          key: 'ipAddress',
          width: 130,
          render: (text) => text || '—',
        }
      );
    }

    baseColumns.push({
      title: 'Actions',
      key: 'actions',
      width: 70,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetails(record.id)} />
        </Tooltip>
      ),
    });

    return baseColumns;
  }, [isMobile]);

  return (
    <div className="p-3 sm:p-6 min-h-screen bg-gray-50">
      <Card className="shadow-sm rounded-lg overflow-hidden">
        <div className="space-y-4 sm:space-y-6">
          {/* Header - fully responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileTextOutlined className="text-blue-500 text-base sm:text-xl" />
              </div>
              <div>
                <Title level={isMobile ? 5 : 4} className="!m-0">Audit Logs</Title>
                <Text type="secondary" className="text-xs sm:text-sm">Track all system activities</Text>
              </div>
            </div>
            <Space wrap size="small">
              <Button icon={<ReloadOutlined />} onClick={() => { fetchLogs(); fetchStats(); }} size={isMobile ? 'small' : 'middle'}>
                Refresh
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exportLoading} size={isMobile ? 'small' : 'middle'}>
                Export
              </Button>
              <Button icon={<DeleteOutlined />} danger onClick={() => setCleanupModalVisible(true)} size={isMobile ? 'small' : 'middle'}>
                Cleanup
              </Button>
              <Badge count={activeFilterCount} size="small">
                <Button
                  type={activeFilterCount > 0 ? 'primary' : 'default'}
                  icon={<FilterOutlined />}
                  onClick={() => { setTempFilters({ ...filters }); setFilterDrawerVisible(true); }}
                  size={isMobile ? 'small' : 'middle'}
                >
                  Filters
                </Button>
              </Badge>
            </Space>
          </div>

          {/* Stats row - responsive grid */}
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={12} lg={6}>
              <StatsCard title="Total Logs" value={stats?.totalLogs} icon={DatabaseOutlined} loading={statsLoading} color="#1890ff" />
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <StatsCard title="Modules" value={stats?.moduleStats?.length} icon={AppstoreOutlined} loading={statsLoading} color="#52c41a" />
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <StatsCard title="Action Types" value={stats?.actionStats?.length} icon={TagOutlined} loading={statsLoading} color="#faad14" />
            </Col>
            <Col xs={12} sm={12} lg={6}>
              <StatsCard title="Unique Users" value={new Set(logs.map(l => l.userId).filter(Boolean)).size} icon={TeamOutlined} loading={loading} color="#722ed1" />
            </Col>
          </Row>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <Input
              placeholder="Search logs by module, action, or user..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={filters.search}
              allowClear
              className="w-full sm:w-80"
              size={isMobile ? 'middle' : 'large'}
            />
            {activeFilterCount > 0 && (
              <Button icon={<ClearOutlined />} onClick={clearAllFilters} size={isMobile ? 'small' : 'middle'}>
                Clear all filters
              </Button>
            )}
          </div>

          {/* Error state with retry */}
          {error && (
            <Alert
              message="Failed to load audit logs"
              description={error}
              type="error"
              showIcon
              action={<Button size="small" onClick={() => fetchLogs()}>Retry</Button>}
              closable
            />
          )}

          {/* Table with responsive scroll */}
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={logs}
              rowKey="id"
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                showSizeChanger: !isMobile,
                showQuickJumper: !isMobile,
                showTotal: (total) => isMobile ? `${total} items` : `Total ${total} items`,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: (page, pageSize) => setPagination({ page, limit: pageSize, total: pagination.total }),
                size: isMobile ? 'small' : 'default',
              }}
              scroll={{ x: isMobile ? 700 : 1000 }}
              locale={{ emptyText: <Empty description="No audit logs found" /> }}
              size={isMobile ? 'small' : 'middle'}
            />
          </Spin>
        </div>
      </Card>

      {/* Filter Drawer - responsive width */}
      <Drawer
        title="Filter Audit Logs"
        width={isMobile ? '100%' : 400}
        open={filterDrawerVisible}
        onClose={() => setFilterDrawerVisible(false)}
        extra={<Button onClick={() => setTempFilters({ moduleName: '', actionType: '', search: '', dateRange: null })}>Reset</Button>}
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
                  <div className="flex items-center gap-2"><AppstoreOutlined /> {module}</div>
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
                <Option key={action} value={action}><ActionTag action={action} /></Option>
              ))}
            </Select>
          </div>
          <div>
            <Text strong>Date Range</Text>
            <RangePicker className="w-full mt-2" value={tempFilters.dateRange} onChange={(dates) => setTempFilters(prev => ({ ...prev, dateRange: dates }))} size="large" presets={[
              { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
              { label: 'Last 7 days', value: [dayjs().subtract(7, 'day'), dayjs()] },
              { label: 'Last 30 days', value: [dayjs().subtract(30, 'day'), dayjs()] },
            ]} />
          </div>
          <Divider />
          <div className="flex gap-3">
            <Button block size="large" onClick={() => setFilterDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" block size="large" onClick={applyFilters}>Apply Filters</Button>
          </div>
        </div>
      </Drawer>

      {/* Log Details Drawer - with structured change display (NO JSON) */}
      <Drawer
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <EyeOutlined /> Audit Log Details
            {selectedLog && <ActionTag action={selectedLog.actionType} />}
          </div>
        }
        width={isMobile ? '100%' : 720}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        placement="right"
      >
        {selectedLog && (
          <div className="space-y-4">
            <Card size="small" title="Basic Information">
              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                <Descriptions.Item label="Log ID">{selectedLog.id}</Descriptions.Item>
                <Descriptions.Item label="Timestamp">{dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                <Descriptions.Item label="Module">{selectedLog.moduleName}</Descriptions.Item>
                <Descriptions.Item label="IP Address">{selectedLog.ipAddress || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="User Agent" span={2}>{selectedLog.userAgent || 'N/A'}</Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedLog.user && (
              <Card size="small" title="User Information">
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item label="Name">{selectedLog.user.firstName} {selectedLog.user.lastName}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedLog.user.email}</Descriptions.Item>
                  <Descriptions.Item label="Employee Code">{selectedLog.user.employeeCode}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Industry-standard change display (no JSON viewer) */}
            <Card size="small" title="Changes">
              <ChangeDisplay oldData={selectedLog.oldData} newData={selectedLog.newData} />
            </Card>
          </div>
        )}
      </Drawer>

      {/* Cleanup Modal */}
      <Modal title="Cleanup Old Audit Logs" open={cleanupModalVisible} onCancel={() => setCleanupModalVisible(false)} footer={null} centered>
        <Form form={form} onFinish={handleCleanup} layout="vertical">
          <Form.Item name="daysToKeep" label="Delete logs older than (days)" rules={[
            { required: true, message: 'Please enter days' },
            { type: 'number', min: 30, max: 365, message: 'Must be 30–365' },
          ]}>
            <InputNumber placeholder="e.g., 90" className="w-full" min={30} max={365} size="large" />
          </Form.Item>
          <Alert message="Warning: This action is irreversible" description="All logs older than the specified days will be permanently deleted." type="error" showIcon className="mb-6" />
          <div className="flex justify-end gap-3">
            <Button onClick={() => setCleanupModalVisible(false)} size="large">Cancel</Button>
            <Button type="primary" htmlType="submit" danger loading={cleanupLoading} size="large">Delete Old Logs</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AuditLogs;