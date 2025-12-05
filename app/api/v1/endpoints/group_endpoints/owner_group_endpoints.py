from app.api.v1.endpoints.group_endpoints import group_router


@group_router.put('/{group_uid}/admin/{user_uid}')
async def handle_group_admin_endpoint(group_uid, user_uid):
    pass


@group_router.put('/{group_uid}/owner/{user_uid}')
async def handle_group_owner_endpoint(group_uid, user_uid):
    pass
    
    
@group_router.delete('/{group_uid}')
async def dissolve_group_endpoint():
    pass