import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId, pledge, status, email } = req.body;

      // 알림 저장
      const notification = await prisma.notification.create({
        data: {
          userId,
          pledge,
          status,
        },
      });

      // 이메일 알림 전송
      if (email) {
        const subscribers = await prisma.subscription.findMany({
          where: {
            type: 'email',
            email,
          },
        });

        for (const subscriber of subscribers) {
          await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: subscriber.email || '',
            subject: '공약 이행 상태 알림',
            html: `
              <h1>공약 이행 상태 알림</h1>
              <p>공약: ${pledge}</p>
              <p>상태: ${status}</p>
              <p>시간: ${new Date().toLocaleString()}</p>
            `,
          });
        }
      }

      // 푸시 알림 전송
      const pushSubscribers = await prisma.subscription.findMany({
        where: {
          type: 'push',
        },
      });

      for (const subscriber of pushSubscribers) {
        try {
          const webpush = require('web-push');
          webpush.setVapidDetails(
            'mailto:' + process.env.SMTP_FROM,
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
          );

          await webpush.sendNotification(
            subscriber.subscription,
            JSON.stringify({
              title: '공약 이행 상태 알림',
              body: `${pledge}: ${status}`,
            })
          );
        } catch (error) {
          console.error('Error sending push notification:', error);
        }
      }

      res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  } else if (req.method === 'GET') {
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: {
          sentAt: 'desc',
        },
        take: 10,
      });
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 