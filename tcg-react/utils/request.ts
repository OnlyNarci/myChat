import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API基础配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.example.com' 
  : 'http://localhost:8000';

// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 10000;

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token');
    
    // 如果有token，添加到请求头
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求时间戳，防止缓存
    if (config.params) {
      config.params.t = Date.now();
    } else {
      config.params = { t: Date.now() };
    }
    
    console.log('发送请求:', config.method?.toUpperCase(), config.url, config.params || config.data);
    
    return config;
  },
  (error: AxiosError) => {
    // 对请求错误做些什么
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做点什么
    console.log('接收响应:', response.status, response.config.url, response.data);
    
    // 这里可以根据后端返回的数据结构进行统一处理
    // 例如：后端返回格式为 { code: number, message: string, data: any }
    // 可以在这里判断code是否为成功状态，如果不是则抛出错误
    
    return response;
  },
  (error: AxiosError) => {
    // 对响应错误做点什么
    console.error('响应错误:', error);
    
    // 处理不同的HTTP状态码
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // 权限不足
          console.error('权限不足');
          break;
        case 404:
          // 资源不存在
          console.error('资源不存在');
          break;
        case 500:
          // 服务器错误
          console.error('服务器错误');
          break;
        default:
          // 其他错误
          console.error(`请求失败，状态码: ${status}`);
      }
      
      // 返回后端提供的错误信息
      const errorMessage = (data as any)?.message || '请求失败';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查您的网络连接');
      return Promise.reject(new Error('网络错误，请检查您的网络连接'));
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
      return Promise.reject(error);
    }
  }
);

// 导出API请求方法
export const apiRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get(url, config).then(response => response.data);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post(url, data, config).then(response => response.data);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put(url, data, config).then(response => response.data);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete(url, config).then(response => response.data);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.patch(url, data, config).then(response => response.data);
  }
};

// 导出axios实例，以便在需要时使用更高级的功能
export default apiClient;

// 导出类型
export type { AxiosRequestConfig, AxiosResponse, AxiosError };