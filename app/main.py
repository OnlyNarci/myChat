from tortoise.contrib.fastapi import register_tortoise

from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.core.config import TORTOISE_ORM_CONFIG, settings, frontend_dir
from app.core.exceptions import RedirectionError, ServerError, ClientError, handle_http_exception
from app.core.middleware import log_middleware
from app.core.security import validate_session_request
from app.api.v1.endpoints import index_router, card_router, user_router, store_router, group_router


app = FastAPI(
    dependencies=[Depends(validate_session_request)]
)
# 路由分发
app.include_router(index_router)
app.include_router(card_router, prefix='/card')
app.include_router(store_router, prefix='/store')
app.include_router(user_router, prefix='/player')
app.include_router(group_router, prefix='/groups')

# orm模型初始化
register_tortoise(
    app=app,
    config=TORTOISE_ORM_CONFIG,
)

# 跨域请求中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# 自定义中间件
app.middleware("http")(log_middleware)

# 挂载前端页面目录作为静态文件目录
app.mount("/frontend", StaticFiles(directory=frontend_dir), name="frontend")

# 注册异常响应逻辑
app.exception_handler(RedirectionError)(handle_http_exception)
app.exception_handler(ClientError)(handle_http_exception)
app.exception_handler(ServerError)(handle_http_exception)
app.exception_handler(RequestValidationError)(handle_http_exception)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
