from pathlib import Path


def find_project_root(start_path: Path) -> Path:
    """
    向上查找包含readme-zh.md或requirements.txt的项目根目录
    :param start_path: 起始路径，通常是脚本运行所在路径

    :return: 根目录绝对路径
    """
    current = start_path
    max_depth = 10  # 最大向上查找层数
    for _ in range(max_depth):
        if (current / 'readme-zh.md').exists() or (current / 'requirements.txt').exists():
            return current
        parent = current.parent
        if parent == current:
            break
        current = parent
    raise RuntimeError("无法找到包含'readme-zh.md'的项目根目录")