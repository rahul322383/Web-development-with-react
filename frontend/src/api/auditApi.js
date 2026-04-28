
import axiosInstance from "./axios";
export const getAuditLogs = async (params) => {
  const response = await axiosInstance.get("/audit-logs", { params });
  return response.data;
};

export const getAuditStats = async (params) => {
  const response = await axiosInstance.get("/audit-logs/stats", { params });
  return response.data;
};

export const exportAuditLogs = async (params) => {
  const response = await axiosInstance.get("/audit-logs/export", {
    params,
    responseType: "blob",
  });
  return response.data;
};

export const getAuditLogsByUser = async (userId, params) => {
  const response = await axiosInstance.get(`/audit-logs/user/${userId}`, { params });
  return response.data;
};

export const getAuditLogsByModule = async (module, params) => {
  const response = await axiosInstance.get(`/audit-logs/module/${module}`, { params });
  return response.data;
};

export const getAuditLogById = async (id) => {
  const response = await axiosInstance.get(`/audit-logs/${id}`);
  return response.data;
};

export const deleteOldAuditLogs = async (daysToKeep) => {
  const response = await axiosInstance.delete(`/audit-logs/cleanup`, {
    data: { daysToKeep }
  });
  return response.data;
};

export const createAuditLog = async (logData) => {
  const response = await axiosInstance.post("/audit-logs", logData);
  return response.data;
};