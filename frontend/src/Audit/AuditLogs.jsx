import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
  Switch,
  ConfigProvider,
  theme as antTheme,
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
  BulbOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';
import isEqual from 'fast-deep-equal';
import { useSearchParams } from 'react-router-dom';

// ---------- API functions (adjust import path as needed) ----------
import {
  getAuditLogs,
  getAuditStats,
  getAuditLogById,
  exportAuditLogs,
  deleteOldAuditLogs,
} from '../api/auditApi';
// ------------------------------------------------------------------

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

// ============================================================
//  Industry‑standard change display (now with colour diff)
// ============================================================
const ChangeDisplay = ({ oldData, newData }) => {
  if (
    (!oldData || Object.keys(oldData).length === 0) &&
    (!newData || Object.keys(newData).length === 0)
  ) {
    return (
      <Empty
        description="No changes recorded"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  // CREATE: show all new data in green
  if (!oldData || Object.keys(oldData).length === 0) {
    return (
      <div>
        <div className="mb-3 font-semibold text-green-600 flex items-center gap-2">
          <CheckCircleOutlined /> New Record Created
        </div>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          {Object.entries(newData).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
              <span className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-100 px-2 py-1 rounded">
                {formatValue(value)}
              </span>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>
    );
  }

  // DELETE: show old data in red
  if (!newData || Object.keys(newData).length === 0) {
    return (
      <div>
        <div className="mb-3 font-semibold text-red-600 flex items-center gap-2">
          <WarningOutlined /> Record Deleted
        </div>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          {Object.entries(oldData).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
              <span className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-100 px-2 py-1 rounded">
                {formatValue(value)}
              </span>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>
    );
  }

  // UPDATE: show only changed fields with red/green highlights
  const changedKeys = Object.keys(newData).filter(
    (key) => !isEqual(oldData[key], newData[key])
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
        items={changedKeys.map((key) => ({
          key,
          label: <span className="font-mono">{key}</span>,
          children: (
            <div className="space-y-3">
              <div>
                <Text type="secondary" className="text-xs">
                  Previous value
                </Text>
                <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-800 mt-1">
                  <span className="text-red-800 dark:text-red-100">
                    {formatValue(oldData[key])}
                  </span>
                </div>
              </div>
              <div>
                <Text type="secondary" className="text-xs">
                  New value
                </Text>
                <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded border border-green-200 dark:border-green-800 mt-1">
                  <span className="text-green-800 dark:text-green-100">
                    {formatValue(newData[key])}
                  </span>
                </div>
              </div>
            </div>
          ),
        }))}
      />
    </div>
  );

  function formatValue(value) {
    if (value === null || value === undefined)
      return <Text type="secondary">—</Text>;
    if (typeof value === 'object')
      return (
        <pre className="text-xs m-0 whitespace-pre-wrap">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
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
          <Text type="secondary" className="text-xs sm:text-sm">
            {title}
          </Text>
          <div className="text-xl sm:text-2xl font-bold mt-1">
            {value?.toLocaleString() ?? 0}
          </div>
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
    CREATE: 'success',
    UPDATE: 'processing',
    DELETE: 'error',
    APPROVE: 'success',
    REJECT: 'error',
    SUBMIT: 'warning',
    LOGIN: 'purple',
    LOGOUT: 'default',
  };
  return (
    <Tag color={colorMap[action] || 'default'} className="rounded-full px-3">
      {action}
    </Tag>
  );
};

// ============================================================
//  Helper: reset filters object (prevents duplication)
// ============================================================
const emptyFilters = () => ({
  moduleName: '',
  actionType: '',
  search: '',
  dateRange: null,
});

// ============================================================
//  Main Component
// ============================================================
const AuditLogs = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Dark mode state & Ant Design theme
  const [darkMode, setDarkMode] = useState(() => {
    // Detect system preference or stored preference
    const stored = localStorage.getItem('auditLogsDarkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to <html> for Tailwind
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('auditLogsDarkMode', darkMode);
  }, [darkMode]);

  // URL search params for shareable filter views
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20,
    total: 0,
  });
  const [filters, setFilters] = useState(() => {
    const fromUrl = {
      moduleName: searchParams.get('moduleName') || '',
      actionType: searchParams.get('actionType') || '',
      search: searchParams.get('search') || '',
      dateRange:
        searchParams.get('startDate') && searchParams.get('endDate')
          ? [dayjs(searchParams.get('startDate')), dayjs(searchParams.get('endDate'))]
          : null,
    };
    return fromUrl;
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const [stats, setStats] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [cleanupModalVisible, setCleanupModalVisible] = useState(false);
  const [cleanupConfirmInput, setCleanupConfirmInput] = useState('');
  const [sort, setSort] = useState({
    field: searchParams.get('sortField') || 'timestamp',
    order: searchParams.get('sortOrder') || 'desc',
  });

  const [form] = Form.useForm();
  const searchTimeout = useRef(null);
  const retryTimeoutRef = useRef(null); // for safe retry

  // Dynamic module options from stats, fallback to hardcoded
  const moduleOptions = useMemo(() => {
    if (stats?.moduleStats?.length) {
      return stats.moduleStats.map((m) => m.name);
    }
    return ['User', 'Leave', 'Expense', 'Payroll', 'Auth', 'Role', 'Settings'];
  }, [stats]);

  const actionOptions = [
    'CREATE',
    'UPDATE',
    'DELETE',
    'APPROVE',
    'REJECT',
    'SUBMIT',
    'LOGIN',
    'LOGOUT',
  ];

  const activeFilterCount = useMemo(() => {
    return (
      Object.entries(filters).filter(([k, v]) => k !== 'search' && v).length +
      (filters.search ? 1 : 0)
    );
  }, [filters]);

  // Sync filters to URL (shareable)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.moduleName) params.set('moduleName', filters.moduleName);
    if (filters.actionType) params.set('actionType', filters.actionType);
    if (filters.search) params.set('search', filters.search);
    if (filters.dateRange?.[0] && filters.dateRange[1]) {
      params.set('startDate', filters.dateRange[0].toISOString());
      params.set('endDate', filters.dateRange[1].toISOString());
    }
    params.set('page', pagination.page);
    params.set('limit', pagination.limit);
    params.set('sortField', sort.field);
    params.set('sortOrder', sort.order);
    setSearchParams(params, { replace: true });
  }, [filters, pagination.page, pagination.limit, sort, setSearchParams]);

  // Fetch logs – explicit dependency array + safe retry
  const fetchLogs = useCallback(
    async (retryCount = 0) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          moduleName: filters.moduleName || undefined,
          actionType: filters.actionType || undefined,
          search: filters.search || undefined,
          sortBy: sort.field,
          sortOrder: sort.order,
        };
        if (filters.dateRange?.[0] && filters.dateRange[1]) {
          params.startDate = filters.dateRange[0].toISOString();
          params.endDate = filters.dateRange[1].toISOString();
        }

        const response = await getAuditLogs(params);
        if (response.success) {
          setLogs(response.data);
          setPagination((prev) => ({ ...prev, total: response.pagination.total }));
        } else {
          throw new Error(response.message || 'Failed to fetch logs');
        }
      } catch (err) {
        setError(err.message);
        if (retryCount < 2) {
          // Clear previous retry to avoid memory leak
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => {
            fetchLogs(retryCount + 1);
          }, 1000);
        } else {
          message.error('Unable to load audit logs after multiple attempts');
        }
      } finally {
        setLoading(false);
      }
    },
    // Explicit dependencies only on primitive values
    [
      pagination.page,
      pagination.limit,
      filters.moduleName,
      filters.actionType,
      filters.search,
      filters.dateRange,
      sort.field,
      sort.order,
    ]
  );

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
      // Validate that we actually received a blob
      if (!(blob instanceof Blob)) {
        throw new Error('Invalid export response');
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `audit-logs-${dayjs().format('YYYY-MM-DD-HHmmss')}.json`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      message.success('Export completed');
    } catch (error) {
      message.error('Export failed: ' + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Cleanup with typed confirmation
  const handleCleanup = async () => {
    if (cleanupConfirmInput !== 'DELETE') {
      message.warning('Please type DELETE to confirm');
      return;
    }
    setCleanupLoading(true);
    try {
      const values = await form.validateFields();
      const response = await deleteOldAuditLogs(values.daysToKeep);
      if (response.success) {
        message.success(response.message);
        setCleanupModalVisible(false);
        setCleanupConfirmInput('');
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
      setFilters((prev) => ({ ...prev, search: value }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);
  };

  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setFilterDrawerVisible(false);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearAllFilters = () => {
    const empty = emptyFilters();
    setFilters(empty);
    setTempFilters(empty);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Memoized unique users calculation
  const uniqueUsers = useMemo(() => {
    return new Set(logs.map((l) => l.userId).filter(Boolean)).size;
  }, [logs]);

  // Table sort handler (server-side)
  const handleTableChange = (paginationInfo, _filters, sorter) => {
    if (sorter.field) {
      setSort({
        field: sorter.field,
        order: sorter.order === 'ascend' ? 'asc' : 'desc',
      });
    }
    setPagination({
      page: paginationInfo.current,
      limit: paginationInfo.pageSize,
      total: paginationInfo.total,
    });
  };

  // Responsive columns
  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: 'Timestamp',
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: isMobile ? 150 : 180,
        sorter: true,
        sortOrder: sort.field === 'timestamp' ? (sort.order === 'asc' ? 'ascend' : 'descend') : undefined,
        render: (text) => (
          <Tooltip title={dayjs(text).format('dddd, MMMM D, YYYY HH:mm:ss')}>
            <div className="flex items-center gap-1 sm:gap-2">
              <ClockCircleOutlined className="text-xs sm:text-base" />
              <span className="text-xs sm:text-sm">
                {dayjs(text).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
          </Tooltip>
        ),
      },
      {
        title: 'Module',
        dataIndex: 'moduleName',
        key: 'moduleName',
        width: isMobile ? 100 : 140,
        sorter: true,
        sortOrder: sort.field === 'moduleName' ? (sort.order === 'asc' ? 'ascend' : 'descend') : undefined,
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
        sorter: true,
        sortOrder: sort.field === 'actionType' ? (sort.order === 'asc' ? 'ascend' : 'descend') : undefined,
        render: (text) => <ActionTag action={text} />,
      },
      {
        title: 'User',
        dataIndex: 'user',
        key: 'user',
        width: isMobile ? 150 : 200,
        render: (user) =>
          user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <UserOutlined className="text-xs sm:text-base" />
              <span className="text-xs sm:text-sm">
                {user.firstName} {user.lastName}
              </span>
              {!isMobile && (
                <Tag className="hidden sm:inline-block">{user.employeeCode}</Tag>
              )}
            </div>
          ) : (
            <Tag>System</Tag>
          ),
      },
    ];

    if (!isMobile) {
      baseColumns.push({
        title: 'IP Address',
        dataIndex: 'ipAddress',
        key: 'ipAddress',
        width: 130,
        render: (text) => text || '—',
      });
    }

    baseColumns.push({
      title: 'Actions',
      key: 'actions',
      width: 70,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.id)}
            aria-label="View audit log details"
          />
        </Tooltip>
      ),
    });

    return baseColumns;
  }, [isMobile, sort.field, sort.order]); // include sort for re-render

  // Dark mode Ant Design theme
  const themeConfig = {
    algorithm: darkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
    },
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <div className="p-3 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Card className="shadow-sm rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="space-y-4 sm:space-y-6">
            {/* Header with dark mode toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <FileTextOutlined className="text-blue-500 text-base sm:text-xl" />
                </div>
                <div>
                  <Title level={isMobile ? 5 : 4} className="!m-0 dark:text-white">
                    Audit Logs
                  </Title>
                  <Text type="secondary" className="text-xs sm:text-sm">
                    Track all system activities
                  </Text>
                </div>
              </div>
              <Space wrap size="small">
                <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                  <Switch
                    checked={darkMode}
                    onChange={setDarkMode}
                    checkedChildren={<BulbOutlined />}
                    unCheckedChildren={<BulbOutlined />}
                    aria-label="Toggle dark mode"
                  />
                </Tooltip>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    fetchLogs();
                    fetchStats();
                  }}
                  size={isMobile ? 'small' : 'middle'}
                  aria-label="Refresh data"
                >
                  Refresh
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  loading={exportLoading}
                  size={isMobile ? 'small' : 'middle'}
                  aria-label="Export audit logs"
                >
                  Export
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => setCleanupModalVisible(true)}
                  size={isMobile ? 'small' : 'middle'}
                  aria-label="Cleanup old logs"
                >
                  Cleanup
                </Button>
                <Badge count={activeFilterCount} size="small">
                  <Button
                    type={activeFilterCount > 0 ? 'primary' : 'default'}
                    icon={<FilterOutlined />}
                    onClick={() => {
                      setTempFilters({ ...filters });
                      setFilterDrawerVisible(true);
                    }}
                    size={isMobile ? 'small' : 'middle'}
                    aria-label="Open filters"
                  >
                    Filters
                  </Button>
                </Badge>
              </Space>
            </div>

            {/* Stats row */}
            <Row gutter={[12, 12]}>
              <Col xs={12} sm={12} lg={6}>
                <StatsCard
                  title="Total Logs"
                  value={stats?.totalLogs}
                  icon={DatabaseOutlined}
                  loading={statsLoading}
                  color="#1890ff"
                />
              </Col>
              <Col xs={12} sm={12} lg={6}>
                <StatsCard
                  title="Modules"
                  value={stats?.moduleStats?.length ?? 0}
                  icon={AppstoreOutlined}
                  loading={statsLoading}
                  color="#52c41a"
                />
              </Col>
              <Col xs={12} sm={12} lg={6}>
                <StatsCard
                  title="Action Types"
                  value={stats?.actionStats?.length ?? 0}
                  icon={TagOutlined}
                  loading={statsLoading}
                  color="#faad14"
                />
              </Col>
              <Col xs={12} sm={12} lg={6}>
                <StatsCard
                  title="Unique Users"
                  value={uniqueUsers}
                  icon={TeamOutlined}
                  loading={loading}
                  color="#722ed1"
                />
              </Col>
            </Row>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <Input
                placeholder="Search logs by module, action, or user..."
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                value={filters.search}
                allowClear
                className="w-full sm:w-80"
                size={isMobile ? 'middle' : 'large'}
                aria-label="Search audit logs"
              />
              {activeFilterCount > 0 && (
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearAllFilters}
                  size={isMobile ? 'small' : 'middle'}
                  aria-label="Clear all filters"
                >
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
                action={
                  <Button size="small" onClick={() => fetchLogs()} aria-label="Retry loading">
                    Retry
                  </Button>
                }
                closable
              />
            )}

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
                  showSizeChanger: !isMobile,
                  showQuickJumper: !isMobile,
                  showTotal: (total) =>
                    isMobile ? `${total} items` : `Total ${total} items`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  size: isMobile ? 'small' : 'default',
                }}
                onChange={handleTableChange}
                scroll={{ x: isMobile ? 700 : 1000 }}
                locale={{
                  emptyText: <Empty description="No audit logs found" />,
                }}
                size={isMobile ? 'small' : 'middle'}
              />
            </Spin>
          </div>
        </Card>

        {/* Filter Drawer */}
        <Drawer
          title="Filter Audit Logs"
          width={isMobile ? '100%' : 400}
          open={filterDrawerVisible}
          onClose={() => setFilterDrawerVisible(false)}
          extra={
            <Button
              onClick={() =>
                setTempFilters(emptyFilters())
              }
              aria-label="Reset filters"
            >
              Reset
            </Button>
          }
        >
          <div className="space-y-6">
            <div>
              <Text strong className="dark:text-white">
                Module
              </Text>
              <Select
                placeholder="All modules"
                className="w-full mt-2"
                value={tempFilters.moduleName || undefined}
                onChange={(value) =>
                  setTempFilters((prev) => ({ ...prev, moduleName: value }))
                }
                allowClear
                size="large"
              >
                {moduleOptions.map((module) => (
                  <Option key={module} value={module}>
                    <div className="flex items-center gap-2">
                      <AppstoreOutlined /> {module}
                    </div>
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <Text strong className="dark:text-white">
                Action Type
              </Text>
              <Select
                placeholder="All actions"
                className="w-full mt-2"
                value={tempFilters.actionType || undefined}
                onChange={(value) =>
                  setTempFilters((prev) => ({ ...prev, actionType: value }))
                }
                allowClear
                size="large"
              >
                {actionOptions.map((action) => (
                  <Option key={action} value={action}>
                    <ActionTag action={action} />
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <Text strong className="dark:text-white">
                Date Range
              </Text>
              <RangePicker
                className="w-full mt-2"
                value={tempFilters.dateRange}
                onChange={(dates) =>
                  setTempFilters((prev) => ({ ...prev, dateRange: dates }))
                }
                size="large"
                presets={[
                  {
                    label: 'Today',
                    value: [dayjs().startOf('day'), dayjs().endOf('day')],
                  },
                  {
                    label: 'Last 7 days',
                    value: [dayjs().subtract(7, 'day'), dayjs()],
                  },
                  {
                    label: 'Last 30 days',
                    value: [dayjs().subtract(30, 'day'), dayjs()],
                  },
                ]}
              />
            </div>
            <Divider className="dark:border-gray-600" />
            <div className="flex gap-3">
              <Button
                block
                size="large"
                onClick={() => setFilterDrawerVisible(false)}
                aria-label="Cancel filters"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                block
                size="large"
                onClick={applyFilters}
                aria-label="Apply filters"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </Drawer>

        {/* Log Details Drawer */}
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
              <Card
                size="small"
                title="Basic Information"
                className="dark:bg-gray-800 dark:border-gray-700"
              >
                <Descriptions
                  column={{ xs: 1, sm: 2 }}
                  bordered
                  size="small"
                  className="dark:bg-gray-800"
                >
                  <Descriptions.Item label="Log ID">
                    <span className="dark:text-white">{selectedLog.id}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Timestamp">
                    <span className="dark:text-white">
                      {dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Module">
                    <span className="dark:text-white">{selectedLog.moduleName}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="IP Address">
                    <span className="dark:text-white">
                      {selectedLog.ipAddress || 'N/A'}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="User Agent" span={2}>
                    <span className="dark:text-white break-all">
                      {selectedLog.userAgent || 'N/A'}
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {selectedLog.user && (
                <Card
                  size="small"
                  title="User Information"
                  className="dark:bg-gray-800 dark:border-gray-700"
                >
                  <Descriptions
                    column={{ xs: 1, sm: 2 }}
                    bordered
                    size="small"
                    className="dark:bg-gray-800"
                  >
                    <Descriptions.Item label="Name">
                      <span className="dark:text-white">
                        {selectedLog.user.firstName} {selectedLog.user.lastName}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <span className="dark:text-white">{selectedLog.user.email}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Employee Code">
                      <span className="dark:text-white">
                        {selectedLog.user.employeeCode}
                      </span>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              <Card
                size="small"
                title="Changes"
                className="dark:bg-gray-800 dark:border-gray-700"
              >
                <ChangeDisplay
                  oldData={selectedLog.oldData}
                  newData={selectedLog.newData}
                />
              </Card>
            </div>
          )}
        </Drawer>

        {/* Cleanup Modal with typed confirmation */}
        <Modal
          title="Cleanup Old Audit Logs"
          open={cleanupModalVisible}
          onCancel={() => {
            setCleanupModalVisible(false);
            setCleanupConfirmInput('');
          }}
          footer={null}
          centered
          destroyOnClose
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="daysToKeep"
              label="Delete logs older than (days)"
              rules={[
                { required: true, message: 'Please enter days' },
                { type: 'number', min: 30, max: 365, message: 'Must be 30–365' },
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
              description="All logs older than the specified days will be permanently deleted."
              type="error"
              showIcon
              className="mb-4"
            />
            <div className="mb-4">
              <Text strong>Type DELETE to confirm:</Text>
              <Input
                value={cleanupConfirmInput}
                onChange={(e) => setCleanupConfirmInput(e.target.value)}
                placeholder="DELETE"
                className="mt-2"
                size="large"
                aria-label="Type DELETE to confirm cleanup"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setCleanupModalVisible(false);
                  setCleanupConfirmInput('');
                }}
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                onClick={handleCleanup}
                loading={cleanupLoading}
                disabled={cleanupConfirmInput !== 'DELETE'}
                size="large"
              >
                Delete Old Logs
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default AuditLogs;