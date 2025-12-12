import logging
from pathlib import Path


def setup_logging(
        log_path: Path,
        info_log_name: str = None,
        err_log_name: str = None,
        logger_name: str = None,
) -> list[logging.Logger]:
    """
    配置日志系统，创建正常和异常日志记录器
    :param log_path: 日志存储路径
    :param info_log_name: 正常日志记录名称
    :param err_log_name: 异常日志记录名称
    :param logger_name: 日志对象唯一名称

    :return: 日志配置对象
    """
    # 配置日志
    log_path.mkdir(parents=True, exist_ok=True)  # 创建日志目录
    logger_list = []

    if info_log_name:
        # 配置成功日志
        success_log_path = log_path / info_log_name
        success_logger = logging.getLogger(f'{logger_name}_success')
        success_logger.setLevel(logging.INFO)
        success_handler = logging.FileHandler(success_log_path)
        success_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        success_handler.setFormatter(success_formatter)
        success_logger.addHandler(success_handler)
        logger_list.append(success_logger)

    if err_log_name:
        # 配置错误日志
        error_log_path = log_path / err_log_name
        error_logger = logging.getLogger(f'{logger_name}_error')
        error_logger.setLevel(logging.ERROR)
        error_handler = logging.FileHandler(error_log_path)
        error_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        error_handler.setFormatter(error_formatter)
        error_logger.addHandler(error_handler)
        logger_list.append(error_logger)

    return logger_list
