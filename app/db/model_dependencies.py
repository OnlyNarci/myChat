from enum import IntEnum, StrEnum


class FriendshipStatus(IntEnum):
    WAITING = 0     # 等待同意
    CONFIRM = 1     # 已经是好友
    BLACK_LIST = 2  # 黑名单


class CardRarity(IntEnum):
    COMMON = 1       # 普通
    RARE = 2         # 稀有
    EPIC = 3         # 史诗
    LEGENDARY = 4    # 传说
    SPECIAL = 5      # 特殊卡牌


class OrderStatus(IntEnum):
    WAITING = 0
    CONFIRM = 1
    TIMEOUT = 2
    REJECTED = 3
    

class GroupMemberStatus(IntEnum):
    BLACK_LIST = 0
    UNDER_REVIEW = 1
    MEMBER = 2
    ADMIN = 3
    OWNER = 4


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
    