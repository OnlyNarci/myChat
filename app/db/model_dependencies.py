from enum import IntEnum, StrEnum


class FriendshipStatus(IntEnum):
    """
    好友状态
    """
    WAITING = 0     # 等待同意
    CONFIRM = 1     # 已经是好友
    BLACK_LIST = 2  # 黑名单


class CardRarity(IntEnum):
    """
    卡牌稀有度
    """
    COMMON = 1       # 普通
    RARE = 2         # 稀有
    EPIC = 3         # 史诗
    LEGENDARY = 4    # 传说
    SPECIAL = 5      # 特殊卡牌


class OrderStatus(IntEnum):
    """
    订单状态
    """
    WAITING = 0     # 待完成
    CONFIRM = 1     # 已完成
    TIMEOUT = 2     # 超时
    REJECTED = 3    # 用户主动删除
    

class GroupMemberStatus(IntEnum):
    """
    群成员状态
    """
    BLACK_LIST = 0      # 黑名单
    UNDER_REVIEW = 1    # 申请中
    MEMBER = 2          # 普通成员
    ADMIN = 3           # 管理员
    OWNER = 4           # 群主


class MessageType(IntEnum):
    TEXT = 0
    IMAGE = 1
    LINK = 2
    NOTICE = 3


class RestaurantBusiness(StrEnum):
    CHINESE_PASTRY = 'chinese_pastry'
    
    
class Package(StrEnum):
    BASE = 'base'
    CHINESE_PASTRY = 'chinese_pastry'
    

class City(StrEnum):
    """城市枚举类型"""
    LIGHTING_HARBOR = 'LightingHarbor'
    

class TaskStatus(IntEnum):
    """任务枚举类型"""
    WAITING = 0
    CONFIRM = 1
    TIMEOUT = 2
    