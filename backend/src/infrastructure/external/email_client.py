import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Any
from src.core.config import settings

logger = logging.getLogger(__name__)


def send_onsite_interview_email(
    to_email: str,
    candidate_name: str,
    subject: str,
    custom_message: str,
    interview_date_location: str
) -> bool:
    """
    Dispatches a customized Onsite Interview Invitation email to a candidate.
    Uses SMTP settings if configured, else logs dispatch payload for testing.
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }}
            .header {{ background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }}
            .content {{ padding: 32px; line-height: 1.6; }}
            .details-box {{ background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px; }}
            .footer {{ background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2 style="margin:0;">AI-Recruit360 Recruitment Portal</h2>
            </div>
            <div class="content">
                <h3>Dear {candidate_name},</h3>
                <p>Congratulations! Based on your exceptional performance during our initial screening and technical AI evaluation, our recruitment team is pleased to invite you for an <strong>Onsite / Final HR Technical Interview</strong>.</p>
                
                <div class="details-box">
                    <strong>Message from Recruitment Team:</strong><br/>
                    {custom_message}
                </div>

                <p><strong>Interview Venue / Schedule Details:</strong><br/>
                {interview_date_location}</p>

                <p>Please reply to this email to confirm your availability. We look forward to meeting you!</p>
                <br/>
                <p>Best regards,<br/><strong>Talent Acquisition Team</strong></p>
            </div>
            <div class="footer">
                Sent via AI-Recruit360 Autonomous Recruitment Intelligence Engine.
            </div>
        </div>
    </body>
    </html>
    """

    if settings.SMTP_PASSWORD and "your-" not in settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM_EMAIL
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())

            logger.info(f"Email invitation sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send SMTP email to {to_email}: {e}")
            return False

    # Test mode: Log dispatch event cleanly
    logger.info(f"[TEST EMAIL DISPATCH] To: {to_email} | Subject: {subject} | Venue: {interview_date_location}")
    return True
