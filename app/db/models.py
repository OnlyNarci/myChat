from typing import Dict, List
from datetime import date
from tortoise.models import Model
from tortoise import fields
from app.db.model_dependencies import (
    FriendshipStatus,
    CardRarity,
    OrderStatus,
    GroupMemberStatus,
    MessageType,
    Package,
    RestaurantBusiness,
    City,
    TaskStatus
)


class User(Model):
    """
    用户表
    """
    id = fields.IntField(pk=True)
    uid = fields.CharField(max_length=6, unique=True, description='用户uid')
    name = fields.CharField(max_length=16, unique=True, description='用户名')
    title = fields.CharField(max_length=16, default='萌新', description='用户称号')
    password = fields.CharField(max_length=255, description='哈希加密后的密码')
    email = fields.CharField(max_length=60, unique=True, description='用户邮箱')
    avatar = fields.CharField(default='', max_length=1024, description='用户头像在文件服务器中的url')
    signature = fields.CharField(default='', max_length=255, description='个性签名')
    level = fields.IntField(default=1, description='用户等级')
    exp = fields.IntField(default=0, description='用户累计经验值')
    byte = fields.IntField(default=0, description='用户比特数量，这是游戏中的基础货币')
    created_at = fields.DatetimeField(auto_now_add=True, description='创建日期')

    cards = fields.ManyToManyField(
        model_name='models.Card',
        related_name='users',
        through='user_card'
    )

    class Meta:
        table = 'user'


class UserUser(Model):
    """
    用户-用户关系表，描述好友关系
    """
    # 好友请求的发起方
    user_request: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='friendship_request',
        on_delete=fields.CASCADE,
    )
    # 好友请求的接收方
    user_accept: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='friendships_accept',
        on_delete=fields.CASCADE
    )
    status = fields.IntEnumField(
        enum_type=FriendshipStatus,
        default=FriendshipStatus.WAITING,
        null=False,
        description='一方发起请求后，创建status为0的条目，另一方接收请求后修改此字段为1; 拒绝或接触好友关系删除本条目'
    )
    relationship = fields.CharField(default='', max_length=16, description='待扩展的功能')
    created_at = fields.DatetimeField(auto_now_add=True, description='创建日期')
    
    class Meta:
        table = 'user_user'
        unique_together = (('user_request', 'user_accept'),)
        indexes = [
            ('user_accept', 'user_request'),  # 优化反向查询的索引
            ('status', 'user_request', 'user_accept'),  # 覆盖status+双向关系的查询
        ]


class UserMessage(Model):
    id = fields.IntField(pk=True)
    user_send: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='chat_send',
        on_delete=fields.SET_NULL,
        null=True
    )
    user_receive: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='chat_receive',
        on_delete=fields.SET_NULL,
        null=True
    )
    message_type = fields.IntEnumField(
        enum_type=MessageType,
        default=MessageType.TEXT,
        null=False,
        description='3是发送好友请求时附带的'
    )
    content = fields.CharField(max_length=1024, description='内容')
    created_at = fields.DatetimeField(auto_now_add=True, description='创建日期')
    
    class Meta:
        table = 'user_message'
        unique_together = (('user_send', 'user_receive'),)
        indexes = [
            'user_receive', 'user_send',
        ]


class Card(Model):
    """
    卡牌表
    """
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=16, unique=True)
    image = fields.CharField(default='', max_length=1024, description='卡牌原画在文件服务器中的url')
    rarity = fields.IntEnumField(
        enum_type=CardRarity,
        null=False,
        description='稀有度，1为普通，2为稀有，3为史诗，4为传说，5为sp'
    )
    package = fields.CharEnumField(
        enum_type=Package,
        null=False,
        default=Package.BASE,
        description='卡牌包'
    )
    unlock_level = fields.IntField(default=1, description='解锁等级')
    description = fields.CharField(max_length=255)
    
    # 合成所需材料：格式为 {卡牌ID: 数量}
    compose_materials: Dict[int, int] = fields.JSONField(
        default=dict,
        description='合成所需的卡牌及数量'
    )
    
    # 分解所得产物：格式同上
    decompose_materials: Dict[int, int] = fields.JSONField(
        default=dict,
        description='分解可获得的卡牌及数量'
    )
    created_at = fields.DatetimeField(auto_now_add=True, description='创建日期')

    class Meta:
        table = 'card'
        indexes = [
            ("package",),
            ("rarity", "package"),
            ("name", "rarity", "package"),
        ]


class UserCard(Model):
    """
    用户-卡牌关系表
    """
    user: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='user_cards',
        on_delete=fields.CASCADE
    )

    card: fields.ForeignKeyRelation["Card"] = fields.ForeignKeyField(
        model_name='models.Card',
        related_name='user_cards',
        on_delete=fields.CASCADE
    )

    number = fields.IntField(default=1, description='持有该卡牌的数量')

    class Meta:
        table = 'user_card'
        unique_together = (('user', 'card'),)


class UserSession(Model):
    """
    用户会话表(后续考虑迁移到redis)
    """
    id = fields.IntField(pk=True)
    session_id = fields.CharField(max_length=36, description='会话id，36位uuid')
    created_at = fields.DatetimeField(auto_now_add=True, description='创建时间')
    expires_at = fields.DatetimeField(description='过期时间')
    user_agent = fields.CharField(max_length=255)
    ip_address = fields.CharField(max_length=64)

    user: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='sessions',
        on_delete=fields.CASCADE
    )

    class Meta:
        table = 'user_session'


class Group(Model):
    """
    群组表
    """
    id = fields.IntField(pk=True)
    uid = fields.CharField(max_length=6, unique=True, description='群聊uid')
    name = fields.CharField(max_length=16, description='群聊名称')
    owner: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='group',
        on_delete=fields.SET_NULL,
        null=True
    )
    avatar = fields.CharField(default='', max_length=1024, description='群头像在文件服务器中的url')
    signature = fields.CharField(default='', max_length=255, description='群描述')
    tags: List[str] = fields.JSONField(default=list, description='群标签字符串列表')
    level = fields.IntField(default=1, description='群等级，后续可能扩展群权益相应功能，也有可能上工会板块')
    allow_search = fields.BooleanField(default=True, description='是否允许公开搜索')
    join_free = fields.BooleanField(default=True, description='是否允许自由加入(否则需要管理员同意)')
    created_at = fields.DatetimeField(auto_now_add=True, description='创建日期')

    class Meta:
        table = 'Group'
        indexes = [
            ('level',),
        ]
        
        
class GroupUser(Model):
    """
    群组-用户关系表
    """
    group: fields.ForeignKeyRelation["Group"] = fields.ForeignKeyField(
        model_name='models.Group',
        related_name='group_user',
        on_delete=fields.CASCADE
    )
    user: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='group_user',
        on_delete=fields.CASCADE
    )
    status = fields.IntEnumField(
        enum_type=GroupMemberStatus,
        null=False,
        default=GroupMemberStatus.MEMBER,
        description='0为黑名单、1为申请中、2普通成员、3为管理员、4为群主'
    )
    level = fields.IntField(default=1, description='群内等级(相关功能待扩展)')
    title = fields.CharField(max_length=16, description='群称号')
    created_at = fields.DatetimeField(auto_now_add=True, description='入群时间')
    
    class Meta:
        table = 'group_user'
        unique_together = (('group', 'user'),)
        indexes = [
            ("group", "user", "status"),
        ]


class GroupMessage(Model):
    """
    群消息记录
    """
    group: fields.ForeignKeyRelation["Group"] = fields.ForeignKeyField(
        model_name='models.Group',
        related_name='group_message',
        on_delete=fields.CASCADE
    )
    user: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='group_message',
        on_delete=fields.SET_NULL,
        null=True,
        description='发送该消息的用户'
    )
    message_type = fields.IntEnumField(
        enum_type=MessageType,
        null=False,
        default=MessageType.TEXT,
        description='0为文本类型，1为图片在自由服务器中的url，2为链接，3为群通知'
    )
    content = fields.CharField(max_length=1024, description='内容')
    created_at = fields.DatetimeField(auto_now_add=True)
    
    class Meta:
        table = 'group_message'
        

class Store(Model):
    """
    商店表
    """
    id = fields.IntField(pk=True)
    # 卡牌外键
    card: fields.ForeignKeyRelation["Card"] = fields.ForeignKeyField(
        model_name='models.Card',
        related_name='store',
        on_delete=fields.CASCADE,
    )
    # 用户外键
    owner: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='store',
        on_delete=fields.CASCADE
    )
    number = fields.IntField(description='上架卡牌数量')
    price = fields.IntField(description='卡牌单价')
    is_publish = fields.BooleanField(default=True, description='是否公开出售，否则只有好友可见')

    class Meta:
        table = 'store'
        indexes = [
            ("card", "is_publish", "price"),
        ]
        unique_together = (('card', 'owner'),)


class StoreRecord(Model):
    """
    交易记录表
    """
    id = fields.IntField(pk=True)
    buyer: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='buy_record',
    )
    seller: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='sell_record',
    )
    card: fields.ForeignKeyRelation["Card"] = fields.ForeignKeyField(
        model_name='models.Card',
        related_name='store_record',
    )
    number = fields.IntField(description='交易数量')
    price = fields.IntField(description='交易单价')
    created_at = fields.DatetimeField(auto_now_add=True, description='交易时间')
    
    class Meta:
        table = 'store_record'
        indexes = [
            ('buyer', 'created_at',),
            ('seller', 'created_at',),
        ]


class Order(Model):
    """
    订单表
    """
    id = fields.IntField(pk=True)
    user: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='order',
    )
    require_card: Dict[int, int] = fields.JSONField(default=dict, description='订单需要的卡牌，键为卡牌id，值为数量')
    byte = fields.IntField(description='完成订单可以获得的比特')
    exp = fields.IntField(description='完成订单可以获得的经验')
    status = fields.IntEnumField(
        enum_type=OrderStatus,
        null=False,
        default=OrderStatus.WAITING,
        description='0为待完成，1为已完成，2为订单超时，3为用户拒绝了订单'
    )
    created_at = fields.DatetimeField(auto_now_add=True, description='订单创建时间，用户上线后为其分发订单')
    expires_at = fields.DatetimeField(description='订单过期时间（创建当日24:00过期），超时后自动将status改为3')
    
    class Meta:
        table = 'order'


class Restaurant(Model):
    """
    餐馆表
    """
    id = fields.IntField(pk=True)
    user: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='restaurant',
        unique=True,
        description='餐厅主人，每一家餐厅都有一个主人，每一个用户只能有一家餐厅'
    )
    level = fields.IntField(default=1, description='餐馆等级，等级提供完成订单获取的经验加成')
    main_business = fields.CharEnumField(
        enum_type=RestaurantBusiness,
        null=False,
        defult=RestaurantBusiness.CHINESE_PASTRY,
        description='餐馆经营类型和可抽的卡牌包类型一致(base除外)'
    )
    last_change_business = fields.DateField(default=date(1900, 1, 1), null=False, description='上一次修改餐馆主营业务的时间，玩家每个月可以修改一次主营业务')
    city = fields.CharEnumField(
        enum_type=City,
        null=False,
        defalt=City.LIGHTING_HARBOR,
        description='餐馆坐标城市(相关功能待扩展)'
    )
    pos_x = fields.IntField(default=0, description='餐馆位置的x坐标(相关功能待扩展)')
    pos_y = fields.IntField(default=0, description='餐馆位置的y坐标(相关功能待扩展)')
    created_at = fields.DatetimeField(auto_now_add=True, description='开业时间')
    
    class Meta:
        table = 'restaurant'
       

class UserTask(Model):
    """
    玩家任务表
    """
    id = fields.IntField(pk=True)
    user: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField(
        model_name='models.User',
        related_name='user_task',
        description='需要完成该任务的玩家'
    )
    status = fields.IntEnumField(
        enum_type=TaskStatus,
        null=False,
        default=TaskStatus.WAITING,
        description='任务状态'
    )
    