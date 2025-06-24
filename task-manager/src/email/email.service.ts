import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendTaskAssignedEmail(to: string, taskTitle: string, assignedBy: string): Promise<void> {
    const subject = '새로운 작업이 할당되었습니다';
    const html = `
      <h2>새로운 작업 할당</h2>
      <p><strong>${assignedBy}</strong>님이 새로운 작업을 할당하였습니다.</p>
      <p><strong>작업 제목:</strong> ${taskTitle}</p>
      <p>작업을 확인하고 진행해 주세요.</p>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendTaskDueEmail(to: string, taskTitle: string, dueDate: Date): Promise<void> {
    const subject = '작업 마감일 알림';
    const html = `
      <h2>작업 마감일 알림</h2>
      <p><strong>작업 제목:</strong> ${taskTitle}</p>
      <p><strong>마감일:</strong> ${dueDate.toLocaleDateString('ko-KR')}</p>
      <p>마감일이 다가왔습니다. 작업을 확인해 주세요.</p>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendCommentNotificationEmail(to: string, taskTitle: string, commentAuthor: string): Promise<void> {
    const subject = '새로운 댓글 알림';
    const html = `
      <h2>새로운 댓글</h2>
      <p><strong>${commentAuthor}</strong>님이 댓글을 남겼습니다.</p>
      <p><strong>작업 제목:</strong> ${taskTitle}</p>
      <p>댓글을 확인해 주세요.</p>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendProjectInviteEmail(to: string, projectName: string, invitedBy: string): Promise<void> {
    const subject = '프로젝트 초대';
    const html = `
      <h2>프로젝트 초대</h2>
      <p><strong>${invitedBy}</strong>님이 프로젝트에 초대하였습니다.</p>
      <p><strong>프로젝트 이름:</strong> ${projectName}</p>
      <p>프로젝트에 참여해 주세요.</p>
    `;

    await this.sendEmail(to, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@taskmanager.com'),
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}
