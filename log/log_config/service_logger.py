from .setup_logging import setup_logging
from app.utils.find_project_root import find_project_root
from pathlib import Path
from logging import Logger


def service_logger_setup() -> tuple[Logger, Logger]:
    # 动态查找项目根目录（基于readme-zh.md文件）
    current_dir = Path(__file__).parent.resolve()
    project_root = find_project_root(current_dir)
    log_dir = project_root / 'log' / 'log_lib' / 'service'
    loggers = setup_logging(
        log_path=log_dir,
        info_log_name='service.log',
        err_log_name='service.err',
        logger_name='service'
    )
    information_logger = loggers[0] if loggers else None
    error_logger = loggers[1] if loggers else None
    return information_logger, error_logger


info_logger, err_logger = service_logger_setup()
