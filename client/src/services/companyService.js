import api from './api';

export const getCompanies = async (params = {}) => {
  const response = await api.get('/companies', { params });
  return response.data;
};

export const getCompanyById = async (id) => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

export const createCompany = async (companyData) => {
  const response = await api.post('/companies', companyData);
  return response.data;
};

export const updateCompany = async (id, companyData) => {
  const response = await api.put(`/companies/${id}`, companyData);
  return response.data;
};
