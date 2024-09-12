import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 사용자 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
    try {
        const { userId, password, name } = req.body;
        const regId = /^[a-z0-9]+$/;
        const regPw = /^.{6,}$/;
        if (!regId.test(userId)) {
            return res.status(409).json({ message: '아이디는 소문자와 숫자만으로 구성해야합니다.' });
        }

        if (!regPw.test(password)) {
            return res.status(409).json({ message: '비밀번호는 최소 6글자 이상이어야 합니다.' });
        }

        const isExistUser = await prisma.users.findFirst({
            where: {
                userId,
            },
        });

        if (isExistUser) {
            return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
        }

        // 사용자 비밀번호를 암호화합니다.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Users 테이블에 사용자를 추가합니다.
        const user = await prisma.users.create({
            data: { userId, password: hashedPassword, name },
        });

        return res.status(201).json({
            userId: userId,
            name: name,
            message: '회원가입이 완료되었습니다!'
        });
    } catch (err) {
        next(err);
    }
});

/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
    const { userId, password } = req.body;

    const user = await prisma.users.findFirst({ where: { userId } });

    if (!user)
        return res.status(401).json({ message: '존재하지 않는 아이디 입니다.' });
    // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
    else if (!(await bcrypt.compare(password, user.password)))
        return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

    // 로그인에 성공하면, 사용자의 userId 토큰 생성
    const token = jwt.sign(
        {
            userId: user.userId,
        },
        process.env.SECRET_KEY
    );
    res.header('authorization', `${process.env.TOKEN_TYPE} ${token}`);

    return res.status(200).json({ message: '로그인 성공 ! ' });
});

/** 사용자 조회 API **/
router.get('/users', authMiddleware, async (req, res, next) => {
    const { userId } = req.user;

    const user = await prisma.users.findFirst({
        where: { userId },
        select: {
            name: true,
            character: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return res.status(200).json({ data: user });
});

/** 사용자 삭제 API **/
router.delete('/users', authMiddleware, async (req, res, next) => {
    const { userId } = req.user;

    const user = await prisma.users.delete({
        where: { userId }
    });

    return res.status(200).json({ message: userId + '계정이 삭제되었습니다.' });
});
export default router;