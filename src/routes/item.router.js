import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 아이템 생성 API **/
router.post('/item', async (req, res, next) => {
    try {
        const { item_code, item_name, item_stat, item_price } = req.body;

        const isExistitemcode = await prisma.item.findFirst({
            where: {
                item_code,
            },
        });
        if (isExistitemcode) {
            return res.status(409).json({ message: '이미 존재하는 아이템 코드입니다.' });
        }
        // item 테이블에 아이템을 추가합니다.
        const item = await prisma.item.create({
            data: {
                item_code: item_code,
                item_name: item_name,
                item_price: item_price
            },
        });
        // itemStat 테이블에 아이템 스탯를 추가합니다.
        const itemStat = await prisma.itemStat.create({
            data: {
                item_code: item.item_code,
                bonusHealth: (item_stat.health === undefined) ? 0 : item_stat.health,
                bonusPower: (item_stat.power === undefined) ? 0 : item_stat.power,
            },
        });
        return res.status(201).json({
            item_code: item.item_code,
            message: item.item_name + '이 생성되었습니다.'
        });
    } catch (err) {
        next(err);
    }
});

/** 아이템 수정 API **/
router.put('/item/:item_code', async (req, res, next) => {
    const { item_code } = req.params;
    const { item_name, item_stat } = req.body;

    const item = await prisma.item.findUnique({
        where: { item_code: +item_code },
    });

    if (!item)
        return res.status(404).json({ message: '아이템이 존재하지 않습니다.' });

    await prisma.item.update({
        data: { item_name },
        where: {
            item_code: +item_code,
        },
    });

    await prisma.itemStat.update({
        data: {
            bonusHealth: (item_stat.health === undefined) ? 0 : item_stat.health,
            bonusPower: (item_stat.power === undefined) ? 0 : item_stat.power,
        },
        where: {
            item_code: +item_code,
        },
    });

    return res.status(200).json({ data: '아이템이 수정되었습니다.' });
});
/** 아이템 목록조회 API **/
router.get('/item', async (req, res, next) => {
    const item = await prisma.item.findMany({
        select: {
            item_code: true,
            item_name: true,
            item_price: true,
        },
    });

    return res.status(200).json({ data: item });
});

/** 아이템 상세조회 API **/
router.get('/item/:item_code', async (req, res, next) => {
    const { item_code } = req.params;
    const item = await prisma.item.findFirst({
        where: { item_code: +item_code },
        select: {
            item_code: true,
            item_name: true,
            item_price: true,
            itemStat: {
                select: {
                    bonusHealth: true,
                    bonusPower: true,
                },
            },
        },
    });

    return res.status(200).json({ data: item });
});

/** 아이템 삭제 API **/
router.delete('/item/:item_code', async (req, res, next) => {
    const { item_code } = req.params;

    const item = await prisma.item.findFirst({ where: { item_code: +item_code, } });

    if (!item)
        return res.status(404).json({ message: '아이템이 존재하지 않습니다.' });

    await prisma.item.delete({ where: { item_code: +item_code } });

    return res.status(200).json({ data: '아이템이 삭제되었습니다.' });
});

export default router;