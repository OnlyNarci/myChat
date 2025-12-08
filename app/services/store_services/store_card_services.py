from datetime import datetime, timedelta, UTC
from typing import Optional, List
from tortoise.queryset import Q
from tortoise.transactions import atomic
from app.core.exceptions import UnAtomicError
from app.core.extra_params import extra_params
from app.schemas.card_schemas import StoreCardParams
from app.db.models import Store, User, UserCard, StoreRecord


async def query_store_service(
	user_id: int,
	package: Optional[str] = None,
	name_in: Optional[str] = None,
	price_le: Optional[int] = None,
	price_ge: Optional[int] = None,
) -> List[StoreCardParams]:
	"""
	查看在售卡牌，可选名称或价格作为查询参数。
	
	:param user_id: 用户id, 用于过滤用户等级未解锁的卡牌
	:param package: 扩展包名称
	:param name_in: 卡牌名称中包含的字符串（模糊查询）
	:param price_le: 价格小于等于此值
	:param price_ge: 价格大于等于此值
	
	:return: 查询结果卡牌列表
	"""
	# 1.查询用户等级
	user = await User.get(id=user_id)
	# 2.使用 Q 对象构建查询条件
	query = Q(card__unlock_level__gte=user.level)
	if package is not None:
		query &= Q(card__package=package)
	if name_in is not None:
		query &= Q(card__name__icontains=name_in)
	
	query &= Q(is_publish=True)     # 为了利用复合索引，把这一参数写在中间
	
	if price_le is not None:
		query &= Q(price__lte=price_le)
	if price_ge is not None:
		query &= Q(price__gte=price_ge)

	store_items = await Store.filter(query).select_related('card', 'owner').all()
	
	# 3.将要返回的数据组织为pydantic.BaseModel
	cards = [
		StoreCardParams(
			card_id=store_card.card.id,
			store_id=store_card.id,
			name=store_card.card.name,
			image=store_card.card.image,
			rarity=store_card.card.rarity,
			package=store_card.card.package,
			description=store_card.card.description,
			number=store_card.number,
			price=store_card.price,
			owner_name=store_card.owner.name,
			is_publish=True,
		)
		for store_card in store_items
	]

	return cards


async def query_friend_store_service(
	store_user_uid: str
) -> List[StoreCardParams]:
	"""
	查看好友商店在售的所有卡牌
	
	:return: 好友商店在售的所有卡牌
	"""
	# 1.查询指定用户商店的所有卡牌
	store_items = await Store.filter(
		owner__uid=store_user_uid,
	).select_related('card', 'owner').all()
	
	# 2.将要返回的数据组织为pydantic.BaseModel
	cards = [
		StoreCardParams(
			card_id=store_card.card.id,
			store_id=store_card.id,
			name=store_card.card.name,
			image=store_card.card.image,
			rarity=store_card.card.rarity,
			package=store_card.card.package,
			description=store_card.card.description,
			number=store_card.number,
			price=store_card.price,
			owner_name=store_card.owner.name,
			is_publish=store_card.is_publish
		)
		for store_card in store_items
	]
	
	return cards


@atomic()
async def list_card_service(
	user_id: int,
	card_to_list: StoreCardParams,
) -> None:
	"""
	向商店中上架卡牌
	
	:param user_id: 买家 id
	:param card_to_list: 目标上架卡牌
	
	:return: 上架成功返回None
	"""
	# 1.确定卖家有足够的卡牌
	seller_card = await UserCard.filter(
		user_id=user_id,
		card_id=card_to_list.card_id,
	).select_for_update().first()
	if not seller_card:
		raise UnAtomicError(message='card not found')
	elif seller_card.number < card_to_list.number:
		raise UnAtomicError(message='card not enough')
		
	# 2.扣除卖家已上架的卡牌
	seller_card.number -= card_to_list.number
	if seller_card.number == 0:
		await seller_card.delete()
	else:
		await seller_card.save()

	# 3.商店中有该卖家上架的该卡牌则增加数量，没有则新建
	store_card = await Store.filter(
		card_id=card_to_list.card_id,
		owner_id=user_id
	).select_for_update().first()
	if store_card:
		store_card.number += card_to_list.number
		store_card.price = card_to_list.price
		await store_card.save()
		
	else:
		await Store.create(
			card_id=card_to_list.card_id,
			owner_id=user_id,
			number=card_to_list.number,
			price=card_to_list.price,
			is_publish=card_to_list.is_publish,
		)
	
	return None


@atomic()
async def buy_card_service(
	user_id: int,
	card_to_buy: StoreCardParams,
	except_slippage: Optional[int] = None,
	is_publish: bool = True,
) -> int:
	"""
	从商店中购买卡牌
	
	:param user_id: 买家 id
	:param card_to_buy: 目标购买卡牌
	:param except_slippage: 当目标购买卡牌不存在于商店表时（被他人购买或下架），购买相同卡牌接受的价格滑点
	:param is_publish: 是否允许购买不公开（仅好友可见）的卡牌

	:return: 购买卡牌消耗的比特
	"""
	# 1.确定商店中目标购买卡牌存在
	store_card = await Store.filter(
		id=card_to_buy.store_id,
		is_publish=is_publish,
	).select_related('card', 'owner').select_for_update().first()
	if not store_card:
		if except_slippage is None:
			raise UnAtomicError(message='card not found')

		else:
			store_card = await Store.filter(
				card__id=card_to_buy.card_id,
				is_publish=True         # 滑点购买自动检索只能检索公开购买的卡牌
			).select_related('card', 'owner').order_by('price').select_for_update().first()
			
			if not store_card:
				raise UnAtomicError(message='card not found with except_slippage')
			elif store_card.number < card_to_buy.number or store_card.price < card_to_buy.price + except_slippage:
				raise UnAtomicError(message='card not found with except_slippage')
	elif store_card.number < card_to_buy.number or card_to_buy.price < store_card.price:
		raise UnAtomicError(message='card not found')
	
	# 2.确定买家和卖家不是同一人
	if user_id == store_card.owner.id:
		raise UnAtomicError(message='can not buy self card')
	
	# 3.确认买家24小时购买数量在限定次数以下
	twenty_four_hours_ago = datetime.now(UTC) - timedelta(hours=24)
	buy_count = await StoreRecord.filter(
		buyer_id=user_id,
		created_at__gte=twenty_four_hours_ago
	).count()
	if buy_count >= extra_params.MAX_TRADE_DAY:
		raise UnAtomicError(message='trade today too march')
	
	# 4.确定买家有足够比特且等级高于卡牌解锁等级
	need_byte = store_card.price * card_to_buy.number
	buyer = await User.filter(id=user_id).select_for_update().first()
	if buyer.byte < need_byte:
		raise UnAtomicError(message='user byte not enough', need_byte=need_byte)
	elif buyer.level < store_card.card.unlock_level:
		raise UnAtomicError(message='user level not enough', unlock_level=store_card.card.unlock_level)
	
	# 5.更新用户-卡牌关系表，使买家获得卡牌（不存在则创建，存在则增加持有数量）
	user_card = await UserCard.filter(
		user_id=buyer.id,
		card_id=store_card.card.id
	).select_for_update().first()
	
	if user_card:
		user_card.number += card_to_buy.number
		await user_card.save()
	else:
		await UserCard.create(
			user_id=buyer.id,
			card_id=store_card.card.id,
			number=card_to_buy.number
		)
	
	# 6.扣除买家购买卡牌需要的比特
	buyer.byte -= need_byte
	await buyer.save()
	
	# 7.为卖家增加出售卡牌获得的比特（如果需要收取手续费在此修改）
	seller = await User.filter(id=store_card.owner.id).select_for_update().first()
	seller.byte += need_byte
	await seller.save()
	
	# 8.扣除商店表中已被购买的卡牌
	store_card.number -= card_to_buy.number
	if store_card.number == 0:
		await store_card.delete()
	else:
		await store_card.save()
		
	# 9.记录购买记录
	await StoreRecord.create(
		buyer_id=buyer.id,
		seller_id=seller.id,
		card_id=store_card.card.id,
		number=card_to_buy.number,
		price=store_card.price,
	)
	
	return need_byte


@atomic()
async def delist_card_service(
	user_id: int,
	card_to_delist: StoreCardParams,
) -> int:
	"""
	从商店中下架指定数量的卡牌
	
	:param user_id: 用户 id
	:param card_to_delist: 目标下架卡牌

	:return: 商店中的卡牌数量不足目标数量的量
	"""
	# 1.确认商店中待下架的卡牌存在
	store_card = await Store.filter(
		card_id=card_to_delist.card_id,
		owner_id=user_id,
	).select_for_update().first()
	if not store_card:
		raise UnAtomicError(message='card not found')
	elif store_card.number < card_to_delist.number:
		require_num = card_to_delist.number - store_card.number
	else:
		require_num = 0
	
	# 2.为用户增加下架后的卡牌
	user_card = await UserCard.filter(
		user_id=user_id,
		card_id=card_to_delist.card_id
	).select_for_update().first()
	if user_card:
		user_card.number += store_card.number
		await user_card.save()
	else:
		await UserCard.create(
			user_id=user_id,
			card_id=card_to_delist.card_id,
			number=store_card.number,
		)
	
	# 3.扣除商店中下架的卡牌
	store_card.number -= card_to_delist.number
	if store_card.number == 0:
		await store_card.delete()
	else:
		await store_card.save()
		
	return require_num
