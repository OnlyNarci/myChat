import openpyxl
import asyncio
from tortoise import Tortoise
from app.db.models import Card
from app.core.config import TORTOISE_ORM_CONFIG


async def init_db():
    await Tortoise.init(config=TORTOISE_ORM_CONFIG)
    
    
async def main():
    await init_db()
    wb = openpyxl.load_workbook('cards.xlsx')
    ws = wb.active
    for row in ws.iter_rows():
        await Card.create(
            name=row[0].value,
            rarity=row[2].value,
            package=row[3].value,
            unlock_level=1,
            description=row[5].value,
            compose_materials={},
            decompose_materials={}
        )


asyncio.run(main())
