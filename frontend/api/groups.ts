/**
 * 群组相关API接口
 */

import { apiRequest } from '../utils';
import type { 
  Group, 
  GroupSelfParams, 
  BaseResponse, 
  SimpleResponse, 
  GroupsResponse, 
  GroupNoticeResponse, 
  CreateGroupResponse,
  GroupMembersResponse
} from './types';

/**
 * 查找符合条件的群聊
 * @param params 查询参数
 * @returns Promise<BaseResponse<GroupsResponse>>
 */
export const searchGroups = (params?: {
  group_uid?: string;
  name_in?: string;
  level_ge?: number;
}): Promise<BaseResponse<GroupsResponse>> => {
  return apiRequest.get('/groups/others', { params });
};

/**
 * 查看已加入的群聊
 * @returns Promise<BaseResponse<GroupsResponse>>
 */
export const getMyGroups = (): Promise<BaseResponse<GroupsResponse>> => {
  return apiRequest.get('/groups/me');
};

/**
 * 查看群公告
 * @param groupUid 群聊UID
 * @returns Promise<BaseResponse<GroupNoticeResponse>>
 */
export const getGroupNotice = (groupUid: string): Promise<BaseResponse<GroupNoticeResponse>> => {
  return apiRequest.get(`/groups/${groupUid}/group_notice`);
};

/**
 * 创建群聊
 * @param params 群聊参数
 * @returns Promise<BaseResponse<CreateGroupResponse>>
 */
export const createGroup = (params: GroupSelfParams): Promise<BaseResponse<CreateGroupResponse>> => {
  return apiRequest.post('/groups/members/owner', params);
};

/**
 * 加入群聊
 * @param groupUid 群聊UID
 * @returns Promise<SimpleResponse>
 */
export const joinGroup = (groupUid: string): Promise<SimpleResponse> => {
  return apiRequest.post(`/groups/${groupUid}/members/me`);
};

/**
 * 退出群聊
 * @param groupUid 群聊UID
 * @returns Promise<SimpleResponse>
 */
export const leaveGroup = (groupUid: string): Promise<SimpleResponse> => {
  return apiRequest.delete(`/groups/${groupUid}/members/me`);
};

// 管理员功能

/**
 * 查看待处理入群请求
 * @param groupUid 群聊UID
 * @returns Promise<BaseResponse<GroupMembersResponse>>
 */
export const getJoinRequests = (groupUid: string): Promise<BaseResponse<GroupMembersResponse>> => {
  return apiRequest.get(`/groups/${groupUid}/under_review_members`);
};

/**
 * 发布群公告
 * @param groupUid 群聊UID
 * @param notice 公告内容
 * @returns Promise<SimpleResponse>
 */
export const postGroupNotice = (groupUid: string, notice: string): Promise<SimpleResponse> => {
  return apiRequest.post(`/groups/${groupUid}/group_message/notice`, notice);
};

/**
 * 处理入群请求
 * @param groupUid 群聊UID
 * @param requestUserUid 请求者UID
 * @param isAgree 是否同意
 * @returns Promise<SimpleResponse>
 */
export const handleJoinRequest = (groupUid: string, requestUserUid: string, isAgree: boolean): Promise<SimpleResponse> => {
  return apiRequest.put(`/groups/${groupUid}/under_review_members/${requestUserUid}`, null, {
    params: { is_agree: isAgree }
  });
};

/**
 * 修改群信息
 * @param groupUid 群聊UID
 * @param params 群信息参数
 * @returns Promise<SimpleResponse>
 */
export const updateGroupInfo = (groupUid: string, params: GroupSelfParams): Promise<SimpleResponse> => {
  return apiRequest.put(`/groups/${groupUid}/info`, params);
};

/**
 * 踢出成员
 * @param groupUid 群聊UID
 * @param memberUid 成员UID
 * @returns Promise<SimpleResponse>
 */
export const kickMember = (groupUid: string, memberUid: string): Promise<SimpleResponse> => {
  return apiRequest.delete(`/groups/${groupUid}/members/${memberUid}`);
};

// 群主功能

/**
 * 任命群管理员
 * @param groupUid 群聊UID
 * @param memberUid 成员UID
 * @returns Promise<SimpleResponse>
 */
export const appointAdmin = (groupUid: string, memberUid: string): Promise<SimpleResponse> => {
  return apiRequest.put(`/groups/${groupUid}/member/${memberUid}`);
};

/**
 * 撤职群管理员
 * @param groupUid 群聊UID
 * @param adminUid 管理员UID
 * @returns Promise<SimpleResponse>
 */
export const dismissAdmin = (groupUid: string, adminUid: string): Promise<SimpleResponse> => {
  return apiRequest.put(`/groups/${groupUid}/admin/${adminUid}`);
};

/**
 * 转让群主
 * @param groupUid 群聊UID
 * @param memberUid 成员UID
 * @returns Promise<SimpleResponse>
 */
export const transferOwner = (groupUid: string, memberUid: string): Promise<SimpleResponse> => {
  return apiRequest.put(`/groups/${groupUid}/owner/${memberUid}`);
};

/**
 * 解散群聊
 * @param groupUid 群聊UID
 * @returns Promise<SimpleResponse>
 */
export const dissolveGroup = (groupUid: string): Promise<SimpleResponse> => {
  return apiRequest.delete(`/groups/${groupUid}`);
};