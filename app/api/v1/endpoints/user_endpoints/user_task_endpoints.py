from typing import Optional
from app.api.v1.endpoints.user_endpoints import user_router


@user_router.get('/tasks')
async def get_tasks():
    """
    获取今日任务
    :return:
    """
    pass


@user_router.post('/tasks')
async def complete_task(
    task_id: Optional[int] = None,
):
    """
    提交今日任务并领取奖励
    :param task_id: 要提交的任务
    :return:
    """
    pass
