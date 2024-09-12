import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 사용자 캐릭터 생성 API **/
router.post('/characters', authMiddleware, async (req, res, next) => {
    try {
        const { Id } = req.user;
        const { nickname } = req.body;

        const isExistName = await prisma.character.findFirst({
            where: {
                nickname,
            },
        });

        if (isExistName) {
            return res.status(409).json({ message: '이미 존재하는 캐릭터명 입니다.' });
        }

        // Character 테이블에 캐릭터를 추가합니다.
        const character = await prisma.character.create({
            data: { nickname, Id: Id, health: 500, power: 100, money: 10000 },
        });

        // CharacterId 조회
        const characterId = await prisma.character.findFirst({
            where: { nickname },
            select: {
                characterId: true,
            }
        });
        return res.status(201).json({
            characterId: characterId.characterId,
            message: '캐릭터가 생성되었습니다.'
        });
    } catch (err) {
        next(err);
    }
});


/** 사용자 캐릭터 조회 API **/
router.get('/characters/:characterId', authMiddleware, async (req, res, next) => {
    try {
        const { Id } = req.user;
        const { characterId } = req.params;
        let booleanData = true;

        const isMycharacter = await prisma.character.findFirst({
            where: {
                characterId: +characterId, Id: +Id
            },
        });

        if (!isMycharacter) {
            booleanData = false;
        }
        const character = await prisma.character.findFirst({
            where: { characterId: +characterId },
            select: {
                nickname: true,
                health: true,
                power: true,
                money: booleanData
            },
        });

        return res.status(200).json({ data: character });
    } catch (err) {
        next(err);
    }
});

/** 사용자 캐릭터 삭제 API **/
router.delete('/characters/:characterId', authMiddleware, async (req, res, next) => {
    try {
        const { Id } = req.user;
        const { characterId } = req.params;

        const isMycharacter = await prisma.character.findFirst({
            where: {
                characterId: +characterId, Id: +Id
            },
        });

        const deleteCharacter = await prisma.character.delete({
            where: { characterId: +characterId, Id: +Id }
        });

        return res.status(200).json({ message: characterId + ' 캐릭터를 삭제했습니다.' });
    } catch (err) {
        next(err);
    }
});

export default router;