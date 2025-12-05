import aiomysql
from decimal import Decimal
from typing import Optional, List, Dict, Union


async def link_to_sql(
        host: str,
        user: str,
        password: str,
        database: str
) -> aiomysql.Connection:
    """
    连接数据库
    :param host: 连接端口
    :param user: 用户名
    :param password: 数据库密码
    :param database: 要连接的数据库
    :return:
    """
    try:
        conn = await aiomysql.connect(
            host=host,
            port=3306,
            user=user,
            password=password,
            db=database,
            charset='utf8mb4',
            autocommit=True
        )
        return conn
    except Exception as e:
        print(f"连接数据库失败: {e}")


async def insert_data(
        conn,
        cursor,
        table_name: str,
        data_list: list[dict[str, int | float | str]],
        partition: str = None,
        is_truncate: bool = True,
        is_duplicate_update=True
):
    if not data_list:
        return

    BATCH_SIZE = 2000
    sample = data_list[0]
    columns = ', '.join(sample.keys())
    placeholders = ', '.join(['%s'] * len(sample))

    if is_truncate:
        if partition:
            truncate_query = f"ALTER TABLE {table_name} TRUNCATE PARTITION {partition}"
        else:
            truncate_query = f"TRUNCATE TABLE {table_name}"
        await cursor.execute(truncate_query)
        await conn.commit()

    if partition:
        insert_query = f"""INSERT INTO {table_name} 
                           PARTITION ({partition}) ({columns}) 
                           VALUES ({placeholders}) AS new"""
    else:
        insert_query = f"""INSERT INTO {table_name} ({columns}) 
                           VALUES ({placeholders}) AS new"""

    if is_duplicate_update:
        update_clauses = ', '.join([f"{col} = new.{col}" for col in sample.keys()])
        insert_query += f" ON DUPLICATE KEY UPDATE {update_clauses}"

    for i in range(0, len(data_list), BATCH_SIZE):
        batch = data_list[i:i + BATCH_SIZE]
        values_list = [tuple(record.values()) for record in batch]

        await cursor.executemany(insert_query, values_list)
        await conn.commit()


def select_data(
    cursor,
    table_name: str,
    partition: Optional[str] = None,
    *columns: tuple[str, str | None, any]
) -> List[Dict[str, Union[int, float, str, Decimal]]]:
    where_conditions: List[str] = []
    query_params: List[any] = []

    for condition in columns:
        if not isinstance(condition, tuple) or len(condition) != 3:
            print(f"无效的条件格式：{condition}，需为三值元组，已跳过")
            continue

        col_name, operator, threshold = condition

        if not isinstance(col_name, str) or not col_name.strip():
            print(f"无效的列名：{col_name}，已跳过该条件")
            continue

        if isinstance(operator, str):
            operator = operator.lower()
        if operator not in (None, "greater", "less", "equal"):
            print(f"不支持的操作符：{operator}，列名：{col_name}，已跳过")
            continue

        if operator is None:
            continue

        if operator == "greater":
            where_conditions.append(f"`{col_name}` > %s")
            query_params.append(threshold)
        elif operator == "less":
            where_conditions.append(f"`{col_name}` < %s")
            query_params.append(threshold)
        elif operator == "equal":
            if threshold is None:
                where_conditions.append(f"`{col_name}` IS NULL")
            else:
                where_conditions.append(f"`{col_name}` = %s")
                query_params.append(threshold)

    sql = f"SELECT * FROM `{table_name}`"

    if partition:
        sql += f" PARTITION (`{partition}`)"

    if where_conditions:
        sql += " WHERE " + " AND ".join(where_conditions)

    try:
        cursor.execute(sql, query_params)
        return cursor.fetchall()
    except Exception as e:
        print(f"查询失败：{str(e)}")
        print(f"执行的 SQL：{sql}")
        return []
