/**
 * API工具函数单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient, apiRequest, ApiError } from '../../utils';

// 模拟fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API工具函数测试', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('apiClient', () => {
    it('应该发送GET请求并返回响应', async () => {
      const mockResponse = { data: 'test', code: 200 };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
        ok: true,
        status: 200,
      });

      const result = await apiClient('/test', { method: 'GET' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('应该发送POST请求并包含请求体', async () => {
      const mockResponse = { data: 'success', code: 200 };
      const requestData = { name: 'test' };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
        ok: true,
        status: 200,
      });

      const result = await apiClient('/test', {
        method: 'POST',
        data: requestData,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('应该处理HTTP错误状态', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ message: 'Not found' }),
        ok: false,
        status: 404,
      });

      await expect(apiClient('/test')).rejects.toThrow(ApiError);
    });

    it('应该处理网络错误', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient('/test')).rejects.toThrow('Network error');
    });

    it('应该包含认证头', async () => {
      const mockResponse = { data: 'test', code: 200 };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
        ok: true,
        status: 200,
      });

      // 设置localStorage中的token
      localStorage.setItem('token', 'test-token');

      await apiClient('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );

      localStorage.removeItem('token');
    });
  });

  describe('apiRequest', () => {
    it('应该发送类型化的API请求', async () => {
      type TestResponse = { message: string; data: { id: number } };
      const mockResponse: TestResponse = { message: 'success', data: { id: 1 } };
      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
        ok: true,
        status: 200,
      });

      const result = await apiRequest<TestResponse>('/test');

      expect(result).toEqual(mockResponse);
    });

    it('应该处理API错误响应', async () => {
      const errorResponse = { code: 400, message: 'Bad request' };
      mockFetch.mockResolvedValueOnce({
        json: async () => errorResponse,
        ok: true,
        status: 200,
      });

      await expect(apiRequest('/test')).rejects.toThrow('Bad request');
    });
  });

  describe('ApiError', () => {
    it('应该创建ApiError实例', () => {
      const error = new ApiError('Test error', 400, { code: 400 });

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.data).toEqual({ code: 400 });
      expect(error.name).toBe('ApiError');
    });
  });
});