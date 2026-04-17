import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || 'DEVOPS AFRICA <dawf@edtmsys.com>';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

/** Plain server utility — do not mark as a Server Action; auth callbacks call this directly. */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Re-export email templates from the templates file
export {
  birthdayWishTemplate,
  childbirthCongratulationsTemplate,
  childbirthAnnouncementTemplate,
  marriageCongratulationsTemplate,
  marriageAnnouncementTemplate,
  upcomingEventTemplate,
  conferenceRoomBookingTemplate,
  monthlySummaryTemplate,
  roomBookingApprovedTemplate,
  roomBookingRejectedTemplate,
  leaveRequestApprovedTemplate,
  leaveRequestRejectedTemplate,
} from './email-templates';
