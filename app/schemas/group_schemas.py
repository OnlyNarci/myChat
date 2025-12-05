from datetime import datetime
from typing import List, Optional
from pydantic import Field
from app.db.model_dependencies import MessageType, GroupMemberStatus
from app.schemas import BaseParams


class GroupParams(BaseParams):
    """群聊参数模型(公开的信息)"""
    uid: str = Field(max_length=6, title='群聊uid')
    name: Optional[str] = Field(max_length=16, title='群聊名称')
    avatar: Optional[str] = Field(max_length=1024, title='群头像在文件服务器中的url')
    signature: Optional[str] = Field(max_length=255, title='群描述')
    tags: Optional[List[str]] = Field(default_factory=list, title='群标签')
    level: Optional[int] = Field(default=1, title='群等级')
    allow_search: Optional[bool] = Field(default=True, title='是否允许公开搜索')
    join_free: Optional[bool] = Field(default=True, title='是否允许自由加入', description='否则需要管理员同意')


class GroupSelfParams(GroupParams):
    """群聊参数模型(群成员的信息)"""
    pass


class GroupMessageParams(BaseParams):
    """群聊消息模型"""
    group_uid: str = Field(max_length=6, title='所在群聊uid')
    user_name: str = Field(max_length=16, title='说话人')
    content: str = Field(max_length=1024, title='消息内容')
    message_type: MessageType = Field(default=MessageType.TEXT, title='消息类型', description='0为文本，1为图片url，2为链接，3为群通知')
    created_at: Optional[datetime] = Field(default=None, title='创建时间', description='实际上是消息抵达后端时被记录的时间')


class GroupUserParams(BaseParams):
    """
    群聊成员模型
    """
    group_uid: str = Field(max_length=6, title='群聊uid')
    user_uid: str = Field(max_length=6, title='用户uid')
    status: GroupMemberStatus = Field(default=GroupMemberStatus.MEMBER, title='成员身份', description='0为黑名单、1为申请中、2普通成员、3为管理员、4为群主')
    level: int = Field(ge=0, title='群聊内等级', description='黑名单/待同意的成员等级为0')
    join_time: Optional[datetime] = Field(default=None, title='入群时间')
    