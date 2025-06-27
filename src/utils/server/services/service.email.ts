import nodemailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { isProduction } from './service.envs';

export interface ISendEmailOptions {
	emails: string[];
	subject: string;
	text?: string;
	attachments?: { path: string; filename: string; cid?: string }[];
	transporter?: {
		fromLabel: string;
		host: string;
		port: number;
		secure: boolean;
		auth: { user: string; pass: string };
		replyTo?: string;
	};
}

export class EMailManager {
	public transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

	constructor(
		public config: {
			transporter: {
				SMTP_HOST: string;
				SMTP_PORT: string;
				SMTP_SECURE: string;
				SMTP_USER: string;
				SMTP_PASSWORD: string;
				DEBUG_EMAIL: string;
			};
			environment: {
				isProduction: boolean;
				debugEmail: string;
				fromLabel: string;
			};
			footer: string;
		}
	) {
		this.transporter = nodemailer.createTransport({
			host: String(config.transporter.SMTP_HOST),
			port: Number(config.transporter.SMTP_PORT),
			secure: Boolean(config.transporter.SMTP_SECURE),
			auth: {
				user: String(config.transporter.SMTP_USER),
				pass: String(config.transporter.SMTP_PASSWORD),
			},
		});
	}

	public sendEmail = async (config: {
		to: string[];
		title: string;
		body?: string;
		bcc?: string[];
		attachments?: Attachment[];
		hideFooter?: boolean;
	}) => {
		const { to, title, body: text, attachments, bcc, hideFooter } = config;

		const emails = isProduction() ? to : [this.config.environment.debugEmail];

		const email = await this.transporter
			.sendMail({
				from: this.config.environment.fromLabel,
				to: emails.join(', '),
				subject: title,
				bcc,
				html: text + (hideFooter ? '' : this.config.footer),
				attachments,
			})
			.catch((error) => {
				console.error('Error sending email: ' + error.message, 'warning');
			});

		return email;
	};
}
