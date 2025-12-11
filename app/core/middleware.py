import time
from typing import Any
from fastapi import Request
from log.log_config.service_logger import info_logger


async def log_middleware(request: Request, call_next) -> Any:
    start_time = time.time()
    info_logger.info(f"Received: {request.method} {request.url} | ip_address: {request.client.host} | payload: {request.body}")

    response = await call_next(request)

    duration = time.time() - start_time
    info_logger.info(f"Completed: {request.method} {request.url} | Status: {response.status_code} | Duration: {duration:.2f}s")
    return response
