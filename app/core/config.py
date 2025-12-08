from pathlib import Path
from app.utils import find_project_root


class Settings:
    # 应用基本配置
    PROJECT_NAME: str = "Narcissus TCG"
    PROJECT_VERSION: str = "0.8.0"

    # 数据库配置（基于项目现有参数）
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = 'binfen020617'
    DB_NAME: str = "narcissus_tcg"
    DB_CHARSET: str = "utf8mb4"

    # 连接池配置
    DB_POOL_MIN_SIZE: int = 5
    DB_POOL_MAX_SIZE: int = 20
    DB_POOL_RECYCLE: int = 300  # 连接回收时间（秒）

    # 会话参数配置
    SESSION_EXPIRE_HOURS = 120
    SERVER_PORT: int = 8000
    SERVER_HOST: str = "127.0.0.1"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:8000", "http://127.0.0.1:8000", "http://localhost:5173"]

    class Config:
        case_sensitive = True  # 保持配置项大小写敏感


# 实例化配置对象，供其他模块导入使用
settings = Settings()


class BaseAttribute:
    PACKAGES = {'base'}


TORTOISE_ORM_CONFIG = {
        'connections': {
            'default': {
                'engine': 'tortoise.backends.mysql',  # 异步后端引擎
                'credentials': {
                    'host': settings.DB_HOST,
                    'port': settings.DB_PORT,
                    'user': settings.DB_USER,
                    'password': settings.DB_PASSWORD,
                    'database': settings.DB_NAME,
                    'minsize': settings.DB_POOL_MIN_SIZE,
                    'maxsize': settings.DB_POOL_MAX_SIZE,
                    'charset': settings.DB_CHARSET,
                    'echo': True,
                }
            }
        },
        'apps': {
            'models': {
                'models': ['app.db.models', 'aerich.models'],
                'default_connection': 'default',
            }
        },
        'use_tz': False,
        'timezone': 'Asia/Shanghai',
    }


current_dir = Path(__file__).parent.resolve()
project_root = find_project_root(current_dir)
frontend_dir = project_root / 'frontend'
