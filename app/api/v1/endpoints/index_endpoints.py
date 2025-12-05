from fastapi import APIRouter


index_router = APIRouter()


@index_router.get('/')
async def index():
    """
    发起注册请求
    """
    return {
        "message": "就到这里啦，更多功能持续开发中"
    }
