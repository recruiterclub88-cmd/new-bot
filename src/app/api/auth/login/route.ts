import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        // Перемінні з Vercel
        const adminUser = process.env.MY_ADMIN_USER || process.env.WEB_ADMIN_LOGIN || process.env.ADMIN_USER;
        const adminPass = process.env.MY_ADMIN_PASS || process.env.WEB_ADMIN_PASSWORD || process.env.ADMIN_PASS;

        // ХАРДКОД (Тимчасовий запасний варіант, якщо Vercel глючить)
        const backupUser = 'recruiterclub88@gmail.com';
        const backupPass = 'Elitkamen88';

        let isValid = false;

        // Перевірка 1: Через змінні Vercel
        if (adminUser && adminPass && username === adminUser && password === adminPass) {
            isValid = true;
        }
        // Перевірка 2: Через хардкод (якщо змінні не підтягнулися)
        else if (username === backupUser && password === backupPass) {
            isValid = true;
        }

        if (isValid) {
            const response = NextResponse.json({ success: true });
            const token = btoa(`${username}:${password}`);

            response.cookies.set('admin_session', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24
            });

            return response;
        }

        return NextResponse.json({
            error: 'INVALID_CREDENTIALS',
            debug: `Server side: ${adminUser ? 'EnvOK' : 'EnvMissing'}`
        }, { status: 401 });

    } catch (error) {
        return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
    }
}
